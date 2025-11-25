import 'dotenv/config';
import { MongoClient } from 'mongodb';

const DB_NAME = process.env.MONGO_DB_NAME || 'fragview';
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ MONGODB_URI is missing in .env');
  process.exit(1);
}

// Generate random integer for vote count
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Helper to ensure 2 decimal places
function toTwoDecimals(num) {
  if (typeof num !== 'number') return 0;
  return Math.round(num * 100) / 100;
}

async function run() {
  console.log('📡 Connecting to MongoDB...');
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(DB_NAME);
  const col = db.collection('perfumes');

  console.log('🔍 Processing perfumes to add votes and format ratings...');
  
  // We process ALL perfumes to ensure formatting is correct everywhere
  const totalDocs = await col.countDocuments({});
  const cursor = col.find({});
  
  let processed = 0;
  let updated = 0;
  const bulkOps = [];

  while (await cursor.hasNext()) {
    const p = await cursor.next();
    processed++;

    // 1. Determine Votes (The missing piece)
    // If 'votes' already exists, keep it. If not, generate random base count.
    let votes = p.votes;
    if (votes === undefined || votes === null) {
      // Generate a realistic random vote count (e.g., 10 to 50 users)
      // You can tweak these numbers if you want higher/lower traffic simulation
      votes = randomInt(10, 50);
    }

    // 2. Format Existing Ratings (Preserve actual value, just round)
    // If the field is missing in Mongo, default to 0
    const rating = toTwoDecimals(p.rating);
    const longevity = toTwoDecimals(p.longevity);
    const sillage = toTwoDecimals(p.sillage);

    // 3. Prepare Update
    bulkOps.push({
      updateOne: {
        filter: { _id: p._id },
        update: {
          $set: {
            votes: votes,      // NEW field
            rating: rating,    // Formatted existing field
            longevity: longevity, // Formatted existing field
            sillage: sillage   // Formatted existing field
          }
        }
      }
    });

    // Execute in batches of 1000
    if (bulkOps.length >= 1000) {
      const res = await col.bulkWrite(bulkOps);
      updated += res.modifiedCount;
      console.log(`   Processed: ${processed}/${totalDocs} | Batch Updated`);
      bulkOps.length = 0;
    }
  }

  // Final batch
  if (bulkOps.length > 0) {
    const res = await col.bulkWrite(bulkOps);
    updated += res.modifiedCount;
  }

  console.log(`✅ Done! Processed ${processed} documents.`);
  await client.close();
}

run().catch(console.error);