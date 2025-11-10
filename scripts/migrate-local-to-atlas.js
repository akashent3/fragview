/**
 * Migration Script: Local MongoDB → MongoDB Atlas
 * SAFE TO RE-RUN - Uses upsert to prevent duplicates
 */

import { MongoClient } from 'mongodb';
import * as readline from 'readline';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const LOCAL_URI = 'mongodb://localhost:27017';
const LOCAL_BRANDS_DB = 'Brands_Database';
const LOCAL_PERFUMES_DB = 'Perfumes_Database';
const ATLAS_URI = process.env.MONGODB_URI;
const ATLAS_DB_NAME = 'fragview';

function askQuestion(query) {
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
  console.log('🚀 FragView MongoDB Migration: Local → Atlas');
  console.log('♻️  SAFE TO RE-RUN - No duplicates will be created\n');
  
  if (!ATLAS_URI) {
    console.error('❌ Error: MONGODB_URI not found');
    process.exit(1);
  }

  let localClient = null;
  let atlasClient = null;

  try {
    // Connect
    console.log('📡 Connecting to databases...');
    localClient = await MongoClient.connect(LOCAL_URI);
    atlasClient = await MongoClient.connect(ATLAS_URI);
    const atlasDb = atlasClient.db(ATLAS_DB_NAME);
    console.log('✅ Connected to both databases\n');

    // Check existing data in Atlas
    console.log('🔍 Checking existing data in Atlas...');
    const existingBrands = await atlasDb.collection('brands').countDocuments();
    const existingPerfumes = await atlasDb.collection('perfumes').countDocuments();
    console.log('   Atlas currently has:');
    console.log('   - Brands: ' + existingBrands.toLocaleString() + ' documents');
    console.log('   - Perfumes: ' + existingPerfumes.toLocaleString() + ' documents\n');

    const answer = await askQuestion('Continue migration? Type YES: ');
    if (answer !== 'YES') {
      console.log('❌ Cancelled');
      process.exit(0);
    }

    // ========================================
    // MIGRATE BRANDS
    // ========================================
    console.log('\n📦 MIGRATING BRANDS...');
    const localBrandsDb = localClient.db(LOCAL_BRANDS_DB);
    const localBrandsCollection = localBrandsDb.collection('brands');
    const atlasBrandsCollection = atlasDb.collection('brands');

    const brandsCount = await localBrandsCollection.countDocuments();
    console.log('   📊 Source: ' + brandsCount.toLocaleString() + ' brands');
    console.log('   📊 Target: ' + existingBrands.toLocaleString() + ' already in Atlas');
    
    if (existingBrands >= brandsCount) {
      console.log('   ✅ Brands already fully migrated! Skipping...\n');
    } else {
      let inserted = 0;
      let updated = 0;
      let skipped = 0;
      let processed = 0;
      const batchSize = 1000;
      
      console.log('   🔄 Starting migration...\n');
      
      while (processed < brandsCount) {
        const brands = await localBrandsCollection
          .find({})
          .skip(processed)
          .limit(batchSize)
          .toArray();

        for (const brand of brands) {
          const result = await atlasBrandsCollection.updateOne(
            { _id: brand._id },
            { $set: brand },
            { upsert: true }
          );
          
          if (result.upsertedCount > 0) inserted++;
          else if (result.modifiedCount > 0) updated++;
          else skipped++;
        }

        processed += brands.length;
        const percent = Math.round((processed / brandsCount) * 100);
        
        // Progress bar
        const barLength = 30;
        const filledLength = Math.round(barLength * processed / brandsCount);
        const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
        
        process.stdout.write(`\r   📈 [${bar}] ${percent}% (${processed.toLocaleString()}/${brandsCount.toLocaleString()})`);
      }
      
      console.log('\n\n   ✅ BRANDS Complete!');
      console.log('      - Inserted: ' + inserted.toLocaleString() + ' (new)');
      console.log('      - Updated: ' + updated.toLocaleString() + ' (changed)');
      console.log('      - Skipped: ' + skipped.toLocaleString() + ' (unchanged)');
      console.log('      - Total: ' + brandsCount.toLocaleString() + '\n');
    }

    // ========================================
    // MIGRATE PERFUMES
    // ========================================
    console.log('📦 MIGRATING PERFUMES...');
    const localPerfumesDb = localClient.db(LOCAL_PERFUMES_DB);
    const localPerfumesCollection = localPerfumesDb.collection('perfumes');
    const atlasPerfumesCollection = atlasDb.collection('perfumes');

    const perfumesCount = await localPerfumesCollection.countDocuments();
    console.log('   📊 Source: ' + perfumesCount.toLocaleString() + ' perfumes');
    console.log('   📊 Target: ' + existingPerfumes.toLocaleString() + ' already in Atlas');
    
    if (existingPerfumes >= perfumesCount) {
      console.log('   ✅ Perfumes already fully migrated! Skipping...\n');
    } else {
      let inserted = 0;
      let updated = 0;
      let skipped = 0;
      let processed = 0;
      const batchSize = 500; // Smaller batches for perfumes
      
      console.log('   🔄 Starting migration...');
      console.log('   ⏱️  This may take 20-30 minutes for 166k documents...\n');
      
      const startTime = Date.now();
      
      while (processed < perfumesCount) {
        const perfumes = await localPerfumesCollection
          .find({})
          .skip(processed)
          .limit(batchSize)
          .toArray();

        for (const perfume of perfumes) {
          const result = await atlasPerfumesCollection.updateOne(
            { _id: perfume._id },
            { $set: perfume },
            { upsert: true }
          );
          
          if (result.upsertedCount > 0) inserted++;
          else if (result.modifiedCount > 0) updated++;
          else skipped++;
        }

        processed += perfumes.length;
        const percent = Math.round((processed / perfumesCount) * 100);
        
        // Calculate ETA
        const elapsed = Date.now() - startTime;
        const rate = processed / (elapsed / 1000); // docs per second
        const remaining = perfumesCount - processed;
        const etaSeconds = remaining / rate;
        const etaMinutes = Math.round(etaSeconds / 60);
        
        // Progress bar
        const barLength = 30;
        const filledLength = Math.round(barLength * processed / perfumesCount);
        const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
        
        process.stdout.write(`\r   📈 [${bar}] ${percent}% (${processed.toLocaleString()}/${perfumesCount.toLocaleString()}) ETA: ${etaMinutes}m`);
      }
      
      console.log('\n\n   ✅ PERFUMES Complete!');
      console.log('      - Inserted: ' + inserted.toLocaleString() + ' (new)');
      console.log('      - Updated: ' + updated.toLocaleString() + ' (changed)');
      console.log('      - Skipped: ' + skipped.toLocaleString() + ' (unchanged)');
      console.log('      - Total: ' + perfumesCount.toLocaleString() + '\n');
    }

    // ========================================
    // FINAL VERIFICATION
    // ========================================
    console.log('\n🔍 VERIFYING MIGRATION...');
    const finalBrands = await atlasDb.collection('brands').countDocuments();
    const finalPerfumes = await atlasDb.collection('perfumes').countDocuments();
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 MIGRATION COMPLETE! 🎉');
    console.log('='.repeat(60));
    console.log('\n📊 FINAL COUNT IN ATLAS:');
    console.log('   ├─ Brands:   ' + finalBrands.toLocaleString() + ' documents ✅');
    console.log('   ├─ Perfumes: ' + finalPerfumes.toLocaleString() + ' documents ✅');
    console.log('   └─ Total:    ' + (finalBrands + finalPerfumes).toLocaleString() + ' documents\n');
    
    if (finalBrands === brandsCount && finalPerfumes === perfumesCount) {
      console.log('✅ SUCCESS! All data migrated correctly!\n');
    } else {
      console.log('⚠️  Warning: Document counts don\'t match!');
      console.log('   Expected: ' + brandsCount + ' brands, ' + perfumesCount + ' perfumes');
      console.log('   Got: ' + finalBrands + ' brands, ' + finalPerfumes + ' perfumes\n');
    }

    console.log('💡 Next Steps:');
    console.log('   1. ✅ Verify data in MongoDB Atlas dashboard');
    console.log('   2. ✅ Your .env already has the correct MONGODB_URI');
    console.log('   3. ✅ Start using your application with Atlas data!\n');

  } catch (error) {
    console.error('\n❌ MIGRATION FAILED!');
    console.error('Error:', error.message);
    
    if (error.message.includes('quota')) {
      console.error('\n💡 Solution: Upgrade your MongoDB Atlas tier');
      console.error('   Current: M0 Free (512 MB)');
      console.error('   Needed: M2 Shared (~2 GB) or higher');
      console.error('   Cost: ~$9/month for M2\n');
    }
    
    console.error('\nStack:', error.stack);
    process.exit(1);
  } finally {
    if (localClient) await localClient.close();
    if (atlasClient) await atlasClient.close();
  }
}

console.log('⏰ Started: ' + new Date().toLocaleString());
migrate().then(() => {
  console.log('⏰ Finished: ' + new Date().toLocaleString());
});