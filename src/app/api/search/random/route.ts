import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '10');

  try {
    const db = await getMongoDb();
    
    // Get random perfumes using $sample aggregation
    const results = await db
      .collection('perfumes')
      .aggregate([
        { $sample: { size: limit } },
        { $match: { rating: { $exists: true } } }, // Only perfumes with ratings
      ])
      .toArray();
    
    const perfumes = results.map((p: any) => ({
      _id: p._id.toString(),
      name: p.variant_name || p.name,
      brand: p.brand_name || p.brand,
      slug: p.slug || p._id.toString(),
      image: p.image || p.perfume_image,
      year: 0,
      gender: p.gender || 'unisex',
      rating: p.rating || 0,
      longevity: p.longevity || 0,
      sillage: p.sillage || 0,
      perfumers: p.perfumers || [],
      accords: (p.accords || []).slice(0, 3).map((a: any) => ({ 
        name: typeof a === 'string' ? a : (a.name || a)
      })),
    }));
    
    return NextResponse.json({
      perfumes,
      total: perfumes.length,
    });
  } catch (error) {
    console.error('Random perfumes error:', error);
    return NextResponse.json({ 
      perfumes: [], 
      total: 0 
    }, { status: 500 });
  }
}