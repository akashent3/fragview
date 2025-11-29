import { FullConfig } from '@playwright/test';
import { cleanupTestData } from './fixtures/test-data-cleanup'; // ✅ Remove .js

async function globalTeardown(config: FullConfig) {
  console.log('\n' + '='.repeat(70));
  console.log('🧹 PLAYWRIGHT GLOBAL TEARDOWN - STARTING');
  console.log('='.repeat(70) + '\n');

  try {
    await cleanupTestData();

    console.log('\n' + '='.repeat(70));
    console.log('✅ GLOBAL TEARDOWN COMPLETE - ALL TEST DATA REMOVED');
    console.log('='.repeat(70) + '\n');
  } catch (error) {
    console.error('\n' + '='.repeat(70));
    console.error('❌ GLOBAL TEARDOWN FAILED');
    console.error('='.repeat(70));
    console.error(error);
    throw error;
  }
}

export default globalTeardown;