import { cleanupTestData } from './test-data-cleanup';

console.log('🧹 Running test data cleanup...\n');

cleanupTestData()
  .then(() => {
    console.log('\n✅ Cleanup complete!');
    process. exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });