import 'dotenv/config';
import Typesense from 'typesense';
import { MongoClient } from 'mongodb';

const DB_NAME = process.env.MONGO_DB_NAME || 'fragview';

function getTypesenseClient() {
  if (
    !process.env.TYPESENSE_HOST ||
    !process.env.TYPESENSE_API_KEY ||
    !process.env.TYPESENSE_PROTOCOL
  ) {
    throw new Error('Typesense env vars not set (TYPESENSE_HOST / TYPESENSE_API_KEY / TYPESENSE_PROTOCOL).');
  }
  return new Typesense.Client({
    nodes: [
      {
        host: process.env.TYPESENSE_HOST,
        port: Number(process.env.TYPESENSE_PORT || 443),
        protocol: process.env.TYPESENSE_PROTOCOL,
      },
    ],
    apiKey: process.env.TYPESENSE_API_KEY,
    connectionTimeoutSeconds: 8,
  });
}

async function ensureCollections(ts) {
  // PERFUMES
  let needCreatePerfumes = false;
  try {
    await ts.collections('perfumes').retrieve();
    console.log('Perfumes collection exists.');
  } catch {
    needCreatePerfumes = true;
  }

  if (needCreatePerfumes) {
    console.log('Creating perfumes collection…');
    // rating must NOT be optional if used as default_sorting_field
    await ts.collections().create({
      name: 'perfumes',
      fields: [
        { name: 'id', type: 'string' },
        { name: 'slug', type: 'string' },
        { name: 'brand_name', type: 'string', facet: true },
        { name: 'variant_name', type: 'string' },
        { name: 'gender', type: 'string', facet: true }, // can leave present; empty string is fine
        { name: 'rating', type: 'float' },               // not optional when used in default_sorting_field
      ],
      default_sorting_field: 'rating',
    });
  }

  // BRANDS
  let needCreateBrands = false;
  try {
    await ts.collections('brands').retrieve();
    console.log('Brands collection exists.');
  } catch {
    needCreateBrands = true;
  }

  if (needCreateBrands) {
    console.log('Creating brands collection…');
    // perfumes_count must NOT be optional when used as default_sorting_field
    await ts.collections().create({
      name: 'brands',
      fields: [
        { name: 'id', type: 'string' },
        { name: 'slug', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'country', type: 'string', facet: true },
        { name: 'perfumes_count', type: 'int32' },       // not optional
      ],
      default_sorting_field: 'perfumes_count',
    });
  }
}

async function run() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not set in .env');
  }

  const ts = getTypesenseClient();
  await ensureCollections(ts);

  // Mongo connection
  const mongo = new MongoClient(process.env.MONGODB_URI);
  await mongo.connect();
  const db = mongo.db(DB_NAME);
  const perfumesCol = db.collection('perfumes');
  const brandsCol = db.collection('brands');

  // Load data
  const perfumes = await perfumesCol
    .find({}, { projection: { _id: 1, brand_name: 1, variant_name: 1, slug: 1, gender: 1, rating: 1 } })
    .toArray();

  const brands = await brandsCol
    .aggregate([
      {
        $project: {
          _id: 1,
          name: 1,
          slug: 1,
          country: 1,
          perfumes_count: { $size: { $ifNull: ['$perfumes', []] } },
        },
      },
    ])
    .toArray();

  // Import (upsert) — ensure numeric values are always present
  console.log(`Indexing ${perfumes.length} perfumes…`);
  await ts.collections('perfumes').documents().import(
    perfumes
      .map((p) => ({
        id: String(p._id),
        slug: p.slug || '',
        brand_name: p.brand_name || '',
        variant_name: p.variant_name || '',
        gender: p.gender || '',
        rating: typeof p.rating === 'number' ? p.rating : 0, // guarantee numeric
      }))
      .map((d) => JSON.stringify(d))
      .join('\n'),
    { action: 'upsert' }
  );

  console.log(`Indexing ${brands.length} brands…`);
  await ts.collections('brands').documents().import(
    brands
      .map((b) => ({
        id: String(b._id),
        slug: b.slug || '',
        name: b.name || '',
        country: b.country || '',
        perfumes_count: Number.isFinite(b.perfumes_count) ? b.perfumes_count : 0, // guarantee numeric
      }))
      .map((d) => JSON.stringify(d))
      .join('\n'),
    { action: 'upsert' }
  );

  await mongo.close();
  console.log('✅ Typesense indexing complete.');
}

run().catch((e) => {
  console.error('❌ Indexing failed:', e);
  process.exit(1);
});