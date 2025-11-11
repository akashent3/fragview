import 'dotenv/config';
import Typesense from 'typesense';

function getEnv(name, fallback) {
  const v = process.env[name];
  if (!v && fallback === undefined) {
    console.error(`Missing required env: ${name}`);
    process.exit(1);
  }
  return v ?? fallback;
}

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
  try {
    const health = await client.health.retrieve();
    console.log('Typesense health:', health);
  } catch (e) {
    console.error('Unable to reach Typesense. Check env vars / connectivity:', e?.message);
    process.exit(1);
  }

  const synonymsList = [
    { id: 'oud-set', synonyms: ['oud', 'agarwood'] },
    { id: 'rose-set', synonyms: ['rose', 'rosa'] },
    { id: 'vanilla-set', synonyms: ['vanilla', 'vanillin'] },
    { id: 'citrus-set', synonyms: ['citrus', 'bergamot', 'lemon'] },
    { id: 'musk-set', synonyms: ['musk', 'musky'] },
  ];

  for (const syn of synonymsList) {
    try {
      // CORRECT usage: synonyms().upsert(id, { synonyms: [...] })
      await client.collections('perfumes').synonyms().upsert(syn.id, { synonyms: syn.synonyms });
      console.log('Upserted synonym:', syn.id);
    } catch (e) {
      console.error(`Failed synonym ${syn.id}:`, e?.message);
    }
  }

  // Optional: list synonyms to verify
  try {
    const list = await client.collections('perfumes').synonyms().retrieve();
    console.log('Current synonyms (first 5):', list.synonyms?.slice(0, 5));
  } catch (e) {
    console.error('Failed to list synonyms:', e?.message);
  }

  console.log('Synonyms initialization complete.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});