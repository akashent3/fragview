/**
 * Migration Script: Local MongoDB → MongoDB Atlas
 * Updated to read from .env file
 */

import { MongoClient } from 'mongodb';
import * as readline from 'readline';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({ path: '.env' });

// Configuration
const LOCAL_URI = 'mongodb://localhost:27017'; // Your local MongoDB
const LOCAL_DB_NAME = 'fragview'; // Your local database name

const ATLAS_URI = process.env.MONGODB_URI!; // From .env
const ATLAS_DB_NAME = 'fragview';

// Helper to ask user confirmation
function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}

async function migrate() {
  console.log('🚀 FragView MongoDB Migration: Local → Atlas\n');
  
  // Safety check
  if (!ATLAS_URI) {
    console.error('❌ Error: MONGODB_URI not found in environment variables');
    console.log('Please add your MongoDB Atlas URI to .env file');
    console.log('\nCurrent .env file location should be: ' + process.cwd() + '/.env');
    console.log('\nMake sure it contains:');
    console.log('MONGODB_URI="mongodb+srv://user:password@cluster.mongodb.net/fragview"');
    process.exit(1);
  }

  console.log('⚙️  Configuration:');
  console.log(`   Local: ${LOCAL_URI}/${LOCAL_DB_NAME}`);
  console.log(`   Atlas: ${ATLAS_URI.replace(/\/\/(.+):(.+)@/, '//$1:****@')}/${ATLAS_DB_NAME}\n`);

  const answer = await askQuestion('This will copy all data from local to Atlas. Continue? (yes/no): ');
  if (answer.toLowerCase() !== 'yes') {
    console.log('❌ Migration cancelled');
    process.exit(0);
  }

  let localClient: MongoClient | null = null;
  let atlasClient: MongoClient | null = null;

  try {
    // Connect to local MongoDB
    console.log('\n📡 Connecting to local MongoDB...');
    localClient = await MongoClient.connect(LOCAL_URI);
    const localDb = localClient.db(LOCAL_DB_NAME);
    console.log('✅ Connected to local MongoDB');

    // Connect to Atlas
    console.log('📡 Connecting to MongoDB Atlas...');
    atlasClient = await MongoClient.connect(ATLAS_URI);
    const atlasDb = atlasClient.db(ATLAS_DB_NAME);
    console.log('✅ Connected to MongoDB Atlas\n');

    // ========================================
    // MIGRATE BRANDS
    // ========================================
    console.log('📦 Migrating BRANDS collection...');
    const localBrands = localDb.collection('brands');
    const atlasBrands = atlasDb.collection('brands');

    const brandsCount = await localBrands.countDocuments();
    console.log(`   Found ${brandsCount} brands in local database`);

    if (brandsCount > 0) {
      const brands = await localBrands.find({}).toArray();
      
      // Upsert each brand (won't duplicate if _id exists)
      let inserted = 0;
      let updated = 0;
      
      for (const brand of brands) {
        const result = await atlasBrands.updateOne(
          { _id: brand._id }, // Match by _id
          { $set: brand },     // Update entire document
          { upsert: true }     // Insert if doesn't exist
        );
        
        if (result.upsertedCount > 0) inserted++;
        else if (result.modifiedCount > 0) updated++;
      }
      
      console.log(`   ✅ Brands migration complete!`);
      console.log(`      - Inserted: ${inserted}`);
      console.log(`      - Updated: ${updated}`);
      console.log(`      - Skipped (unchanged): ${brandsCount - inserted - updated}\n`);
    }

    // ========================================
    // MIGRATE PERFUMES
    // ========================================
    console.log('📦 Migrating PERFUMES collection...');
    const localPerfumes = localDb.collection('perfumes');
    const atlasPerfumes = atlasDb.collection('perfumes');

    const perfumesCount = await localPerfumes.countDocuments();
    console.log(`   Found ${perfumesCount} perfumes in local database`);

    if (perfumesCount > 0) {
      // Process in batches (1000 at a time for performance)
      const batchSize = 1000;
      let processed = 0;
      let inserted = 0;
      let updated = 0;

      while (processed < perfumesCount) {
        const perfumes = await localPerfumes
          .find({})
          .skip(processed)
          .limit(batchSize)
          .toArray();

        for (const perfume of perfumes) {
          const result = await atlasPerfumes.updateOne(
            { _id: perfume._id },
            { $set: perfume },
            { upsert: true }
          );
          
          if (result.upsertedCount > 0) inserted++;
          else if (result.modifiedCount > 0) updated++;
        }

        processed += perfumes.length;
        console.log(`   Progress: ${processed}/${perfumesCount} (${Math.round(processed/perfumesCount*100)}%)`);
      }

      console.log(`   ✅ Perfumes migration complete!`);
      console.log(`      - Inserted: ${inserted}`);
      console.log(`      - Updated: ${updated}`);
      console.log(`      - Skipped (unchanged): ${perfumesCount - inserted - updated}\n`);
    }

    // ========================================
    // MIGRATE OTHER COLLECTIONS (if any)
    // ========================================
    console.log('📦 Checking for other collections...');
    const collections = await localDb.listCollections().toArray();
    const otherCollections = collections.filter(
      c => !['brands', 'perfumes'].includes(c.name)
    );

    if (otherCollections.length > 0) {
      console.log(`   Found ${otherCollections.length} other collections:`);
      for (const col of otherCollections) {
        console.log(`   - ${col.name}`);
        const localCol = localDb.collection(col.name);
        const atlasCol = atlasDb.collection(col.name);
        
        const docs = await localCol.find({}).toArray();
        if (docs.length > 0) {
          for (const doc of docs) {
            await atlasCol.updateOne(
              { _id: doc._id },
              { $set: doc },
              { upsert: true }
            );
          }
          console.log(`     ✅ Migrated ${docs.length} documents`);
        }
      }
    } else {
      console.log('   No other collections found');
    }

    console.log('\n🎉 MIGRATION COMPLETE! 🎉');
    console.log('\n📊 Summary:');
    console.log(`   Brands: ${brandsCount} documents`);
    console.log(`   Perfumes: ${perfumesCount} documents`);
    console.log('\n✅ Your data is now in MongoDB Atlas!');
    console.log('   You can now update your .env to use Atlas URI');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    // Close connections
    if (localClient) await localClient.close();
    if (atlasClient) await atlasClient.close();
  }
}

// Run migration
migrate();