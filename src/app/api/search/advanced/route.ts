import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  
  const q = searchParams.get('q') || '';
  const brands = searchParams.get('brands')?.split(',').filter(Boolean) || [];
  const gender = searchParams.get('gender') || '';
  const ratingMin = parseFloat(searchParams.get('ratingMin') || '0');
  const longevityMin = parseFloat(searchParams.get('longevityMin') || '0');
  const sillageMin = parseFloat(searchParams.get('sillageMin') || '0');
  const notes = searchParams.get('notes')?.split(',').filter(Boolean) || [];
  const accords = searchParams.get('accords')?.split(',').filter(Boolean) || [];
  const perfumers = searchParams.get('perfumers')?.split(',').filter(Boolean) || [];
  const sort = searchParams.get('sort') || 'relevance';
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = 25;

  try {
    const db = await getMongoDb();
    
    // Build query conditions
    const andConditions: any[] = [];
    
    // Text search
    if (q.trim()) {
      andConditions.push({
        $or: [
          { variant_name: { $regex: q, $options: 'i' } },
          { brand_name: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
        ]
      });
    }
    
    // Filters
    if (brands.length > 0) andConditions.push({ brand_name: { $in: brands } });
    if (gender && gender !== 'all') andConditions.push({ gender: { $regex: new RegExp(`^${gender}$`, 'i') } });
    if (ratingMin > 0) andConditions.push({ rating: { $exists: true, $gte: ratingMin } });
    if (longevityMin > 0) andConditions.push({ longevity: { $exists: true, $gte: longevityMin } });
    if (sillageMin > 0) andConditions.push({ sillage: { $exists: true, $gte: sillageMin } });
    
    if (notes.length > 0) {
      andConditions.push({
        $or: [
          { 'pyramids.top': { $in: notes } },
          { 'pyramids.middle': { $in: notes } },
          { 'pyramids.base': { $in: notes } }
        ]
      });
    }
    
    if (accords.length > 0) {
      andConditions.push({
        $or: [
          { 'accords': { $in: accords } },
          { 'accords.name': { $in: accords } }
        ]
      });
    }
    
    if (perfumers.length > 0) andConditions.push({ perfumers: { $in: perfumers } });
    
    const query: any = andConditions.length > 0 ? { $and: andConditions } : {};
    
    // Sort configuration
    let sortObj: any = {};
    switch (sort) {
      case 'rating':
        sortObj = { rating: -1 };
        break;
      case 'year':
        sortObj = { variant_name: 1 }; // Fallback to name since no year field
        break;
      case 'name':
        sortObj = { variant_name: 1 };
        break;
      default:
        sortObj = { rating: -1 };
    }
    
    console.log('Search Query:', JSON.stringify(query, null, 2));
    console.log('Sort:', sortObj);
    
    const startTime = Date.now();
    
    // Execute query
    const [results, total] = await Promise.all([
      db.collection('perfumes')
        .find(query)
        .sort(sortObj)
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .toArray(),
      db.collection('perfumes').countDocuments(query),
    ]);
    
    const duration = Date.now() - startTime;
    console.log(`Search completed in ${duration}ms, found ${total} results`);
    
    const perfumes = results.map((p: any) => ({
      _id: p._id.toString(),
      name: p.variant_name || p.name,
      brand: p.brand_name || p.brand,
      slug: p.slug || p._id.toString(),
      image: p.image || p.perfume_image,
      year: 0, // No year field in perfumes collection
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
      total,
      page,
      totalPages: Math.ceil(total / pageSize),
    });
    
  } catch (error) {
    console.error('Advanced search error:', error);
    return NextResponse.json({ 
      error: 'Search failed',
      perfumes: [], 
      total: 0, 
      page: 1, 
      totalPages: 0 
    }, { status: 500 });
  }
}