import 'dotenv/config';
import { list } from '@vercel/blob';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'node:fs/promises';
import path from 'node:path';

// ── Checkpoint (resume support) ──────────────────────────────────────────────
const CHECKPOINT_FILE = path.join(process.cwd(), 'upload-checkpoints', 'blob-to-s3.json');

async function loadCheckpoint() {
  try {
    const raw = await fs.readFile(CHECKPOINT_FILE, 'utf8');
    return new Set(JSON.parse(raw));
  } catch {
    return new Set(); // first run — nothing done yet
  }
}

async function saveCheckpoint(done) {
  await fs.mkdir(path.dirname(CHECKPOINT_FILE), { recursive: true });
  await fs.writeFile(CHECKPOINT_FILE, JSON.stringify([...done]), 'utf8');
}
// ─────────────────────────────────────────────────────────────────────────────

const s3 = new S3Client({ region: process.env.AWS_REGION || 'ap-south-1' });

async function main() {
  const done = await loadCheckpoint();
  const alreadyDone = done.size;

  if (alreadyDone > 0) {
    console.log(`♻️  Resuming — ${alreadyDone} files already uploaded, skipping them.`);
  }

  let uploaded = 0;
  let skipped  = 0;
  let failed   = 0;
  let cursor;

  do {
    const { blobs, cursor: next } = await list({
      token: process.env.BLOB_READ_WRITE_TOKEN,
      cursor,
      limit: 1000,
    });

    for (const blob of blobs) {
      const key = blob.pathname; // e.g. perfumes/abc123.webp

      // ── Skip if already uploaded ──────────────────────────────────────────
      if (done.has(key)) {
        skipped++;
        continue;
      }

      try {
        const res = await fetch(blob.url);
        if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${blob.url}`);
        const buf = Buffer.from(await res.arrayBuffer());

        await s3.send(new PutObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: key,
          Body: buf,
          ContentType: blob.contentType,
        }));

        done.add(key);
        uploaded++;

        // Save checkpoint every 50 uploads so interruption loses minimal work
        if (uploaded % 50 === 0) {
          await saveCheckpoint(done);
          console.log(`✅ Uploaded ${uploaded} | Skipped ${skipped} | Failed ${failed}`);
        }

      } catch (err) {
        failed++;
        console.warn(`❌ Failed: ${key} — ${err.message}`);
        // Don't add to done — it will be retried next run
      }
    }

    cursor = next;
  } while (cursor);

  // Final checkpoint save
  await saveCheckpoint(done);

  console.log('\n🎉 Migration complete!');
  console.log(`   Uploaded : ${uploaded}`);
  console.log(`   Skipped  : ${skipped}  (already done from previous run)`);
  console.log(`   Failed   : ${failed}`);

  if (failed > 0) {
    console.log('\n⚠️  Some files failed. Run the script again — they will be retried automatically.');
  } else {
    console.log('\n✅ All files migrated successfully. Safe to delete the checkpoint file:');
    console.log(`   ${CHECKPOINT_FILE}`);
  }
}

main().catch(console.error);
