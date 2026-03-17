import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.fragview.com';
const CHUNK_SIZE = 45000;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const chunkIndex = parseInt(id, 10);

  if (isNaN(chunkIndex) || chunkIndex < 0) {
    return new NextResponse('Not Found', { status: 404 });
  }

  try {
    const { connectMongoDB } = await import('@/lib/mongodb');
    const { db } = await connectMongoDB();

    const perfumes = await db
      .collection('perfumes')
      .find(
        { slug: { $exists: true, $ne: null } },
        { projection: { slug: 1, updatedAt: 1, createdAt: 1 } }
      )
      .sort({ updatedAt: -1 })
      .skip(chunkIndex * CHUNK_SIZE)
      .limit(CHUNK_SIZE)
      .toArray();

    if (perfumes.length === 0) {
      return new NextResponse('Not Found', { status: 404 });
    }

    const urls = perfumes
      .filter((p) => p.slug)
      .map((p) => {
        const lastMod = p.updatedAt || p.createdAt
          ? new Date(p.updatedAt || p.createdAt).toISOString()
          : new Date().toISOString();
        return `  <url>
    <loc>${BASE_URL}/perfumes/${p.slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      })
      .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error(`[Sitemap Perfumes ${id}] Error:`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
