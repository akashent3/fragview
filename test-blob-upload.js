// Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import { put } from '@vercel/blob';

async function testUpload() {
  try {
    console.log('🔍 Testing Vercel Blob upload...\n');
    
    // Debug: Check if token is loaded
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('❌ BLOB_READ_WRITE_TOKEN not found in environment');
      console.log('\n💡 Solutions:');
      console.log('   1. Make sure .env file exists in project root');
      console.log('   2. Make sure it contains: BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."');
      console.log('   3. Check for typos in variable name');
      console.log('\nCurrent directory:', process.cwd());
      console.log('Looking for .env at:', process.cwd() + '\\.env');
      return;
    }
    
    console.log('✅ Token found (first 20 chars):', process.env.BLOB_READ_WRITE_TOKEN.substring(0, 20) + '...');
    console.log('');
    
    // Create test content
    const testContent = 'Hello from FragView! ' + new Date().toISOString();
    
    // Upload to Vercel Blob
    const blob = await put('test/hello.txt', testContent, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN
    });
    
    console.log('✅ Upload successful!');
    console.log('📍 URL:', blob.url);
    console.log('📦 Size:', blob.size, 'bytes');
    console.log('📅 Uploaded:', blob.uploadedAt);
    console.log('\n💡 Open this URL in browser to verify:', blob.url);
    
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    
    if (error.message.includes('token')) {
      console.log('\n💡 Token issue detected!');
      console.log('   - Token might be invalid');
      console.log('   - Token might be expired');
      console.log('   - Generate a new token from Vercel dashboard');
    } else if (error.message.includes('network')) {
      console.log('\n💡 Network issue - check your internet connection');
    } else {
      console.log('\nFull error:', error);
    }
  }
}

testUpload();