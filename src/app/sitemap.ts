import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.fragview.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

  // ── Static public pages ──────────────────────────────────────────────────
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

  // ── Dynamic: Perfume pages (top 44,000 most recently updated) ────────────
  let perfumePages: MetadataRoute.Sitemap = [];
  try {
    const { connectMongoDB } = await import('@/lib/mongodb');
    const { db } = await connectMongoDB();

    const perfumes = await db
      .collection('perfumes')
      .find({ slug: { $exists: true, $ne: null } }, { projection: { slug: 1, updatedAt: 1, createdAt: 1 } })
      .sort({ updatedAt: -1 })
      .limit(44000)
      .toArray();

    perfumePages = perfumes
      .filter((p) => p.slug)
      .map((p) => ({
        url: `${BASE_URL}/perfumes/${p.slug}`,
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
      .find({ slug: { $exists: true, $ne: null } }, { projection: { slug: 1, updatedAt: 1 } })
      .limit(4000)
      .toArray();

    brandPages = brands
      .filter((b) => b.slug)
      .map((b) => ({
        url: `${BASE_URL}/brands/${b.slug}`,
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
    console.error('[Sitemap] Failed to fetch articles:', error);
  }

  return [
    ...staticPages,
    ...perfumePages,
    ...brandPages,
    ...articlePages,
  ];
}
