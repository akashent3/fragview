import 'server-only';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Helper to calculate XP and level
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
  if (user.bio) score += XP_RULES.PROFILE. BIO;
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
    badges. add('Early Adopter');
  }

  if (stats.reviewCount >= 50) badges.add('Active Reviewer');
  if (stats.photoReviewCount >= 25) badges.add('Photo Contributor');
  if (stats.helpfulCount >= 100) badges. add('Community Helper');

  return Array.from(badges);
};

export async function loadPublicProfile(username: string, currentUserId?: string) {
  try {
    // 1. Fetch user by username
    const userRecord = await prisma.user.findUnique({ 
      where: { username: username },
      select: {
        id: true,
        username: true,
        image: true,
        bio: true,
        location: true,
        createdAt: true,
        experiencePoints: true,
        badges: true,
        favNotes: true,
        favAccords: true,
        favPerfumers: true,
        favPerfumeIds: true,
        isWardrobePublic: true,
        isActivityPublic: true,
      }
    });

    if (! userRecord) return null;

    // Check if this is the user's own profile
    const isOwnProfile = currentUserId === userRecord.id;

    // 2. Fetch counts
    const [wardrobeCount, followingCount, followerCount] = await Promise.all([
      prisma.wardrobeEntry.count({ where: { userId: userRecord.id } }),
      prisma.follow.count({ where: { followerId: userRecord.id } }),
      prisma.follow.count({ where: { followingId: userRecord.id } })
    ]);

    // 3. Check follow status (UPDATED)
    let followStatus: 'none' | 'pending' | 'approved' = 'none';
    if (currentUserId && ! isOwnProfile) {
      const followRecord = await prisma.follow. findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: userRecord.id
          }
        }
      });
      if (followRecord) {
        followStatus = followRecord.status.toLowerCase() as 'pending' | 'approved';
      }
    }

    // 4.  Aggregate Review Stats
    const reviewStats = await prisma.review. aggregate({
      where: { userId: userRecord.id },
      _sum: {
        helpfulCount: true,
        likeCount: true,
      },
      _count: {
        _all: true,
      }
    });

    const reviewsWithPhotos = await prisma.review. count({
      where: {
        userId: userRecord.id,
        NOT: {
          photos: { equals: [] }
        }
      }
    });

    const reviewCount = reviewStats._count._all;
    const totalHelpful = reviewStats._sum. helpfulCount || 0;
    const totalLikes = reviewStats._sum.likeCount || 0;

    // 5. Calculate Total XP
    const xpFromReviews = reviewCount * XP_RULES.ACTIVITY. REVIEW_BASE;
    const xpFromPhotos = reviewsWithPhotos * XP_RULES.ACTIVITY.REVIEW_PHOTO;
    const xpFromHelpful = totalHelpful * XP_RULES. ACTIVITY.HELPFUL_VOTE;
    const xpFromLikes = totalLikes * XP_RULES.ACTIVITY.LIKE;
    const xpFromWardrobe = wardrobeCount * XP_RULES.ACTIVITY. WARDROBE_ADD;

    const activityXP = xpFromReviews + xpFromPhotos + xpFromHelpful + xpFromLikes + xpFromWardrobe;
    const profileXP = calculateProfileXP(userRecord);
    const manualXP = userRecord.experiencePoints || 0; 

    const totalXP = activityXP + profileXP + manualXP;
    const levelInfo = getLevel(totalXP);

    // 6. Calculate Badges
    const badges = calculateBadges(userRecord, {
      reviewCount,
      photoReviewCount: reviewsWithPhotos,
      helpfulCount: totalHelpful
    });

    // 7.  Fetch Recent Activity (if public or own profile)
    let recentReviews: any[] = [];
    let recentWardrobe: any[] = [];

    if (isOwnProfile || userRecord.isActivityPublic) {
      // 🟢 UPDATED: Added longevity and sillage fields
      recentReviews = await prisma.review.findMany({
        where: { userId: userRecord.id },
        select: {
          id: true,
          rating: true,
          longevity: true,    // 🟢 ADDED
          sillage: true,      // 🟢 ADDED
          text: true,
          photos: true,
          perfumeId: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      });
    }

    // 8. Fetch Recent Wardrobe (for activity feed only)
    if (isOwnProfile || userRecord.isActivityPublic) {
      recentWardrobe = await prisma. wardrobeEntry.findMany({
        where: { userId: userRecord.id },
        select: {
          id: true,
          perfumeId: true,
          subcategory: true,
          status: true,
          updatedAt: true
        },
        orderBy: { updatedAt: 'desc' },
        take: 10
      });
    }

    // 9. Fetch FULL wardrobe if public (for wardrobe section)
    let fullWardrobe: any[] = [];
    let wardrobeStats = {
      currentlyUsing: 0,
      wishlist: 0,
      inCollection: 0,
      total: 0
    };

    if (isOwnProfile || userRecord.isWardrobePublic) {
      const wardrobeEntries = await prisma.wardrobeEntry.findMany({
        where: { userId: userRecord. id },
        select: {
          id: true,
          perfumeId: true,
          subcategory: true,
          status: true,
          notes: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: 'desc' },
      });

      // Calculate stats
      wardrobeStats = {
        currentlyUsing: wardrobeEntries.filter(w => w.status === 'CURRENTLY_USING').length,
        wishlist: wardrobeEntries.filter(w => w. status === 'WISH_LIST').length,
        inCollection: wardrobeEntries. filter(w => w.status === 'IN_COLLECTION').length,
        total: wardrobeEntries.length
      };

      // Resolve perfume details for full wardrobe
      const wardrobePerfumeIds = wardrobeEntries.map(w => w.perfumeId);
      const activityIds = [... recentReviews.map((r: any) => r.perfumeId), ...recentWardrobe.map(w => w.perfumeId)];
      const signatureIds = userRecord.favPerfumeIds || [];
      
      const allIds = Array.from(new Set([...activityIds, ...signatureIds, ...wardrobePerfumeIds]));
      
      const validObjectIds = allIds
        .filter(id => /^[0-9a-fA-F]{24}$/. test(id))
        .map(id => new ObjectId(id));
          
      const slugs = allIds;

      const client = await clientPromise;
      const db = client.db('fragview');
      
      const perfumes = await db.collection('perfumes')
        .find({
          $or: [
            { _id: { $in: validObjectIds } },
            { slug: { $in: slugs } }
          ]
        })
        .project({ name: 1, variant_name: 1, brand: 1, brand_name: 1, image: 1, images: 1, slug: 1 })
        .toArray();

      const getPerfumeInfo = (id: string) => {
        const p: any = perfumes.find(perf => 
          perf._id.toString() === id || perf.slug === id
        );

        let brandName = 'Unknown Brand';
        if (p?. brand_name) brandName = p.brand_name;
        else if (typeof p?.brand === 'object' && p?.brand?. name) brandName = p.brand.name;
        else if (typeof p?.brand === 'string') brandName = p.brand;
        
        return {
          id: id,
          slug: p?.slug || id,
          name: p?.variant_name || p?.name || 'Unknown Perfume',
          brand: brandName,
          image: p?. image || p?.images?.[0] || ''
        };
      };

      // Map wardrobe with perfume info
      fullWardrobe = wardrobeEntries.map(w => {
        const info = getPerfumeInfo(w.perfumeId);
        return {
          id: w.id,
          perfumeId: w.perfumeId,
          slug: info.slug,
          name: info.name,
          brand: info.brand,
          image: info.image,
          subcategory: w.subcategory,
          status: w.status,
          notes: w.notes,
          createdAt: w.createdAt,
          updatedAt: w.updatedAt,
        };
      });

      // 🟢 UPDATED: Map activity with perfume info + longevity/sillage
      const activities = [
        ...recentReviews.map((r: any) => {
          const info = getPerfumeInfo(r.perfumeId);
          return {
            id: r.id,
            type: 'review' as const,
            fragranceName: info.name,
            brand: info.brand,
            image: info.image,
            slug: info.slug,
            date: r.createdAt,
            rating: r.rating,
            longevity: r.longevity,    // 🟢 ADDED
            sillage: r. sillage,        // 🟢 ADDED
            preview: r.text ?  r.text.substring(0, 60) + '...' : undefined
          };
        }),
        ... recentWardrobe.map(w => {
          const info = getPerfumeInfo(w. perfumeId);
          return {
            id: w.id,
            type: 'wardrobe' as const,
            fragranceName: info.name,
            brand: info.brand,
            image: info.image,
            slug: info.slug,
            date: w.updatedAt,
            subcat: w.subcategory,
            status: w.status
          };
        })
      ].sort((a, b) => b.date. getTime() - a.date.getTime()). slice(0, 10);

      const signatureScents = signatureIds.map(id => getPerfumeInfo(id));

      return {
        user: {
          id: userRecord.id,
          username: userRecord. username,
          image: userRecord.image,
          bio: userRecord.bio,
          location: userRecord.location,
          joinDate: userRecord.createdAt,
          badges: badges,
        },
        stats: {
          reviews: reviewCount,
          wardrobe: wardrobeCount,
          helpful: totalHelpful,
          followers: followerCount,
          following: followingCount
        },
        gamification: {
          xp: totalXP,
          level: levelInfo.title,
          nextLevelXP: levelInfo.next,
          progress: Math.min(100, Math.round(((totalXP - levelInfo.min) / (levelInfo.next - levelInfo.min)) * 100)),
        },
        privacy: {
          isWardrobePublic: userRecord.isWardrobePublic,
          isActivityPublic: userRecord.isActivityPublic,
          isOwnProfile: isOwnProfile
        },
        followStatus: followStatus,
        recentActivity: activities,
        signatureScents: signatureScents,
        fullWardrobe: fullWardrobe,
        wardrobeStats: wardrobeStats,
      };
    } else {
      // If wardrobe is private, still need to get perfume info for activity and signature scents
      const activityIds = [...recentReviews.map((r: any) => r. perfumeId), ...recentWardrobe.map(w => w.perfumeId)];
      const signatureIds = userRecord.favPerfumeIds || [];
      
      const allIds = Array.from(new Set([...activityIds, ...signatureIds]));
      
      const validObjectIds = allIds
        .filter(id => /^[0-9a-fA-F]{24}$/.test(id))
        .map(id => new ObjectId(id));
          
      const slugs = allIds;

      const client = await clientPromise;
      const db = client.db('fragview');
      
      const perfumes = await db.collection('perfumes')
        .find({
          $or: [
            { _id: { $in: validObjectIds } },
            { slug: { $in: slugs } }
          ]
        })
        .project({ name: 1, variant_name: 1, brand: 1, brand_name: 1, image: 1, images: 1, slug: 1 })
        .toArray();

      const getPerfumeInfo = (id: string) => {
        const p: any = perfumes.find(perf => 
          perf._id.toString() === id || perf.slug === id
        );

        let brandName = 'Unknown Brand';
        if (p?.brand_name) brandName = p.brand_name;
        else if (typeof p?.brand === 'object' && p?.brand?.name) brandName = p.brand.name;
        else if (typeof p?.brand === 'string') brandName = p.brand;
        
        return {
          id: id,
          slug: p?. slug || id,
          name: p?.variant_name || p?. name || 'Unknown Perfume',
          brand: brandName,
          image: p?.image || p?.images?.[0] || ''
        };
      };

      // 🟢 UPDATED: Map activity with longevity/sillage
      const activities = [
        ...recentReviews.map((r: any) => {
          const info = getPerfumeInfo(r.perfumeId);
          return {
            id: r.id,
            type: 'review' as const,
            fragranceName: info.name,
            brand: info.brand,
            image: info.image,
            slug: info.slug,
            date: r.createdAt,
            rating: r.rating,
            longevity: r.longevity,    // 🟢 ADDED
            sillage: r. sillage,        // 🟢 ADDED
            preview: r.text ? r.text.substring(0, 60) + '...' : undefined
          };
        }),
        ...recentWardrobe.map(w => {
          const info = getPerfumeInfo(w.perfumeId);
          return {
            id: w.id,
            type: 'wardrobe' as const,
            fragranceName: info.name,
            brand: info.brand,
            image: info.image,
            slug: info.slug,
            date: w.updatedAt,
            subcat: w.subcategory,
            status: w.status
          };
        })
      ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10);

      const signatureScents = signatureIds.map(id => getPerfumeInfo(id));

      return {
        user: {
          id: userRecord.id,
          username: userRecord.username,
          image: userRecord.image,
          bio: userRecord.bio,
          location: userRecord.location,
          joinDate: userRecord.createdAt,
          badges: badges,
        },
        stats: {
          reviews: reviewCount,
          wardrobe: wardrobeCount,
          helpful: totalHelpful,
          followers: followerCount,
          following: followingCount
        },
        gamification: {
          xp: totalXP,
          level: levelInfo.title,
          nextLevelXP: levelInfo.next,
          progress: Math.min(100, Math.round(((totalXP - levelInfo.min) / (levelInfo.next - levelInfo.min)) * 100)),
        },
        privacy: {
          isWardrobePublic: userRecord.isWardrobePublic,
          isActivityPublic: userRecord.isActivityPublic,
          isOwnProfile: isOwnProfile
        },
        followStatus: followStatus,
        recentActivity: activities,
        signatureScents: signatureScents,
        fullWardrobe: [],
        wardrobeStats: {
          currentlyUsing: 0,
          wishlist: 0,
          inCollection: 0,
          total: 0
        },
      };
    }
  } catch (error) {
    console. error('Error loading public profile:', error);
    return null;
  }
}