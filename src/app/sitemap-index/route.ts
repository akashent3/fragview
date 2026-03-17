import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const BASE_URL   = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.fragview.com';
const CHUNK_SIZE = 2000;

export async function GET() {
  // Compute today's date fresh on every request (not stale from module init)
  const today = new Date().toISOString().split('T')[0];

  try {
    const { connectMongoDB } = await import('@/lib/mongodb');
    const { db } = await connectMongoDB();

    // Count only documents that have a proper string slug
    const perfumeCount = await db
      .collection('perfumes')
      .countDocuments({ slug: { $exists: true, $ne: null, $type: 'string' } });

    const chunks = perfumeCount > 0 ? Math.ceil(perfumeCount / CHUNK_SIZE) : 0;

    // Build sitemap index entries:
    //   1. /sitemap.xml  — static pages + brands + articles (existing sitemap)
    //   2. /sitemap-perfumes/0..N — all perfume chunks
    const entries = [
      `  <sitemap>\n    <loc>${BASE_URL}/sitemap.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>`,
      ...Array.from({ length: chunks }, (_, i) =>
        `  <sitemap>\n    <loc>${BASE_URL}/sitemap-perfumes/${i}</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>`
      ),
    ].join('\n');

    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      entries,
      '</sitemapindex>',
    ].join('\n');

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type':  'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('[Sitemap Index] Unhandled error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
