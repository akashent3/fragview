import 'server-only';
import { getPerfumeBySlug } from '@/lib/data/perfumes';
import prisma from '@/lib/prisma';
import { sanitizeSingleDoc } from '@/lib/sanitize';

export async function loadPerfumeDetail(slug: string, currentUserId?: string) {
  const perfumeRaw = await getPerfumeBySlug(slug);
  if (!perfumeRaw) return null;
  const perfume = sanitizeSingleDoc(perfumeRaw);

  const perfumeIdCandidates = Array.from(
    new Set([slug, (perfume as any)._id, (perfume as any).slug].filter(Boolean).map(String))
  );

  // 1. Fetch Reviews from Postgres (Including User Data)
  const prismaReviews = await prisma.review.findMany({
    where: { OR: perfumeIdCandidates.map((v) => ({ perfumeId: v })) },
    select: { 
      id: true,
      rating: true, 
      text: true, 
      createdAt: true, 
      longevity: true, 
      sillage: true,
      helpfulCount: true,
      photos: true,
      // 🟢 FETCH USER DATA HERE
      user: {
        select: {
          username: true,
          image: true
        }
      },
      helpful: currentUserId ? {
        where: { userId: currentUserId },
        select: { id: true }
      } : false
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  // --- AGGREGATION LOGIC (No changes to math) ---
  const mongoVotes = (perfume.votes || 0); 
  const mongoRating = (perfume.rating || 0);
  const mongoLongevity = (perfume.longevity || 0);
  const mongoSillage = (perfume.sillage || 0);

  const validRatings = prismaReviews.filter(r => r.rating > 0);
  const newRatingSum = validRatings.reduce((sum, r) => sum + r.rating, 0);
  const newRatingCount = validRatings.length;

  const newLongevityReviews = prismaReviews.filter(r => r.longevity && r.longevity > 0);
  const newLongevitySum = newLongevityReviews.reduce((sum, r) => sum + (r.longevity || 0), 0);
  const newLongevityCount = newLongevityReviews.length;

  const newSillageReviews = prismaReviews.filter(r => r.sillage && r.sillage > 0);
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

  // 3. Format for Client (Pass User Data Forward)
  const reviews = prismaReviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    text: r.text,
    photos: r.photos,
    helpfulCount: r.helpfulCount,
    userVote: (r.helpful && r.helpful.length > 0) ? 'UP' : null,
    createdAt: r.createdAt.toISOString(),
    // 🟢 MAP USER DATA
    user: {
        username: r.user.username || 'User',
        image: r.user.image
    }
  }));

  return {
    perfume: {
      ...perfume,
      rating: fmt(aggregateRating), 
      votes: totalVotes, 
      longevity: fmt(aggregateLongevity),
      sillage: fmt(aggregateSillage),
    },
    rating: fmt(aggregateRating),
    reviewCount: totalVotes,
    reviews,
  };
}