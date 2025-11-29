import { PrismaClient } from '@prisma/client';
import { getMongoDb } from '../../src/lib/mongodb';

const prisma = new PrismaClient();

export async function cleanupTestData(): Promise<void> {
  console.log('\n' + '='.repeat(60));
  console.log('🧹 STARTING HYBRID TEST DATA CLEANUP');
  console.log('='.repeat(60) + '\n');

  try {
    // Connect to MongoDB
    const mongoDb = await getMongoDb();
    const brandsCollection = mongoDb.collection('brands');
    const perfumesCollection = mongoDb.collection('perfumes');

    // ==========================================
    // PHASE 1: CLEAN SUPABASE (POSTGRESQL)
    // ==========================================
    console.log('🟣 PHASE 1: Cleaning Supabase (PostgreSQL) data...\n');

    // 1. Delete notifications for test users
    console.log('  🔔 Deleting test notifications...');
    const notifResult = await prisma.notification.deleteMany({
      where: {
        user: {
          username: { startsWith: 'testuser' }
        }
      }
    });
    console.log(`     ✅ Deleted ${notifResult.count} notifications`);

    // 2.  Delete follows
    console.log('  👥 Deleting test follow relationships...');
    const followResult = await prisma.follow.deleteMany({
      where: {
        OR: [
          { follower: { username: { startsWith: 'testuser' } } },
          { following: { username: { startsWith: 'testuser' } } }
        ]
      }
    });
    console.log(`     ✅ Deleted ${followResult.count} follow relationships`);

    // 3. Delete thread follows
    console.log('  🧵 Deleting test thread follows...');
    const threadFollowResult = await prisma.threadFollow.deleteMany({
      where: {
        userId: {
          in: (await prisma.user.findMany({
            where: { username: { startsWith: 'testuser' } },
            select: { id: true }
          })).map(u => u. id)
        }
      }
    });
    console.log(`     ✅ Deleted ${threadFollowResult.count} thread follows`);

    // 4. Delete articles
    console. log('  📝 Deleting test articles...');
    const articleResult = await prisma.article.deleteMany({
      where: {
        slug: { startsWith: 'test-article-' }
      }
    });
    console.log(`     ✅ Deleted ${articleResult.count} articles`);

    // 5. Delete brand owner submissions
    console.log('  🏢 Deleting brand owner applications...');
    const brandAppResult = await prisma.brandOwnerSubmission.deleteMany({
      where: {
        brandName: { startsWith: 'Test Brand Application' }
      }
    });
    console.log(`     ✅ Deleted ${brandAppResult.count} brand applications`);

    // 6.  Delete community submissions
    console.log('  📤 Deleting community submissions...');
    const submissionResult = await prisma.communitySubmission.deleteMany({
      where: {
        user: {
          username: { startsWith: 'testuser' }
        }
      }
    });
    console.log(`     ✅ Deleted ${submissionResult.count} submissions`);

    // 7.  Delete wardrobe entries
    console.log('  👔 Deleting wardrobe entries...');
    const wardrobeResult = await prisma.wardrobeEntry.deleteMany({
      where: {
        user: {
          username: { startsWith: 'testuser' }
        }
      }
    });
    console.log(`     ✅ Deleted ${wardrobeResult.count} wardrobe entries`);

    // 8.  Delete similar perfume votes
    console.log('  🗳️  Deleting similar perfume votes.. .');
    const voteResult = await prisma.similarPerfumeVote.deleteMany({
      where: {
        user: {
          username: { startsWith: 'testuser' }
        }
      }
    });
    console.log(`     ✅ Deleted ${voteResult.count} votes`);

    // 9.  Delete review helpful votes
    console.log('  👍 Deleting review helpful votes...');
    const helpfulResult = await prisma.reviewHelpful.deleteMany({
      where: {
        review: {
          user: {
            username: { startsWith: 'testuser' }
          }
        }
      }
    });
    console. log(`     ✅ Deleted ${helpfulResult.count} helpful votes`);

    // 10. Delete reviews
    console.log('  ⭐ Deleting reviews...');
    const reviewResult = await prisma.review.deleteMany({
      where: {
        user: {
          username: { startsWith: 'testuser' }
        }
      }
    });
    console.log(`     ✅ Deleted ${reviewResult.count} reviews`);

    // 11. Delete ratings
    console.log('  ⭐ Deleting ratings...');
    const ratingResult = await prisma.rating.deleteMany({
      where: {
        user: {
          username: { startsWith: 'testuser' }
        }
      }
    });
    console.log(`     ✅ Deleted ${ratingResult.count} ratings`);

    // 11. Delete test users (INCLUDING admin)
    console.log('  👤 Deleting test users...');
    const userResult = await prisma.user.deleteMany({
      where: {
        OR: [
          { username: { startsWith: 'testuser' } },
          { username: 'testadmin' },
          { email: 'admin@fragview.com' }
        ]
      }
    });
    console.log(`     ✅ Deleted ${userResult.count} users\n`);

    // ==========================================
    // PHASE 2: CLEAN MONGODB
    // ==========================================
    console.log('🟢 PHASE 2: Cleaning MongoDB data...\n');

    // 1. Delete test perfumes
    console.log('  🌸 Deleting test perfumes...');
    const perfumeDeleteResult = await perfumesCollection.deleteMany({ testData: true });
    console.log(`     ✅ Deleted ${perfumeDeleteResult.deletedCount} perfumes`);

    // 2. Delete test brands
    console.log('  🏢 Deleting test brands...');
    const brandDeleteResult = await brandsCollection.deleteMany({ testData: true });
    console. log(`     ✅ Deleted ${brandDeleteResult.deletedCount} brands\n`);

    // ==========================================
    // SUMMARY
    // ==========================================
    console.log('='.repeat(60));
    console.log('✅ HYBRID TEST DATA CLEANUP COMPLETE!');
    console.log('='. repeat(60));
    console. log('\n📊 Cleanup Summary:');
    console. log(`   🟣 SUPABASE:`);
    console.log(`      - Notifications: ${notifResult.count}`);
    console. log(`      - Follow Relationships: ${followResult.count}`);
    console.log(`      - Articles: ${articleResult.count}`);
    console.log(`      - Brand Applications: ${brandAppResult.count}`);
    console.log(`      - Submissions: ${submissionResult.count}`);
    console.log(`      - Wardrobe Entries: ${wardrobeResult.count}`);
    console.log(`      - Reviews: ${reviewResult.count}`);
    console.log(`      - Ratings: ${ratingResult. count}`);
    console.log(`      - Users: ${userResult.count}`);
    console. log(`\n   🟢 MONGODB:`);
    console.log(`      - Perfumes: ${perfumeDeleteResult.deletedCount}`);
    console.log(`      - Brands: ${brandDeleteResult.deletedCount}`);
    console.log('\n' + '='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error cleaning up test data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}