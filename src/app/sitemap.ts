import { MetadataRoute } from 'next';

/**
 * Dynamic XML Sitemap
 * ───────────────────
 * Automatically builds a complete sitemap from:
 *  • Static pages (home, brands, drydown, discover, etc.)
 *  • Dynamic perfume pages (from MongoDB)
 *  • Dynamic brand pages  (from MongoDB)
 *  • Dynamic article pages (from PostgreSQL via Prisma)
 *
 * Google Search Console reads this to discover & index all your URLs.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.fragview.com';

  // ── Static public pages ──────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl,                            lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${baseUrl}/perfumes`,              lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${baseUrl}/brands`,                lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${baseUrl}/drydown`,               lastModified: new Date(), changeFrequency: 'daily',   priority: 0.8 },
    { url: `${baseUrl}/discover`,              lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${baseUrl}/search`,                lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/contact`,               lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${baseUrl}/submit`,                lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/submit/brand`,          lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${baseUrl}/submit/community`,      lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  ];

  // ── Dynamic: Perfume pages ────────────────────────────────────────────────
  let perfumePages: MetadataRoute.Sitemap = [];
  try {
    const { connectMongoDB } = await import('@/lib/mongodb');
    const { db } = await connectMongoDB();

    const perfumes = await db
      .collection('perfumes')
      .find({}, { projection: { slug: 1, updatedAt: 1, createdAt: 1 } })
      .toArray();

    perfumePages = perfumes
      .filter((p) => p.slug)
      .map((p) => ({
        url: `${baseUrl}/perfumes/${p.slug}`,
        lastModified: p.updatedAt || p.createdAt || new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
  } catch (error) {
    console.error('[Sitemap] Failed to fetch perfumes:', error);
  }

  // ── Dynamic: Brand pages ──────────────────────────────────────────────────
  let brandPages: MetadataRoute.Sitemap = [];
  try {
    const { connectMongoDB } = await import('@/lib/mongodb');
    const { db } = await connectMongoDB();

    const brands = await db
      .collection('brands')
      .find({}, { projection: { slug: 1, updatedAt: 1 } })
      .toArray();

    brandPages = brands
      .filter((b) => b.slug)
      .map((b) => ({
        url: `${baseUrl}/brands/${b.slug}`,
        lastModified: b.updatedAt || new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
  } catch (error) {
    console.error('[Sitemap] Failed to fetch brands:', error);
  }

  // ── Dynamic: Drydown / Article pages ─────────────────────────────────────
  let articlePages: MetadataRoute.Sitemap = [];
  try {
    const prisma = (await import('@/lib/prisma')).default;

    // Only include published articles
    const articles = await (prisma as any).article.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true, publishedAt: true },
    });

    articlePages = articles
      .filter((a: any) => a.slug)
      .map((a: any) => ({
        url: `${baseUrl}/drydown/${a.slug}`,
        lastModified: a.updatedAt || a.publishedAt || new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }));
  } catch (error) {
    console.error('[Sitemap] Failed to fetch articles:', error);
  }

  return [
    ...staticPages,
    ...perfumePages,
    ...brandPages,
    ...articlePages,
  ];
}
