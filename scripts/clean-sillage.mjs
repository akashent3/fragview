import 'dotenv/config';
import { MongoClient } from 'mongodb';

const DB_NAME = process.env.MONGO_DB_NAME || 'fragview';
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ MONGODB_URI is missing in .env');
  process.exit(1);
}

async function run() {
  console.log('📡 Connecting to MongoDB...');
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(DB_NAME);
  const col = db.collection('perfumes');

  console.log('🔍 Processing perfumes to decrement sillage by 1...');

  // Find all perfumes where sillage exists and is a number
  const cursor = col.find({ sillage: { $exists: true, $type: 'number' } });
  
  let processed = 0;
  let updated = 0;
  const bulkOps = [];

  while (await cursor.hasNext()) {
    const p = await cursor.next();
    processed++;

    // Calculate new value: current sillage - 1
    // Ensure it doesn't go below 0 if that's a requirement (optional check)
    let newSillage = p.sillage - 1;
    
    // Optional: Clamp to 0 if negative values are invalid
    // if (newSillage < 0) newSillage = 0;

    // Prepare Update Operation
    bulkOps.push({
      updateOne: {
        filter: { _id: p._id },
        update: {
          $set: {
            sillage: parseFloat(newSillage.toFixed(2)) // Keep 2 decimal precision
          }
        }
      }
    });

    // Execute in batches of 1000 for efficiency
    if (bulkOps.length >= 1000) {
      const res = await col.bulkWrite(bulkOps);
      updated += res.modifiedCount;
      console.log(`   Processed: ${processed} | Batch Updated: ${res.modifiedCount}`);
      bulkOps.length = 0;
    }
  }

  // Final batch
  if (bulkOps.length > 0) {
    const res = await col.bulkWrite(bulkOps);
    updated += res.modifiedCount;
  }

  console.log(`✅ Done! Processed ${processed} documents. Updated ${updated} sillage values.`);
  await client.close();
}

run().catch(console.error);