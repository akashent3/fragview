import { NextRequest, NextResponse } from 'next/server';
import { typesenseAutocomplete } from '@/lib/typesense';
import { rateLimit } from '@/lib/rate-limit';

// 🚀 OPTIMIZATION: More aggressive rate limiting for autocomplete
const limiter = rateLimit({ interval: 60000, uniqueTokenPerInterval: 100 });

// 🚀 OPTIMIZATION: In-memory cache (10 seconds TTL)
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 10000; // 10 seconds

export async function GET(req: NextRequest) {
  try {
    // Check rate limit
    const rateLimitResult = await limiter(req);
    if (rateLimitResult) return rateLimitResult;

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all';

    // Sanitize and validate query
    const sanitizedQuery = query.trim().slice(0, 200);

    if (!sanitizedQuery || sanitizedQuery.length < 2) {
      return NextResponse.json({ brands: [], perfumes: [] });
    }

    // 🚀 CHECK CACHE FIRST
    const cacheKey = `${type}:${sanitizedQuery.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < CACHE_TTL) {
      return NextResponse.json(cached.data, {
        headers: {
          'X-Cache': 'HIT',
          'Cache-Control': 'public, max-age=10, stale-while-revalidate=20'
        }
      });
    }

    const results: { brands: any[]; perfumes: any[] } = {
      brands: [],
      perfumes: [],
    };

    // 🚀 OPTIMIZATION: Parallel fetch with timeout protection
    const promises: Promise<any>[] = [];
    const TIMEOUT = 3000; // 3 second timeout

    if (type === 'brands' || type === 'all') {
      promises.push(
        Promise.race([
          typesenseAutocomplete('brands', sanitizedQuery, 5, 'name,description,country')
            .then((hits) => {
              results.brands = hits.slice(0, 5).map((b: any) => ({
                _id: b._id || b.id,
                name: b.name,
                slug: b.slug,
                country: b.country,
                perfumes_count: b.perfumes_count,
              }));
            }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), TIMEOUT)
          )
        ]).catch(() => {
          results.brands = [];
        })
      );
    }

    if (type === 'perfumes' || type === 'all') {
      promises.push(
        Promise.race([
          typesenseAutocomplete('perfumes', sanitizedQuery, 5, 'variant_name,brand_name')
            .then((hits) => {
              results.perfumes = hits.slice(0, 5).map((p: any) => ({
                _id: p._id || p.id,
                variant_name: p.variant_name,
                brand_name: p.brand_name,
                slug: p.slug,
                gender: p.gender,
                image: p.image,
              }));
            }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), TIMEOUT)
          )
        ]).catch(() => {
          results.perfumes = [];
        })
      );
    }

    await Promise.all(promises);

    // 🚀 STORE IN CACHE
    cache.set(cacheKey, { data: results, timestamp: now });
    
    // 🚀 CLEANUP OLD CACHE ENTRIES (prevent memory leak)
    if (cache.size > 100) {
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
    }

    return NextResponse.json(results, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'public, max-age=10, stale-while-revalidate=20'
      }
    });
  } catch (error) {
    console.error('Autocomplete API error:', error);
    return NextResponse.json({ brands: [], perfumes: [] }, { status: 500 });
  }
}