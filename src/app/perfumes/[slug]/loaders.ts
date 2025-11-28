import 'server-only';
import { getPerfumeBySlug } from '@/lib/data/perfumes';
import prisma from '@/lib/prisma';
import { sanitizeSingleDoc } from '@/lib/sanitize';
import { checkThreadFollowStatus } from '@/app/actions/thread';

// 🟢 Helper to calculate XP and level
const getLevel = (xp: number) => {
  if (xp >= 1001) return { title: 'Master', min: 1001, next: 5000 };
  if (xp >= 501) return { title: 'Expert', min: 501, next: 1001 };
  if (xp >= 201) return { title: 'Connoisseur', min: 201, next: 501 };
  if (xp >= 51) return { title: 'Enthusiast', min: 51, next: 201 };
  return { title: 'Novice', min: 0, next: 51 };
};

const XP_RULES = {
  PROFILE: {
    PHOTO: 20,
    LOCATION: 10,
    BIO: 10,
    FAV_PERFUMES: 20,
    FAV_NOTES: 20,
    FAV_ACCORDS: 20,
    FAV_PERFUMERS: 20,
  },
  ACTIVITY: {
    REVIEW_BASE: 10,
    REVIEW_PHOTO: 5,
    HELPFUL_VOTE: 2,
    LIKE: 1,
    WARDROBE_ADD: 1,
  }
};

const calculateProfileXP = (user: any) => {
  let score = 0;
  if (user.image) score += XP_RULES.PROFILE.PHOTO;
  if (user.location) score += XP_RULES. PROFILE.LOCATION;
  if (user.bio) score += XP_RULES. PROFILE.BIO;
  if (user.favPerfumeIds && user.favPerfumeIds.length > 0) score += XP_RULES. PROFILE.FAV_PERFUMES;
  if (user.favNotes && user.favNotes.length > 0) score += XP_RULES.PROFILE.FAV_NOTES;
  if (user.favAccords && user.favAccords.length > 0) score += XP_RULES.PROFILE.FAV_ACCORDS;
  if (user.favPerfumers && user.favPerfumers. length > 0) score += XP_RULES.PROFILE. FAV_PERFUMERS;
  return score;
};

const calculateBadges = (user: any, stats: { reviewCount: number, photoReviewCount: number, helpfulCount: number }) => {
  const badges = new Set<string>(user.badges || []);

  const BETA_CUTOFF = new Date('2025-12-31'); 
  if (new Date(user.createdAt) < BETA_CUTOFF) {
    badges.add('Early Adopter');
  }

  if (stats.reviewCount >= 50) badges.add('Active Reviewer');
  if (stats.photoReviewCount >= 25) badges.add('Photo Contributor');
  if (stats.helpfulCount >= 100) badges. add('Community Helper');

  return Array.from(badges);
};

