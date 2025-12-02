import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb'; // ✅ Correct function name
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const excludeId = searchParams.get('exclude');

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const { db } = await connectMongoDB();

    // Build exclude filter
    let excludeFilter = {};
    if (excludeId) {
      try {
        excludeFilter = { _id: { $ne: new ObjectId(excludeId) } };
      } catch (error) {
        // If excludeId is not a valid ObjectId, ignore it
        console.warn('Invalid exclude ID format:', excludeId);
      }
    }

    // Search perfumes by name or brand
    const results = await db
      .collection('perfumes')
      .find({
        ...excludeFilter,
        $or: [
          { variant_name: { $regex: query, $options: 'i' } },
          { perfume_name: { $regex: query, $options: 'i' } },
          { brand_name: { $regex: query, $options: 'i' } },
        ],
      })
      .project({
        _id: 1,
        variant_name: 1,
        perfume_name: 1,
        brand_name: 1,
        image: 1,
        slug: 1,
      })
      .limit(10)
      .toArray();

    // Format results
    const formattedResults = results.map((r) => ({
      _id: r._id.toString(),
      variant_name: r.variant_name || r.perfume_name || 'Unknown',
      brand_name: r.brand_name || 'Unknown Brand',
      image: r.image || null,
      slug: r.slug || r._id.toString(),
    }));

    return NextResponse.json({ results: formattedResults });
  } catch (error) {
    console.error('Error searching perfumes:', error);
    return NextResponse.json({ 
      error: 'Search failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}