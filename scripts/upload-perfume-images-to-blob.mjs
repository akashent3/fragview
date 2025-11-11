import 'dotenv/config';
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import { MongoClient } from 'mongodb';
import { put } from '@vercel/blob';

/* ===== CONFIG ===== */
const BASE_DIR = process.env.PERFUME_IMAGES_DIR || path.join(process.cwd(), 'local_images');
const DB_NAME = process.env.MONGO_DB_NAME || 'fragview';
const CONCURRENCY = Number(process.env.CONCURRENCY || 8);
const DRY_RUN = String(process.env.DRY_RUN || '').toLowerCase() === 'true';
const FORCE = String(process.env.FORCE || '').toLowerCase() === 'true';
const CHECKPOINT_DIR = path.join(process.cwd(), 'upload-checkpoints');
const CHECKPOINT_FILE = path.join(CHECKPOINT_DIR, 'perfume-images-v2.json');

/* ===== ENV VALIDATION ===== */
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI missing in .env');
  process.exit(1);
}
if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error('❌ BLOB_READ_WRITE_TOKEN missing in .env');
  process.exit(1);
}

/* ===== HELPERS ===== */
function toKebab(input = '') {
  return String(input)
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function safeBrandFolderCandidates(doc) {
  const candidates = new Set();
  if (doc.brand_name) {
    candidates.add(toKebab(doc.brand_name));            // prada
    candidates.add(doc.brand_name.replace(/\s+/g, '-')); // Prada -> Prada (case difference okay)
  }
  if (doc.url) {
    try {
      const u = new URL(doc.url);
      const segs = u.pathname.split('/').filter(Boolean);
      // Expect pattern: perfume/<brandSegment>/<perfumeSegment>.html
      if (segs.length >= 3 && segs[0] === 'perfume') {
        candidates.add(segs[1]); // brand segment from URL: A-Bathing-Ape
      }
    } catch {}
  }
  // Remove empty strings
  return Array.from(candidates).filter(Boolean);
}

function fileBaseCandidates(doc) {
  const bases = new Set();

  // Variant-based
  if (doc.variant_name) {
    bases.add(toKebab(doc.variant_name)); // luna-rosa, paradigme, etc.
  }

  // URL-derived perfume segment
  if (doc.url) {
    try {
      const u = new URL(doc.url);
      const segs = u.pathname.split('/').filter(Boolean);
      if (segs.length >= 3 && segs[0] === 'perfume') {
        let perfumeSeg = segs[2];
        perfumeSeg = perfumeSeg.replace(/\.html.*/i, ''); // remove .html and anything after (.html#anchor)
        bases.add(perfumeSeg); // A-Bathing-Ape-36541
        // If perfumeSeg contains a numeric suffix, also consider trimmed variant
        const numericMatch = perfumeSeg.match(/^(.*?)-(\d{2,})$/);
        if (numericMatch) {
          bases.add(numericMatch[1]); // A-Bathing-Ape (without id)
        }
      }
    } catch {}
  }

  // Brand + variant combos (sometimes files repeat brand)
  if (doc.brand_name && doc.variant_name) {
    bases.add(`${toKebab(doc.brand_name)}-${toKebab(doc.variant_name)}`);
  }

  return Array.from(bases).filter(Boolean);
}

function contentTypeFor(ext) {
  switch (ext.toLowerCase()) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    default:
      return 'application/octet-stream';
  }
}

async function ensureCheckpointDir() {
  await fsp.mkdir(CHECKPOINT_DIR, { recursive: true }).catch(() => {});
}

async function loadCheckpoint() {
  await ensureCheckpointDir();
  try {
    const raw = await fsp.readFile(CHECKPOINT_FILE, 'utf8').catch(() => '');
    if (!raw) return { done: new Set(), lastAt: 0 };
    const json = JSON.parse(raw);
    return { done: new Set(json.done || []), lastAt: json.lastAt || 0 };
  } catch {
    return { done: new Set(), lastAt: 0 };
  }
}

async function saveCheckpoint(doneSet) {
  const payload = JSON.stringify({ done: Array.from(doneSet), lastAt: Date.now() });
  await fsp.writeFile(CHECKPOINT_FILE, payload, 'utf8').catch(() => {});
}

