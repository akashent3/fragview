// scripts/add-ai-summary-field.mjs
// This script adds the ai_summary field to ALL perfumes in MongoDB

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' }); // ✅ Fixed: removed space

const MONGODB_URI = process.env.MONGODB_URI;

async function addAISummaryField() {
  // Add validation to check if MONGODB_URI exists
  if (!MONGODB_URI) {
    console.error('❌ Error: MONGODB_URI is not defined in . env.local');
    console.error('Please make sure . env.local exists and contains MONGODB_URI');
    process.exit(1);
  }

  console.log('🔌 Connecting to MongoDB...');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('fragview'); // Your database name
    const perfumesCollection = db.collection('perfumes');
    
    // Count perfumes without ai_summary field
    const count = await perfumesCollection.countDocuments({
      ai_summary: { $exists: false }
    });
    
    console. log(`📊 Found ${count} perfumes without ai_summary field`);
    
    if (count === 0) {
      console.log('✨ All perfumes already have ai_summary field! ');
      return;
    }
    
    // Add ai_summary field to all perfumes that don't have it
    const result = await perfumesCollection.updateMany(
      { ai_summary: { $exists: false } }, // Only perfumes without the field
      {
        $set: {
          ai_summary: null // Set to null initially (no summary generated yet)
        }
      }
    );
    
    console. log(`✅ Updated ${result.modifiedCount} perfumes`);
    console.log('🎉 Schema update complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run the script
addAISummaryField();