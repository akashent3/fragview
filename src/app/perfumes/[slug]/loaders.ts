import 'server-only';
import { getPerfumeBySlug } from '@/lib/data/perfumes';
import prisma from '@/lib/prisma';
import { sanitizeSingleDoc } from '@/lib/sanitize';

export async function loadPerfumeDetail(slug: string) {
  const perfumeRaw = await getPerfumeBySlug(slug);
  if (!perfumeRaw) return null;
  const perfume = sanitizeSingleDoc(perfumeRaw);

  const perfumeIdCandidates = Array.from(
    new Set([slug, (perfume as any)._id, (perfume as any).slug].filter(Boolean).map(String))
  );

  // 1. Fetch New Reviews from Postgres
  const prismaReviews = await prisma.review.findMany({
    where: { OR: perfumeIdCandidates.map((v) => ({ perfumeId: v })) },
    select: { rating: true, text: true, createdAt: true, longevity: true, sillage: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  // --- AGGREGATION LOGIC (Weighted Average) ---

  // A. MongoDB Data (Baseline)
  // We rely on the fields backfilled by the script
  const mongoVotes = (perfume.votes || 0); 
  const mongoRating = (perfume.rating || 0);
  const mongoLongevity = (perfume.longevity || 0);
  const mongoSillage = (perfume.sillage || 0);

  // B. Postgres Data (New)
  // Filter out 0 ratings so they don't drag down the average
  const validRatings = prismaReviews.filter(r => r.rating > 0);
  const newRatingSum = validRatings.reduce((sum, r) => sum + r.rating, 0);
  const newRatingCount = validRatings.length;

  // Longevity sums (only count non-zero)
  const newLongevityReviews = prismaReviews.filter(r => r.longevity && r.longevity > 0);
  const newLongevitySum = newLongevityReviews.reduce((sum, r) => sum + (r.longevity || 0), 0);
  const newLongevityCount = newLongevityReviews.length;

  // Sillage sums (only count non-zero)
  const newSillageReviews = prismaReviews.filter(r => r.sillage && r.sillage > 0);
  const newSillageSum = newSillageReviews.reduce((sum, r) => sum + (r.sillage || 0), 0);
  const newSillageCount = newSillageReviews.length;

  // C. Calculate Weighted Averages
  // Formula: ((BaseAvg * BaseCount) + NewSum) / (BaseCount + NewCount)

  const fmt = (n: number) => Math.round(n * 100) / 100;

  // 1. Overall Rating
  const totalVotes = mongoVotes + newRatingCount; // Only count valid star ratings
  const aggregateRating = totalVotes > 0
    ? ((mongoRating * mongoVotes) + newRatingSum) / totalVotes
    : 0;

  // 2. Longevity
  // Assume MongoDB 'votes' applies to longevity too for the baseline weight
  const totalLongevityVotes = mongoVotes + newLongevityCount;
  const aggregateLongevity = totalLongevityVotes > 0
    ? ((mongoLongevity * mongoVotes) + newLongevitySum) / totalLongevityVotes
    : 0;

  // 3. Sillage
  // Assume MongoDB 'votes' applies to sillage too for the baseline weight
  const totalSillageVotes = mongoVotes + newSillageCount;
  const aggregateSillage = totalSillageVotes > 0
    ? ((mongoSillage * mongoVotes) + newSillageSum) / totalSillageVotes
    : 0;

  // 3. Format for Client
  const reviews = prismaReviews.map((r) => ({
    rating: r.rating,
    text: r.text,
    createdAt: r.createdAt.toISOString(),
  }));

  return {
    perfume: {
      ...perfume,
      // Override static mongo values with the calculated aggregates
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