import 'dotenv/config';
import { put } from '@vercel/blob';
import fs from 'node:fs/promises';
import path from 'node:path';
import mime from 'mime';

const NOTES_DIR = process.env.NOTES_DIR || path.join(process.cwd(), 'public', 'notes');
const OUTPUT_MAP = path.join(process.cwd(), 'src', 'data', 'note-images.json');

// Ensure token available
if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error('Missing BLOB_READ_WRITE_TOKEN. Add it to your .env.local or Vercel project settings.');
  process.exit(1);
}

function slugifyBase(name) {
  return String(name)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]+/g, '')
    .replace(/\-+/g, '-')
    .replace(/^\-+|\-+$/g, '');
}

async function* walk(dir) {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  for (const d of dirents) {
    const res = path.resolve(dir, d.name);
    if (d.isDirectory()) {
      yield* walk(res);
    } else {
      yield res;
    }
  }
}

async function main() {
  console.log('Reading local notes folder:', NOTES_DIR);

  // Ensure folder exists
  try {
    await fs.access(NOTES_DIR);
  } catch {
    console.error('Notes directory not found:', NOTES_DIR);
    process.exit(1);
  }

  const map = {};
  let count = 0;

  for await (const filePath of walk(NOTES_DIR)) {
    const rel = path.relative(NOTES_DIR, filePath).replace(/\\/g, '/');
    // Only images
    const ext = path.extname(rel).toLowerCase();
    if (!['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'].includes(ext)) continue;

    const base = path.basename(rel, ext);
    const slug = slugifyBase(base);
    const contentType = mime.getType(filePath) || 'application/octet-stream';

    const fileBuffer = await fs.readFile(filePath);
    const blobKey = `notes/${slug}${ext}`;

    console.log(`Uploading ${rel} -> ${blobKey}`);
    const blob = await put(blobKey, fileBuffer, {
      access: 'public',
      contentType,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    map[slug] = blob.url;
    count++;
  }

  // Ensure output directory exists
  await fs.mkdir(path.dirname(OUTPUT_MAP), { recursive: true });
  await fs.writeFile(OUTPUT_MAP, JSON.stringify(map, null, 2), 'utf8');

  console.log(`Uploaded ${count} files.`);
  console.log('Wrote map to:', OUTPUT_MAP);
  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});