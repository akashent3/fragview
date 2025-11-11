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

  const reviews = await prisma.review.findMany({
    where: { OR: perfumeIdCandidates.map((v) => ({ perfumeId: v })) },
    select: { rating: true, text: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  const reviewCount = reviews.length;
  const avgRating = reviewCount
    ? Math.round((reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviewCount) * 100) / 100
    : typeof perfume.rating === 'number'
    ? perfume.rating
    : 0;

  return {
    perfume,
    rating: avgRating,
    reviews,
    reviewCount,
  };
}