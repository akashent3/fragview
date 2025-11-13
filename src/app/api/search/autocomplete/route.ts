import { NextRequest, NextResponse } from 'next/server';
import { typesenseAutocomplete } from '@/lib/typesense';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'all'; // 'brands', 'perfumes', or 'all'

  if (!query.trim() || query.length < 2) {
    return NextResponse.json({ brands: [], perfumes: [] });
  }

  try {
    const results: { brands: any[]; perfumes: any[] } = {
      brands: [],
      perfumes: [],
    };

    // 🔧 Parallel fetch for speed (both collections at once)
    const promises: Promise<any>[] = [];

    if (type === 'brands' || type === 'all') {
      promises.push(
        typesenseAutocomplete('brands', query, 5, 'name,description,country')
          .then((hits) => {
            results.brands = hits.map((b: any) => ({
              _id: b._id || b.id,
              name: b.name,
              slug: b.slug,
              country: b.country,
              perfumes_count: b.perfumes_count,
            }));
          })
          .catch(() => {
            results.brands = [];
          })
      );
    }

    if (type === 'perfumes' || type === 'all') {
      promises.push(
        typesenseAutocomplete('perfumes', query, 5, 'variant_name,brand_name')
          .then((hits) => {
            results.perfumes = hits.map((p: any) => ({
              _id: p._id || p.id,
              variant_name: p.variant_name,
              brand_name: p.brand_name,
              slug: p.slug,
              gender: p.gender,
              image: p.image,
            }));
          })
          .catch(() => {
            results.perfumes = [];
          })
      );
    }

    await Promise.all(promises);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Autocomplete API error:', error);
    return NextResponse.json({ brands: [], perfumes: [] }, { status: 500 });
  }
}