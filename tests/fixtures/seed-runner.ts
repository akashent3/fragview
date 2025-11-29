import { generateTestData } from './test-data-generator';

console.log('🌱 Running test data generator...\n');

generateTestData()
  .then(() => {
    console.log('\n✅ Test data generation complete!');
    process.exit(0);
  })
  . catch((error) => {
    console.error('\n❌ Error:', error);
    process. exit(1);
  });