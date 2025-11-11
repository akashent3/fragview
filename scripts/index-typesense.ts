/**
 * Index brands and perfumes into Typesense.
 * Usage:
 *   npx ts-node scripts/index-typesense.ts
 *
 * Pre-req:
 *   - TYPESENSE_HOST, TYPESENSE_API_KEY, TYPESENSE_PROTOCOL set
 *   - Mongo data available
 */

import 'dotenv/config';
import clientPromise from '../src/lib/mongodb';
import { getTypesenseClient } from '../src/lib/search/typesense-client';

const DB_NAME = process.env.MONGO_DB_NAME || 'fragview';

async function run() {
  const ts = getTypesenseClient();
  if (!ts) {
    console.error('❌ Typesense client not configured. Set env vars first.');
    process.exit(1);
  }

  // Prepare schemas (idempotent)
  try {
    await ts.collections('perfumes').retrieve();
    console.log('Perfumes collection already exists.');
  } catch {
    console.log('Creating perfumes collection...');
    await ts.collections().create({
      name: 'perfumes',
      fields: [
        { name: 'id', type: 'string' },
        { name: 'slug', type: 'string', facet: false },
        { name: 'brand_name', type: 'string', facet: true },
        { name: 'variant_name', type: 'string', facet: false },
        { name: 'gender', type: 'string', facet: true, optional: true },
        { name: 'rating', type: 'float', optional: true },
      ],
      default_sorting_field: 'rating',
    });
  }

  try {
    await ts.collections('brands').retrieve();
    console.log('Brands collection already exists.');
  } catch {
    console.log('Creating brands collection...');
    await ts.collections().create({
      name: 'brands',
      fields: [
        { name: 'id', type: 'string' },
        { name: 'slug', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'country', type: 'string', facet: true, optional: true },
        { name: 'perfumes_count', type: 'int32', optional: true },
      ],
      default_sorting_field: 'perfumes_count',
    });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const perfumesCol = db.collection('perfumes');
  const brandsCol = db.collection('brands');

  // Load data
  const perfumes = await perfumesCol
    .find({}, { projection: { _id: 1, brand_name: 1, variant_name: 1, slug: 1, gender: 1, rating: 1 } })
    .toArray();

  const brandAgg = await brandsCol
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

  // Upsert data
  console.log(`Indexing ${perfumes.length} perfumes...`);
  await ts.collections('perfumes').documents().import(
    perfumes
      .map((p) => ({
        id: String(p._id),
        slug: p.slug,
        brand_name: p.brand_name,
        variant_name: p.variant_name,
        gender: p.gender || '',
        rating: typeof p.rating === 'number' ? p.rating : 0,
      }))
      .map((d) => JSON.stringify(d))
      .join('\n'),
    { action: 'upsert' }
  );

  console.log(`Indexing ${brandAgg.length} brands...`);
  await ts.collections('brands').documents().import(
    brandAgg
      .map((b) => ({
        id: String(b._id),
        slug: b.slug,
        name: b.name,
        country: b.country || '',
        perfumes_count: b.perfumes_count || 0,
      }))
      .map((d) => JSON.stringify(d))
      .join('\n'),
    { action: 'upsert' }
  );

  console.log('✅ Typesense indexing complete.');
  process.exit(0);
}

run().catch((e) => {
  console.error('❌ Indexing failed:', e);
  process.exit(1);
});