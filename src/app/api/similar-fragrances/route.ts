import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { connectMongoDB } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// ✅ Cache for 5 minutes
export const revalidate = 300;

// 🚀 IN-MEMORY CACHE for similar fragrances
const cache = new Map<string, { 
  fragrances: any[]; 
  voteMap: Map<string, { upvotes: number; downvotes: number }>;
  timestamp: number;
}>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const perfumeId = searchParams.get('perfumeId');

    if (!perfumeId) {
      return NextResponse.json({ error: 'perfumeId required' }, { status: 400 });
    }

    // 🚀 Get user session
    let userId: string | undefined;
    try {
      const session = await getServerSession(authOptions);
      userId = session?.user?.id;
    } catch (error) {
      userId = undefined;
    }

    // 🚀 CHECK CACHE FIRST
    const cacheKey = perfumeId;
    const cached = cache.get(cacheKey);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < CACHE_TTL) {
      // Cache hit!  Just need to add user-specific votes
      if (userId) {
        // Fetch only user's votes (fast query)
        const userVotes = await prisma.similarPerfumeVote.findMany({
          where: {
            sourcePerfumeId: perfumeId,
            userId: userId,
          },
          select: {
            similarPerfumeId: true,
            voteType: true,
          },
        });

        const userVoteMap = new Map(userVotes.map(v => [v.similarPerfumeId, v.voteType]));

        // Add user votes to cached fragrances
        const fragrancesWithUserVotes = cached.fragrances.map(f => ({
          ...f,
          userVote: userVoteMap.get(f.perfumeId) || null,
        }));

        return NextResponse.json(
          { fragrances: fragrancesWithUserVotes },
          {
            headers: {
              'X-Cache': 'HIT',
              'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
            },
          }
        );
      } else {
        // No user, return cached data as-is
        return NextResponse.json(
          { fragrances: cached.fragrances },
          {
            headers: {
              'X-Cache': 'HIT',
              'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
            },
          }
        );
      }
    }

    // 🚀 CACHE MISS - Fetch everything
    const [votes, sourcePerfumeData] = await Promise.all([
      prisma.similarPerfumeVote.findMany({
        where: {
          sourcePerfumeId: perfumeId,
        },
        select: {
          similarPerfumeId: true,
          voteType: true,
          userId: true,
        },
      }),
      
      (async () => {
        try {
          const { db } = await connectMongoDB();
          const sourcePerfumeObjectId = new ObjectId(perfumeId);
          return await db
            .collection('perfumes')
            .findOne(
              { _id: sourcePerfumeObjectId },
              { projection: { reminds_me: 1 } }
            );
        } catch (error) {
          return null;
        }
      })()
    ]);

    if (!sourcePerfumeData) {
      return NextResponse.json({ error: 'Perfume not found' }, { status: 404 });
    }

    // Aggregate votes by perfume
    const voteMap = new Map<string, { upvotes: number; downvotes: number; userVote: string | null }>();

    votes.forEach((vote) => {
      const existing = voteMap.get(vote.similarPerfumeId) || {
        upvotes: 0,
        downvotes: 0,
        userVote: null,
      };

      if (vote.voteType === 'UP') {
        existing.upvotes++;
      } else {
        existing.downvotes++;
      }

      if (userId && vote.userId === userId) {
        existing.userVote = vote.voteType;
      }

      voteMap.set(vote.similarPerfumeId, existing);
    });

    let perfumeIds = Array.from(voteMap.keys());
    const { db } = await connectMongoDB();

    // Process reminds_me
    if (sourcePerfumeData?.reminds_me && Array.isArray(sourcePerfumeData.reminds_me)) {
      console.log(`Found ${sourcePerfumeData.reminds_me.length} reminds_me entries`);
      
      const searchPatterns = sourcePerfumeData.reminds_me
        .filter(name => name && typeof name === 'string')
        .map(name => name.trim());

      if (searchPatterns.length > 0) {
        const remindsOfPerfumes = await db
          .collection('perfumes')
          .aggregate([
            {
              $addFields: {
                fullName: { $concat: ['$brand_name', ' ', '$variant_name'] }
              }
            },
            {
              $match: {
                fullName: {
                  $in: searchPatterns.map(pattern => new RegExp(escapeRegex(pattern), 'i'))
                }
              }
            },
            {
              $project: { _id: 1 }
            },
            {
              $limit: 20
            }
          ])
          .toArray();

        console.log(`Successfully matched ${remindsOfPerfumes.length} out of ${sourcePerfumeData.reminds_me.length} reminds_me entries`);

        remindsOfPerfumes.forEach((p) => {
          const id = p._id.toString();
          if (! voteMap.has(id)) {
            perfumeIds.push(id);
            voteMap.set(id, {
              upvotes: 0,
              downvotes: 0,
              userVote: null,
            });
          }
        });
      }
    }

    if (perfumeIds.length === 0) {
      return NextResponse.json({ fragrances: [] });
    }

    // Get perfume details
    const perfumes = await db
      .collection('perfumes')
      .find({ 
        _id: { 
          $in: perfumeIds.map((id) => {
            try {
              return new ObjectId(id);
            } catch {
              return null;
            }
          }).filter(Boolean) as ObjectId[]
        } 
      })
      .project({ _id: 1, variant_name: 1, perfume_name: 1, brand_name: 1, image: 1, slug: 1 })
      .toArray();

    // Calculate scores
    const fragrances = perfumes
      .map((perfume) => {
        const perfumeIdStr = perfume._id.toString();
        const voteData = voteMap.get(perfumeIdStr);

        if (! voteData) return null;

        const { upvotes, downvotes, userVote } = voteData;

        const C = 5;
        const m = 0.5;
        const total = upvotes + downvotes;

        let similarityScore = 50;
        if (total > 0) {
          const bayesianAvg = (C * m + upvotes) / (C + total);
          similarityScore = Math.round(bayesianAvg * 100);
        }

        return {
          perfumeId: perfumeIdStr,
          name: perfume.variant_name || perfume.perfume_name || 'Unknown',
          brand: perfume.brand_name || 'Unknown Brand',
          image: perfume.image || null,
          slug: perfume.slug || perfumeIdStr,
          upvotes,
          downvotes,
          userVote,
          similarityScore,
        };
      })
      .filter((f) => f !== null)
      .sort((a, b) => {
        if (a! .upvotes + a!.downvotes === 0 && b!.upvotes + b!.downvotes > 0) return 1;
        if (b!.upvotes + b! .downvotes === 0 && a!.upvotes + a!.downvotes > 0) return -1;
        return b!.similarityScore - a!.similarityScore;
      });

    // 🚀 STORE IN CACHE (without user votes)
    const fragrancesForCache = fragrances.map(f => ({ ...f, userVote: null }));
    const voteMapForCache = new Map(
      Array.from(voteMap.entries()).map(([id, data]) => [id, { upvotes: data.upvotes, downvotes: data.downvotes }])
    );

    cache.set(cacheKey, {
      fragrances: fragrancesForCache,
      voteMap: voteMapForCache,
      timestamp: now,
    });

    // 🚀 CLEANUP
    if (cache.size > 1000) {
      const entries = Array.from(cache.entries());
      entries.forEach(([key, value]) => {
        if (now - value.timestamp > CACHE_TTL) {
          cache.delete(key);
        }
      });
    }

    return NextResponse.json(
      { fragrances },
      {
        headers: {
          'X-Cache': 'MISS',
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching similar fragrances:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch similar fragrances',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}