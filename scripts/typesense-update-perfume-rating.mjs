import 'dotenv/config';
import { typesenseClient } from '@/lib/typesense';
import clientPromise from '@/lib/mongodb';

async function main() {
  if (!typesenseClient) {
    console.error('Typesense client not configured.');
    process.exit(1);
  }
  const client = await clientPromise;
  const db = client.db(process.env.MONGO_DB_NAME || 'fragview');

  // Example: Update changed ratings in last N minutes (placeholder logic)
  const since = new Date(Date.now() - 10 * 60 * 1000);
  const changed = await db.collection('perfumes').find(
    { updated_at: { $gte: since } },
    { projection: { _id: 1, rating: 1 } }
  ).toArray();

  for (const p of changed) {
    try {
      await typesenseClient.collections('perfumes').documents(String(p._id)).update({
        rating: typeof p.rating === 'number' ? p.rating : 0
      });
      console.log('Updated rating for perfume', p._id);
    } catch (e) {
      console.error('Failed update rating', p._id, e.message);
    }
  }
  console.log('Rating update complete.');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});