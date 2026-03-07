import 'dotenv/config';
import { MongoClient } from 'mongodb';

// ── Validate env vars ─────────────────────────────────────────────────────────
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI missing in .env');
  process.exit(1);
}
if (!process.env.AWS_CLOUDFRONT_DOMAIN) {
  console.error('❌ AWS_CLOUDFRONT_DOMAIN missing in .env (e.g. dxxxxx.cloudfront.net)');
  process.exit(1);
}

const NEW_BASE = `https://${process.env.AWS_CLOUDFRONT_DOMAIN}`;

// Vercel Blob URLs look like:
//   https://4gkxi5h7bnayykfq.public.blob.vercel-storage.com/perfumes/abc.jpg
// We detect them by this pattern in the hostname
const VERCEL_PATTERN = 'vercel-storage.com';

async function main() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db(process.env.MONGO_DB_NAME || 'fragview');

  // Find all perfumes that still have a Vercel Blob URL
  const cursor = db.collection('perfumes').find({
    image: { $regex: VERCEL_PATTERN },
  });

  const total = await db.collection('perfumes').countDocuments({
    image: { $regex: VERCEL_PATTERN },
  });

  if (total === 0) {
    console.log('✅ No Vercel Blob URLs found — nothing to update.');
    await client.close();
    return;
  }

  console.log(`Found ${total} perfume(s) with Vercel Blob URLs. Updating...`);

  let updated = 0;
  let failed  = 0;

  while (await cursor.hasNext()) {
    const doc = await cursor.next();

    try {
      // ── Extract just the path from the Vercel Blob URL ────────────────────
      // e.g. https://4gkxi5h7bnayykfq.public.blob.vercel-storage.com/perfumes/abc.jpg
      //   →  /perfumes/abc.jpg
      const { pathname } = new URL(doc.image);

      // Build clean CloudFront URL
      // e.g. https://dxxxxxx.cloudfront.net/perfumes/abc.jpg
      const newUrl = `${NEW_BASE}${pathname}`;

      await db.collection('perfumes').updateOne(
        { _id: doc._id },
        { $set: { image: newUrl } }
      );

      updated++;
      if (updated % 200 === 0) {
        console.log(`  Updated ${updated} / ${total}...`);
      }

    } catch (err) {
      failed++;
      console.warn(`❌ Failed for _id=${doc._id}: ${err.message}`);
    }
  }

  await client.close();

  console.log('\n── Results ──────────────────────────────────────');
  console.log(`✅ Updated : ${updated}`);
  if (failed > 0) {
    console.log(`❌ Failed  : ${failed}  ← run script again to retry`);
  }
  console.log('\nSample — verify one URL looks correct in MongoDB:');
  console.log(`  Expected format: ${NEW_BASE}/perfumes/<mongo-id>.jpg`);
}

main().catch(console.error);
