'use server';

import clientPromise from '@/lib/mongodb';

export type PerfumeSearchResult = {
  id: string;
  name: string;
  brand: string;
  image: string | null;
  slug: string;
};

export async function searchPerfumesForMention(query: string): Promise<PerfumeSearchResult[]> {
  if (!query || query.length < 2) {
    return [];
  }

  try {
    const client = await clientPromise;
    const db = client.db('fragview');

    const cleanQuery = query.trim().replace(/\s+/g, ' ');
    const queryWords = cleanQuery.split(' ');
    
    // ✅ IMPROVED: Create search conditions for both individual fields and combined
    const searchConditions = [];
    
    // 1.Search in variant_name only (for simple queries like "oud wood")
    searchConditions.push({
      variant_name: { $regex: cleanQuery, $options: 'i' }
    });
    
    searchConditions.push({
      perfume_name: { $regex: cleanQuery, $options: 'i' }
    });
    
    searchConditions.push({
      name: { $regex: cleanQuery, $options: 'i' }
    });
    
    // 2.✅ NEW: Search in brand_name only (if someone types just the brand)
    searchConditions.push({
      brand_name: { $regex: cleanQuery, $options: 'i' }
    });

    // 3.✅ NEW: For multi-word queries, try matching across brand + variant
    // This handles cases like "#tom ford oud wood"
    if (queryWords.length > 1) {
      // Try to match all words across brand_name OR variant_name
      const wordMatches = queryWords.map(word => ({
        $or: [
          { variant_name: { $regex: word, $options: 'i' } },
          { perfume_name: { $regex: word, $options: 'i' } },
          { name: { $regex: word, $options: 'i' } },
          { brand_name: { $regex: word, $options: 'i' } }
        ]
      }));
      
      searchConditions.push({
        $and: wordMatches
      });
    }

    // Search perfumes with all conditions
    const perfumes = await db
      .collection('perfumes')
      .aggregate([
        {
          $match: {
            $or: searchConditions
          }
        },
        {
          // ✅ Add a combined field for better matching
          $addFields: {
            fullName: {
              $concat: [
                { $ifNull: ['$brand_name', ''] },
                ' ',
                { $ifNull: ['$variant_name', { $ifNull: ['$perfume_name', { $ifNull: ['$name', ''] }] }] }
              ]
            }
          }
        },
        {
          // ✅ Sort by how well the full name matches the query
          $addFields: {
            matchScore: {
              $cond: {
                if: { $regexMatch: { input: '$fullName', regex: cleanQuery, options: 'i' } },
                then: 1,
                else: 0
              }
            }
          }
        },
        {
          $sort: { matchScore: -1 }
        },
        {
          $limit: 10
        },
        {
          $project: {
            _id: 1,
            variant_name: 1,
            perfume_name: 1,
            name: 1,
            brand_name: 1,
            brand: 1,
            image: 1,
            slug: 1
          }
        }
      ])
      .toArray();

    return perfumes.map(p => ({
      id: p.slug || p._id.toString(),
      name: p.variant_name || p.perfume_name || p.name || 'Unknown',
      brand: p.brand_name || (typeof p.brand === 'string' ? p.brand : p.brand?.name) || 'Unknown Brand',
      image: p.image || null,
      slug: p.slug || p._id.toString()
    }));
  } catch (error) {
    console.error('Error searching perfumes for mention:', error);
    return [];
  }
}