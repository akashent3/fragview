import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.fragview.com';
const CHUNK_SIZE = 45000;
const MAX_CHUNK  = 9999; // sanity cap — supports up to ~450 million perfumes

/**
 * Convert any MongoDB date value to YYYY-MM-DD (W3C date format required by Google sitemaps).
 * Returns today's date as a safe fallback for null / invalid / BSON values.
 */
function toW3CDate(value: unknown): string {
  try {
    if (!value) return todayStr();
    const d = new Date(value as string | number | Date);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  } catch { /* ignore malformed dates */ }
  return todayStr();
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Escape XML special characters so the <loc> element is always valid XML.
 * Note: encodeURIComponent already handles & < > in slugs at the URL level,
 * but we escape at the XML level too as a second safety layer.
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const chunkIndex = parseInt(id, 10);

  // ── Validate chunk index ─────────────────────────────────────────────────
  if (isNaN(chunkIndex) || chunkIndex < 0 || chunkIndex > MAX_CHUNK) {
    return new NextResponse('Not Found', { status: 404 });
  }

  try {
    const { connectMongoDB } = await import('@/lib/mongodb');
    const { db } = await connectMongoDB();

    // Use _id sort (always indexed) so .skip() on large collections stays fast.
    // Filter slug as { $type: 'string' } to reject any non-string values at DB level.
    const perfumes = await db
      .collection('perfumes')
      .find(
        { slug: { $exists: true, $ne: null, $type: 'string' } },
        { projection: { slug: 1, updatedAt: 1, createdAt: 1 } }
      )
      .sort({ _id: 1 })
      .skip(chunkIndex * CHUNK_SIZE)
      .limit(CHUNK_SIZE)
      .toArray();

    if (perfumes.length === 0) {
      return new NextResponse('Not Found', { status: 404 });
    }

    const urlEntries = perfumes
      .filter((p) => {
        // Double-check slug is a non-empty string (defensive — DB filter already ensures this)
        return p.slug && typeof p.slug === 'string' && p.slug.trim().length > 0;
      })
      .map((p) => {
        const slug    = p.slug.trim();
        const loc     = escapeXml(`${BASE_URL}/perfumes/${encodeURIComponent(slug)}`);
        const lastmod = toW3CDate(p.updatedAt ?? p.createdAt);

        return [
          '  <url>',
          `    <loc>${loc}</loc>`,
          `    <lastmod>${lastmod}</lastmod>`,
          '    <changefreq>weekly</changefreq>',
          '    <priority>0.8</priority>',
          '  </url>',
        ].join('\n');
      })
      .join('\n');

    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      urlEntries,
      '</urlset>',
    ].join('\n');

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type':  'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error(`[Sitemap Perfumes/${id}] Unhandled error:`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
