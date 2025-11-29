import { FullConfig } from '@playwright/test';
import { generateTestData } from './fixtures/test-data-generator';
import { cleanupTestData } from './fixtures/test-data-cleanup';

async function globalSetup(config: FullConfig) {
  console.log('\n' + '='.repeat(70));
  console.log('🚀 PLAYWRIGHT GLOBAL SETUP - STARTING');
  console.log('='.repeat(70) + '\n');

  try {
    // Cleanup first to ensure clean state
    console.log('🧹 Pre-cleanup: Removing any existing test data...\n');
    try {
      await cleanupTestData();
      console.log('✅ Pre-cleanup complete\n');
    } catch (error) {
      console.log('⚠️  Pre-cleanup skipped (likely first run)\n');
    }
    
    // Generate fresh test data
    console.log('📦 Generating fresh test data...\n');
    await generateTestData();

    console.log('\n' + '='.repeat(70));
    console.log('✅ GLOBAL SETUP COMPLETE - READY TO RUN TESTS');
    console.log('='.repeat(70) + '\n');
  } catch (error) {
    console.error('\n' + '='.repeat(70));
    console.error('❌ GLOBAL SETUP FAILED');
    console.error('='.repeat(70));
    console.error(error);
    throw error;
  }
}

export default globalSetup;