export async function loadPerfumeDetail(slug: string, currentUserId?: string) {
  const perfumeRaw = await getPerfumeBySlug(slug);
  if (!perfumeRaw) return null;
  const perfume = sanitizeSingleDoc(perfumeRaw);

  const perfumeIdCandidates = Array.from(
    new Set([slug, (perfume as any)._id, (perfume as any).slug]. filter(Boolean). map(String))
  );

  // 🆕 UPDATED: Fetch Reviews with Replies
  const prismaReviews = await prisma.review.findMany({
    where: { 
      OR: perfumeIdCandidates. map((v) => ({ perfumeId: v })),
      parentId: null, // 🆕 Only fetch top-level reviews
    },
    select: { 
      id: true,
      rating: true, 
      text: true, 
      createdAt: true, 
      longevity: true, 
      sillage: true,
      helpfulCount: true,
      photos: true,
      userId: true,
      isEdited: true,      // 🆕 NEW
      editedAt: true,      // 🆕 NEW
      isDeleted: true,     // 🆕 NEW
      user: {
        select: {
          id: true,         // 🆕 NEW
          username: true,
          image: true,
          experiencePoints: true,
          badges: true,
          favPerfumeIds: true,
          favNotes: true,
          favAccords: true,
          favPerfumers: true,
          bio: true,
          location: true,
          createdAt: true,
        }
      },
      // 🆕 NEW: Include nested replies
      replies: {
        select: {
          id: true,
          rating: true,
          text: true,
          createdAt: true,
          isEdited: true,
          editedAt: true,
          isDeleted: true,
          photos: true,
          userId: true,
          user: {
            select: {
              id: true,
              username: true,
              image: true,
              experiencePoints: true,
              badges: true,
              favPerfumeIds: true,
              favNotes: true,
              favAccords: true,
              favPerfumers: true,
              bio: true,
              location: true,
              createdAt: true,
            }
          },
        },
        orderBy: { createdAt: 'asc' },
      },
      helpful: currentUserId ? {
        where: { userId: currentUserId },
        select: { id: true }
      } : false
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  // 2. Check if current user is following this thread
  let isFollowingThread = false;
  if (currentUserId) {
    isFollowingThread = await checkThreadFollowStatus(slug, currentUserId);
  }

  // --- AGGREGATION LOGIC ---
  const mongoVotes = (perfume. votes || 0); 
  const mongoRating = (perfume.rating || 0);
  const mongoLongevity = (perfume.longevity || 0);
  const mongoSillage = (perfume.sillage || 0);

  const validRatings = prismaReviews.filter(r => r.rating > 0);
  const newRatingSum = validRatings.reduce((sum, r) => sum + r.rating, 0);
  const newRatingCount = validRatings.length;

  const newLongevityReviews = prismaReviews.filter(r => r.longevity && r.longevity > 0);
  const newLongevitySum = newLongevityReviews.reduce((sum, r) => sum + (r.longevity || 0), 0);
  const newLongevityCount = newLongevityReviews.length;

  const newSillageReviews = prismaReviews.filter(r => r. sillage && r.sillage > 0);
  const newSillageSum = newSillageReviews.reduce((sum, r) => sum + (r.sillage || 0), 0);
  const newSillageCount = newSillageReviews.length;

  const fmt = (n: number) => Math.round(n * 100) / 100;

  const totalVotes = mongoVotes + newRatingCount;
  const aggregateRating = totalVotes > 0
    ? ((mongoRating * mongoVotes) + newRatingSum) / totalVotes
    : 0;

  const totalLongevityVotes = mongoVotes + newLongevityCount;
  const aggregateLongevity = totalLongevityVotes > 0
    ? ((mongoLongevity * mongoVotes) + newLongevitySum) / totalLongevityVotes
    : 0;

  const totalSillageVotes = mongoVotes + newSillageCount;
  const aggregateSillage = totalSillageVotes > 0
    ? ((mongoSillage * mongoVotes) + newSillageSum) / totalSillageVotes
    : 0;

  // 🆕 Helper function to calculate user stats and process review/reply
  const processUserData = async (userId: string, userData: any) => {
    const userReviewStats = await prisma.review.aggregate({
      where: { userId },
      _sum: { helpfulCount: true, likeCount: true },
      _count: { _all: true }
    });

    const reviewsWithPhotos = await prisma.review. count({
      where: {
        userId,
        NOT: { photos: { equals: [] } }
      }
    });

    const wardrobeCount = await prisma. wardrobeEntry.count({ where: { userId } });

    const reviewCount = userReviewStats._count._all;
    const totalHelpful = userReviewStats._sum. helpfulCount || 0;
    const totalLikes = userReviewStats._sum. likeCount || 0;

    const xpFromReviews = reviewCount * XP_RULES. ACTIVITY.REVIEW_BASE;
    const xpFromPhotos = reviewsWithPhotos * XP_RULES.ACTIVITY.REVIEW_PHOTO;
    const xpFromHelpful = totalHelpful * XP_RULES.ACTIVITY.HELPFUL_VOTE;
    const xpFromLikes = totalLikes * XP_RULES.ACTIVITY.LIKE;
    const xpFromWardrobe = wardrobeCount * XP_RULES.ACTIVITY.WARDROBE_ADD;

    const activityXP = xpFromReviews + xpFromPhotos + xpFromHelpful + xpFromLikes + xpFromWardrobe;
    const profileXP = calculateProfileXP(userData);
    const manualXP = userData.experiencePoints || 0;

    const totalXP = activityXP + profileXP + manualXP;
    const levelInfo = getLevel(totalXP);

    const badges = calculateBadges(userData, {
      reviewCount,
      photoReviewCount: reviewsWithPhotos,
      helpfulCount: totalHelpful
    });

    return { totalXP, levelInfo, badges };
  };

  // 3. Process reviews with replies
  const reviews = await Promise.all(prismaReviews.map(async (r) => {
    const { totalXP, levelInfo, badges } = await processUserData(r.userId, r. user);

    // Process replies
    const processedReplies = r.replies ?  await Promise.all(
      r.replies.map(async (reply) => {
        const replyStats = await processUserData(reply. userId, reply.user);

        return {
          id: reply.id,
          rating: reply.rating,
          text: reply.text,
          photos: reply.photos || [],
          createdAt: reply.createdAt. toISOString(),
          isEdited: reply.isEdited || false,
          editedAt: reply.editedAt?.toISOString() || null,
          isDeleted: reply.isDeleted || false,
          user: {
            id: reply. user.id,
            username: reply.user.username || 'User',
            image: reply.user.image,
            xp: replyStats.totalXP,
            level: replyStats.levelInfo. title,
            badges: replyStats.badges
          }
        };
      })
    ) : [];

    return {
      id: r.id,
      rating: r.rating,
      text: r.text,
      photos: r.photos,
      helpfulCount: r.helpfulCount,
      userVote: (r.helpful && r.helpful.length > 0) ? 'UP' as const : null,
      createdAt: r.createdAt.toISOString(),
      isEdited: r.isEdited || false,
      editedAt: r.editedAt?.toISOString() || null,
      isDeleted: r.isDeleted || false,
      user: {
        id: r.user.id,
        username: r.user.username || 'User',
        image: r.user.image,
        xp: totalXP,
        level: levelInfo.title,
        badges: badges
      },
      replies: processedReplies, // 🆕 NEW
    };
  }));

  return {
    perfume: {
      ... perfume,
      rating: fmt(aggregateRating), 
      votes: totalVotes, 
      longevity: fmt(aggregateLongevity),
      sillage: fmt(aggregateSillage),
    },
    rating: fmt(aggregateRating),
    reviewCount: totalVotes,
    reviews,
    isFollowingThread,
  };
}