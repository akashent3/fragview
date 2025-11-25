import 'dotenv/config';
import Typesense from 'typesense';
import { MongoClient } from 'mongodb';

// ---------------------------------------------------------
// 1. Environment & Setup (Copied from your file)
// ---------------------------------------------------------
function getEnv(name, fallback) {
  const v = process.env[name];
  if (!v && fallback === undefined) {
    console.error(`Missing required env: ${name}`);
    process.exit(1);
  }
  return v ?? fallback;
}

const MONGODB_URI = getEnv('MONGODB_URI');
const MONGO_DB_NAME = getEnv('MONGO_DB_NAME', 'fragview');

const TS_API_KEY = getEnv('TYPESENSE_API_KEY');
const TS_HOST = getEnv('TYPESENSE_HOST');
const TS_PORT = parseInt(getEnv('TYPESENSE_PORT', '443'), 10);
const TS_PROTOCOL = getEnv('TYPESENSE_PROTOCOL', 'https');

const client = new Typesense.Client({
  nodes: [{ host: TS_HOST, port: TS_PORT, protocol: TS_PROTOCOL }],
  apiKey: TS_API_KEY,
  connectionTimeoutSeconds: 60, // Increased timeout for heavy aggregation
});

// ---------------------------------------------------------
// 2. Helpers for Data Extraction
// ---------------------------------------------------------

// Helper to normalize mixed string/object arrays (like accords)
function extractNames(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => {
      if (typeof item === 'string') return item.trim();
      if (item && typeof item === 'object') {
        return (item.name || item.label || '').trim();
      }
      return '';
    })
    .filter((s) => s.length > 0);
}

// ---------------------------------------------------------
// 3. Main Logic
// ---------------------------------------------------------
async function main() {
  console.log('Connecting Mongo…');
  const mongo = new MongoClient(MONGODB_URI);
  await mongo.connect();
  const db = mongo.db(MONGO_DB_NAME);

  console.log('Fetching all perfumes to extract unique values…');
  
  // Fetch only the fields we need to generate the unique lists
  const cursor = db.collection('perfumes').find(
    {},
    {
      projection: {
        perfumers: 1,
        accords: 1,
        'pyramids.top': 1,
        'pyramids.middle': 1,
        'pyramids.base': 1,
      },
    }
  );

  // Sets to store unique values
  const uniquePerfumers = new Set();
  const uniqueAccords = new Set();
  const uniqueNotes = new Set(); // For the 'pyramids' collection

  let count = 0;
  while (await cursor.hasNext()) {
    const p = await cursor.next();
    count++;
    if (count % 1000 === 0) process.stdout.write('.');

    // 1. Extract Perfumers
    if (p.perfumers) {
      // Handle both array of strings/objects or single string
      const list = Array.isArray(p.perfumers) ? p.perfumers : [p.perfumers];
      extractNames(list).forEach((name) => uniquePerfumers.add(name));
    }

    // 2. Extract Accords
    if (p.accords) {
      extractNames(p.accords).forEach((name) => uniqueAccords.add(name));
    }

    // 3. Extract Pyramid Notes (Top, Middle, Base)
    if (p.pyramids) {
      if (p.pyramids.top) extractNames(p.pyramids.top).forEach((n) => uniqueNotes.add(n));
      if (p.pyramids.middle) extractNames(p.pyramids.middle).forEach((n) => uniqueNotes.add(n));
      if (p.pyramids.base) extractNames(p.pyramids.base).forEach((n) => uniqueNotes.add(n));
    }
  }
  console.log(`\nScanned ${count} documents.`);

  // ---------------------------------------------------------
  // 4. Sync to Typesense
  // ---------------------------------------------------------

  // Helper to recreate collection and upload data
  async function syncCollection(collectionName, dataSet) {
    const schema = {
      name: collectionName,
      fields: [
        { name: 'name', type: 'string' },
        { name: 'id', type: 'string' }, // Helper ID
      ],
      // Simple sorting by name if needed, or default text match
    };

    console.log(`\n--- Processing ${collectionName} ---`);
    console.log(`Found ${dataSet.size} unique items.`);

    // Convert Set to Array of Objects
    const documents = Array.from(dataSet).map((name, index) => ({
      id: String(index), // Simple ID
      name: name,
    }));

    if (documents.length === 0) {
      console.log(`Skipping ${collectionName} (no data found).`);
      return;
    }

    // Reset Collection
    try {
      await client.collections(collectionName).delete();
      console.log(`Deleted existing collection: ${collectionName}`);
    } catch {
      // Ignore if didn't exist
    }

    await client.collections().create(schema);
    console.log(`Created schema for: ${collectionName}`);

    // Import in batches
    try {
      const result = await client
        .collections(collectionName)
        .documents()
        .import(documents, { action: 'upsert' });

      const failed = result.filter((r) => r.success === false);
      if (failed.length) {
        console.error(`Errors importing ${collectionName}:`, failed.slice(0, 3));
      } else {
        console.log(`Successfully imported ${documents.length} items into '${collectionName}'.`);
      }
    } catch (err) {
      console.error(`Critical error importing ${collectionName}:`, err.message);
    }
  }

  // Execute Syncs
  await syncCollection('perfumers', uniquePerfumers);
  await syncCollection('accords', uniqueAccords);
  await syncCollection('pyramids', uniqueNotes); // User requested name 'pyramids' for notes

  await mongo.close();
  console.log('\nDone.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});