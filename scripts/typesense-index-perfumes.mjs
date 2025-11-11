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

async function main() {
  console.log('Connecting Mongo…');
  const mongo = new MongoClient(MONGODB_URI);
  await mongo.connect();
  const db = mongo.db(MONGO_DB_NAME);

  const collectionName = 'perfumes';

  // NOTE: created_at is required (not optional) because it's the default_sorting_field
  const schema = {
    name: collectionName,
    fields: [
      { name: 'id', type: 'string' },
      { name: 'slug', type: 'string' },
      { name: 'brand_name', type: 'string', facet: true },
      { name: 'variant_name', type: 'string' },
      { name: 'gender', type: 'string', facet: true },
      { name: 'rating', type: 'float', optional: true },
      { name: 'accords', type: 'string[]', optional: true },
      { name: 'description', type: 'string', optional: true },
      { name: 'image', type: 'string', optional: true },
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

  console.log('Fetching perfumes from Mongo…');
  const docs = await db
    .collection('perfumes')
    .find(
      {},
      {
        projection: {
          _id: 1,
          slug: 1,
          brand_name: 1,
          variant_name: 1,
          gender: 1,
          rating: 1,
          accords: 1,
          description: 1,
          image: 1,
          created_at: 1,
        },
      }
    )
    .toArray();

  const nowSec = Math.floor(Date.now() / 1000);
  const mapped = docs.map((p) => ({
    id: String(p._id),
    slug: p.slug,
    brand_name: p.brand_name,
    variant_name: p.variant_name,
    gender: p.gender || '',
    rating: typeof p.rating === 'number' ? p.rating : undefined,
    accords: Array.isArray(p.accords)
      ? p.accords
          .map((a) =>
            typeof a === 'string' ? a : a?.name || a?.label || ''
          )
          .filter(Boolean)
      : undefined,
    description:
      typeof p.description === 'string'
        ? p.description.slice(0, 1000)
        : undefined,
    image: p.image,
    created_at: p.created_at
      ? Math.floor(new Date(p.created_at).getTime() / 1000)
      : nowSec, // ensure present for all docs
  }));

  console.log(`Importing ${mapped.length} perfumes to Typesense…`);
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