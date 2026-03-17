import { NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.fragview.com';
const CHUNK_SIZE = 45000;

export async function GET() {
  try {
    const { connectMongoDB } = await import('@/lib/mongodb');
    const { db } = await connectMongoDB();

    const perfumeCount = await db
      .collection('perfumes')
      .countDocuments({ slug: { $exists: true, $ne: null } });

    const chunks = Math.ceil(perfumeCount / CHUNK_SIZE);

    // Static sitemap + one entry per perfume chunk
    const sitemapEntries = [
      `  <sitemap>\n    <loc>${BASE_URL}/sitemap.xml</loc>\n  </sitemap>`,
      ...Array.from({ length: chunks }, (_, i) =>
        `  <sitemap>\n    <loc>${BASE_URL}/sitemap-perfumes/${i}</loc>\n  </sitemap>`
      ),
    ].join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</sitemapindex>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('[Sitemap Index] Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
