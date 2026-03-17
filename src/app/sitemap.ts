import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.fragview.com';
const URLS_PER_SITEMAP = 45000; // Under Google's 50,000 limit

// ── Static public pages (always included in chunk 0) ─────────────────────────
const staticPages: MetadataRoute.Sitemap = [
  { url: BASE_URL,                            lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
  { url: `${BASE_URL}/perfumes`,              lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
  { url: `${BASE_URL}/brands`,                lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
  { url: `${BASE_URL}/drydown`,               lastModified: new Date(), changeFrequency: 'daily',   priority: 0.8 },
  { url: `${BASE_URL}/discover`,              lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.7 },
  { url: `${BASE_URL}/search`,                lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  { url: `${BASE_URL}/contact`,               lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  { url: `${BASE_URL}/submit`,                lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  { url: `${BASE_URL}/submit/brand`,          lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  { url: `${BASE_URL}/submit/community`,      lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
];

// ── Tell Next.js how many sitemap chunks to generate ─────────────────────────
// id=0 → static pages + articles
// id=1..N → perfume + brand pages in batches of 45,000
export async function generateSitemaps() {
  try {
    const { connectMongoDB } = await import('@/lib/mongodb');
    const { db } = await connectMongoDB();

    const [perfumeCount, brandCount] = await Promise.all([
      db.collection('perfumes').countDocuments({ slug: { $exists: true, $ne: null } }),
      db.collection('brands').countDocuments({ slug: { $exists: true, $ne: null } }),
    ]);

    const totalDynamic = perfumeCount + brandCount;
    const dynamicChunks = Math.ceil(totalDynamic / URLS_PER_SITEMAP) || 1;

    return [
      { id: 0 },
      ...Array.from({ length: dynamicChunks }, (_, i) => ({ id: i + 1 })),
    ];
  } catch {
    // If DB is unavailable during build, just produce one static chunk
    return [{ id: 0 }];
  }
}

// ── Per-chunk sitemap function ────────────────────────────────────────────────
export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {

  // ── Chunk 0: static pages + published articles ──────────────────────────────
  if (id === 0) {
    let articlePages: MetadataRoute.Sitemap = [];
    try {
      const prisma = (await import('@/lib/prisma')).default;
      const articles = await (prisma as any).article.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true, publishedAt: true },
      });
      articlePages = articles
        .filter((a: any) => a.slug)
        .map((a: any) => ({
          url: `${BASE_URL}/drydown/${a.slug}`,
          lastModified: a.updatedAt || a.publishedAt || new Date(),
          changeFrequency: 'monthly' as const,
          priority: 0.6,
        }));
    } catch (error) {
      console.error('[Sitemap 0] Failed to fetch articles:', error);
    }
    return [...staticPages, ...articlePages];
  }

  // ── Chunks 1+: perfumes then brands, paginated ───────────────────────────────
  try {
    const { connectMongoDB } = await import('@/lib/mongodb');
    const { db } = await connectMongoDB();

    const perfumeCount = await db
      .collection('perfumes')
      .countDocuments({ slug: { $exists: true, $ne: null } });

    const skip = (id - 1) * URLS_PER_SITEMAP;
    const results: MetadataRoute.Sitemap = [];

    if (skip < perfumeCount) {
      // This chunk falls (at least partly) in the perfumes range
      const perfumes = await db
        .collection('perfumes')
        .find({ slug: { $exists: true, $ne: null } }, { projection: { slug: 1, updatedAt: 1, createdAt: 1 } })
        .skip(skip)
        .limit(URLS_PER_SITEMAP)
        .toArray();

      perfumes.forEach((p) => {
        if (p.slug) {
          results.push({
            url: `${BASE_URL}/perfumes/${p.slug}`,
            lastModified: p.updatedAt || p.createdAt || new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
          });
        }
      });

      // If there's still room in this chunk, fill with brands
      if (results.length < URLS_PER_SITEMAP) {
        const brandsLimit = URLS_PER_SITEMAP - results.length;
        const brands = await db
          .collection('brands')
          .find({ slug: { $exists: true, $ne: null } }, { projection: { slug: 1, updatedAt: 1 } })
          .limit(brandsLimit)
          .toArray();

        brands.forEach((b) => {
          if (b.slug) {
            results.push({
              url: `${BASE_URL}/brands/${b.slug}`,
              lastModified: b.updatedAt || new Date(),
              changeFrequency: 'weekly' as const,
              priority: 0.7,
            });
          }
        });
      }
    } else {
      // This chunk is entirely in the brands range
      const brandsSkip = skip - perfumeCount;
      const brands = await db
        .collection('brands')
        .find({ slug: { $exists: true, $ne: null } }, { projection: { slug: 1, updatedAt: 1 } })
        .skip(brandsSkip)
        .limit(URLS_PER_SITEMAP)
        .toArray();

      brands.forEach((b) => {
        if (b.slug) {
          results.push({
            url: `${BASE_URL}/brands/${b.slug}`,
            lastModified: b.updatedAt || new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
          });
        }
      });
    }

    return results;
  } catch (error) {
    console.error(`[Sitemap ${id}] Failed to fetch chunk:`, error);
    return [];
  }
}
