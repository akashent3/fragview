// scripts/typesense-drop-collections.mjs
import 'dotenv/config';
import Typesense from 'typesense';

const client = new Typesense.Client({
  nodes: [{ host: process.env.TYPESENSE_HOST, port: 443, protocol: 'https' }],
  apiKey: process.env.TYPESENSE_API_KEY,
});

async function drop(name) {
  try {
    await client.collections(name).delete();
    console.log(`Deleted collection: ${name}`);
  } catch (e) {
    console.log(`Skip delete ${name}:`, e?.message);
  }
}

await drop('perfumes');
await drop('brands');