import 'dotenv/config';
import Typesense from 'typesense';
import { MongoClient } from 'mongodb';

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
  connectionTimeoutSeconds: 8,
});

function firstLetter(name) {
  if (!name) return 'Other';
  const L = String(name).charAt(0).toUpperCase();
  return /^[A-Z]$/.test(L) ? L : 'Other';
}

async function main() {
  console.log('Connecting Mongo…');
  const mongo = new MongoClient(MONGODB_URI);
  await mongo.connect();
  const db = mongo.db(MONGO_DB_NAME);

  const collectionName = 'brands';

  // NOTE: created_at is required (not optional) because it's the default_sorting_field
  const schema = {
    name: collectionName,
    fields: [
      { name: 'id', type: 'string' },
      { name: 'slug', type: 'string' },
      { name: 'name', type: 'string' },
      { name: 'name_display', type: 'string', optional: true },
      { name: 'country', type: 'string', facet: true, optional: true },
      { name: 'perfumes_count', type: 'int32', optional: true },
      { name: 'description', type: 'string', optional: true },
      { name: 'first_letter', type: 'string', facet: true },
      { name: 'created_at', type: 'int64' }, // required
    ],
    default_sorting_field: 'created_at',
  };

  console.log('Ensuring Typesense collection…');
  try {
    await client.collections(collectionName).delete();
    console.log('Deleted existing Typesense collection:', collectionName);
  } catch {
    console.log('No prior collection to delete.');
  }
  await client.collections().create(schema);
  console.log('Created schema');

  console.log('Fetching brands from Mongo…');
  const docs = await db
    .collection('brands')
    .find(
      {},
      {
        projection: {
          _id: 1,
          slug: 1,
          name: 1,
          name_display: 1,
          country: 1,
          perfumes_count: 1,
          description: 1,
          created_at: 1,
        },
      }
    )
    .toArray();

  const nowSec = Math.floor(Date.now() / 1000);
  const mapped = docs.map((b) => ({
    id: String(b._id),
    slug: b.slug,
    name: b.name,
    name_display: b.name_display,
    country: b.country,
    perfumes_count: typeof b.perfumes_count === 'number' ? b.perfumes_count : undefined,
    description:
      typeof b.description === 'string'
        ? b.description.slice(0, 800)
        : undefined,
    first_letter: firstLetter(b.name),
    created_at: b.created_at
      ? Math.floor(new Date(b.created_at).getTime() / 1000)
      : nowSec, // ensure present for all docs
  }));

  console.log(`Importing ${mapped.length} brands to Typesense…`);
  const result = await client
    .collections(collectionName)
    .documents()
    .import(mapped, { action: 'upsert' });

  const failed = result.filter((r) => r.success === false);
  if (failed.length) {
    console.error('Some documents failed to import (first 5):', failed.slice(0, 5));
  } else {
    console.log('Import complete with no failures.');
  }

  await mongo.close();
  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});