async function withRetry(fn, label, retries = 3) {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (e) {
      attempt++;
      if (attempt > retries) throw e;
      const delay = Math.min(30000, 1000 * Math.pow(2, attempt - 1));
      console.warn(`⚠️ ${label} failed (attempt ${attempt}/${retries}), retry in ${Math.round(delay / 1000)}s...`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

/* ===== STATS ===== */
const stats = {
  totalDocs: 0,
  eligible: 0,
  matchedLocal: 0,
  uploaded: 0,
  skipped: 0,
  missingLocal: 0,
  failed: 0,
  startedAt: Date.now(),
};

function eta() {
  const done = stats.uploaded + stats.skipped + stats.missingLocal + stats.failed;
  if (done === 0) return 'estimating…';
  const elapsed = (Date.now() - stats.startedAt) / 1000;
  const rate = done / elapsed;
  const remaining = Math.max(stats.eligible - done, 0);
  const sec = remaining / Math.max(rate, 0.001);
  const hh = Math.floor(sec / 3600);
  const mm = Math.floor((sec % 3600) / 60);
  const ss = Math.floor(sec % 60);
  return `${hh}h ${mm}m ${ss}s`;
}

let liveTimer = null;
function startLiveStats() {
  liveTimer = setInterval(() => {
    const elapsed = ((Date.now() - stats.startedAt) / 1000).toFixed(0);
    process.stdout.write(
      `\rDocs: ${stats.totalDocs} | Eligible: ${stats.eligible} | Matched: ${stats.matchedLocal} | Uploaded: ${stats.uploaded} | Skipped: ${stats.skipped} | Missing: ${stats.missingLocal} | Failed: ${stats.failed} | Elapsed: ${elapsed}s | ETA: ${eta()}    `
    );
  }, 2500);
}
function stopLiveStats() {
  if (liveTimer) clearInterval(liveTimer);
  process.stdout.write('\n');
}

/* ===== MAIN ===== */
async function main() {
  console.log(`\n📂 Image base directory: ${BASE_DIR}`);
  console.log(`🧵 Concurrency: ${CONCURRENCY} | DRY_RUN=${DRY_RUN} | FORCE=${FORCE}`);
  console.log(`🗂  Checkpoint file: ${CHECKPOINT_FILE}\n`);

  const checkpoint = await loadCheckpoint();
  console.log(`Loaded checkpoint: ${checkpoint.done.size} previously completed docs.\n`);

  const mongo = new MongoClient(process.env.MONGODB_URI);
  await mongo.connect();
  const db = mongo.db(DB_NAME);
  const perfumesCol = db.collection('perfumes');

  // Pull only docs we might need (image missing or FORCE)
  const query = FORCE ? {} : { $or: [{ image: { $exists: false } }, { image: { $eq: '' } }] };
  const docsCursor = perfumesCol.find(query, {
    projection: {
      _id: 1,
      brand_name: 1,
      variant_name: 1,
      slug: 1,
      url: 1,
      image: 1,
    },
  });

  const docs = await docsCursor.toArray();
  stats.totalDocs = docs.length;

  console.log(`Perfume docs fetched: ${docs.length}`);

  // Build job list
  const jobs = [];
  for (const d of docs) {
    // Skip if already imaged (unless FORCE)
    if (!FORCE && d.image && String(d.image).startsWith('http')) {
      stats.skipped++;
      continue;
    }

    stats.eligible++;

    // Skip if checkpoint says done
    const checkpointKey = String(d._id);
    if (!FORCE && checkpoint.done.has(checkpointKey)) {
      stats.skipped++;
      continue;
    }

    // Determine local path candidates
    const brandFolders = safeBrandFolderCandidates(d);
    const fileBases = fileBaseCandidates(d);
    const exts = ['.jpg', '.jpeg', '.png', '.webp'];

    let foundPath = null;
    let foundExt = null;

    outer: for (const brandFolder of brandFolders) {
      const folderPath = path.join(BASE_DIR, brandFolder);
      if (!fs.existsSync(folderPath) || !fs.statSync(folderPath).isDirectory()) continue;
      for (const base of fileBases) {
        for (const ext of exts) {
          const candidate = path.join(folderPath, `${base}${ext}`);
          if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
            foundPath = candidate;
            foundExt = ext;
            break outer;
          }
        }
      }
    }

    if (!foundPath) {
      stats.missingLocal++;
      continue;
    }

    stats.matchedLocal++;
    jobs.push({
      mongoId: d._id,
      checkpointKey,
      localPath: foundPath,
      ext: foundExt,
      baseName: path.basename(foundPath, foundExt),
    });
  }

  console.log(`\nJobs queued: ${jobs.length}`);
  console.log(
    `Matched local files: ${stats.matchedLocal} | Missing local files for docs: ${stats.missingLocal} | Already skipped: ${stats.skipped}\n`
  );

  if (DRY_RUN) {
    console.log('DRY_RUN=true → no uploads performed.');
    await mongo.close();
    return;
  }

  startLiveStats();

  let idx = 0;
  let savesSinceCheckpoint = 0;

  async function worker() {
    while (true) {
      const job = jobs[idx++];
      if (!job) break;
      const { mongoId, localPath, ext, checkpointKey } = job;
      const contentType = contentTypeFor(ext);

      try {
        const buf = await withRetry(() => fsp.readFile(localPath), `read ${localPath}`);
        const blobName = `perfumes/${mongoId}${ext}`; // Use DB _id for deterministic uniqueness
        const uploaded = await withRetry(
          () =>
            put(blobName, buf, {
              access: 'public',
              contentType,
              token: process.env.BLOB_READ_WRITE_TOKEN,
              addRandomSuffix: false,
            }),
          `upload ${blobName}`
        );

        await withRetry(
            () => perfumesCol.updateOne({ _id: mongoId }, { $set: { image: uploaded.url } }),
            `mongo update ${mongoId}`
          );

        stats.uploaded++;
        checkpoint.done.add(checkpointKey);
        savesSinceCheckpoint++;
        if (savesSinceCheckpoint >= 200) {
          savesSinceCheckpoint = 0;
            await saveCheckpoint(checkpoint.done);
        }
      } catch (e) {
        stats.failed++;
        console.warn(`❌ Failed for _id=${mongoId}:`, e?.message);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  await saveCheckpoint(checkpoint.done);
  stopLiveStats();
  await mongo.close();

  console.log('\n✅ Upload complete');
  console.log(
    `Summary: totalDocs=${stats.totalDocs}, eligible=${stats.eligible}, matchedLocal=${stats.matchedLocal}, uploaded=${stats.uploaded}, skipped=${stats.skipped}, missingLocal=${stats.missingLocal}, failed=${stats.failed}`
  );
  console.log(`Checkpoint saved: ${CHECKPOINT_FILE}`);
}

main().catch((e) => {
  stopLiveStats();
  console.error('\n❌ Fatal error:', e);
  process.exit(1);
});