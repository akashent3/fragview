import 'dotenv/config';
import { MongoClient } from 'mongodb';

const DB_NAME = process.env.MONGO_DB_NAME || 'fragview';
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('❌ MONGODB_URI is missing in .env');
  process.exit(1);
}

function toKebab(input = '') {
  return String(input)
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function perfumeSlug(brandName = '', variantName = '') {
  return `${toKebab(brandName)}-${toKebab(variantName)}`;
}

async function run() {
  const mongo = new MongoClient(uri);
  await mongo.connect();
  const db = mongo.db(DB_NAME);

  const brandsCol = db.collection('brands');
  const perfumesCol = db.collection('perfumes');

  // BRANDS: add slug if missing/empty
  const brandCursor = brandsCol.find({
    $or: [{ slug: { $exists: false } }, { slug: '' }],
  });
  const brandOps = [];
  while (await brandCursor.hasNext()) {
    const b = await brandCursor.next();
    if (!b?.name) continue;
    brandOps.push({
      updateOne: {
        filter: { _id: b._id },
        update: { $set: { slug: toKebab(b.name) } },
      },
    });
    if (brandOps.length === 1000) {
      await brandsCol.bulkWrite(brandOps);
      brandOps.length = 0;
    }
  }
  if (brandOps.length) await brandsCol.bulkWrite(brandOps);

  // PERFUMES: add slug if missing/empty
  const perfumeCursor = perfumesCol.find({
    $or: [{ slug: { $exists: false } }, { slug: '' }],
  });
  const perfumeOps = [];
  while (await perfumeCursor.hasNext()) {
    const p = await perfumeCursor.next();
    if (!p?.brand_name || !p?.variant_name) continue;
    perfumeOps.push({
      updateOne: {
        filter: { _id: p._id },
        update: { $set: { slug: perfumeSlug(p.brand_name, p.variant_name) } },
      },
    });
    if (perfumeOps.length === 1000) {
      await perfumesCol.bulkWrite(perfumeOps);
      perfumeOps.length = 0;
    }
  }
  if (perfumeOps.length) await perfumesCol.bulkWrite(perfumeOps);

  console.log('✅ Slug backfill complete.');
  await mongo.close();
  process.exit(0);
}

run().catch((e) => {
  console.error('❌ Backfill failed:', e);
  process.exit(1);
});