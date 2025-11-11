import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getTypesenseClient } from '@/lib/search/typesense-client';

const DB_NAME = process.env.MONGO_DB_NAME || 'fragview';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() || '';
  if (!q) return NextResponse.json({ query: '', perfumes: [], brands: [] });

  const ts = getTypesenseClient();
  if (ts) {
    try {
      const [perfRes, brandRes] = await Promise.all([
        ts.collections('perfumes').documents().search({
          q,
          query_by: 'variant_name,brand_name',
          per_page: 10,
        }),
        ts.collections('brands').documents().search({
          q,
          query_by: 'name',
          per_page: 8,
        }),
      ]);

      return NextResponse.json({
        query: q,
        perfumes: perfRes.hits?.map((h) => h.document) || [],
        brands: brandRes.hits?.map((h) => h.document) || [],
        source: 'typesense',
      });
    } catch (e: any) {
      console.warn('Typesense search failed, falling back:', e?.message);
    }
  }

  // Fallback: prefix match in Mongo
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const perfumesCol = db.collection('perfumes');
  const brandsCol = db.collection('brands');

  const regex = new RegExp(`^${escapeRegex(q)}`, 'i');

  const perfumes = await perfumesCol
    .find(
      { $or: [{ variant_name: regex }, { brand_name: regex }] },
      { projection: { _id: 1, brand_name: 1, variant_name: 1, slug: 1, rating: 1 } }
    )
    .limit(10)
    .toArray();

  const brands = await brandsCol
    .find({ name: regex }, { projection: { _id: 1, name: 1, slug: 1 } })
    .limit(8)
    .toArray();

  return NextResponse.json({
    query: q,
    perfumes: perfumes.map((p) => ({
      id: p._id,
      slug: p.slug,
      brand_name: p.brand_name,
      variant_name: p.variant_name,
      rating: p.rating || 0,
    })),
    brands: brands.map((b) => ({
      id: b._id,
      slug: b.slug,
      name: b.name,
    })),
    source: 'mongo',
  });
}

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}