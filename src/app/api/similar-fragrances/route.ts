import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma'; // ✅ Default import
import { connectMongoDB } from '@/lib/mongodb'; // ✅ Correct function name
import { ObjectId } from 'mongodb';

// ✅ ADD THIS: Cache for 5 minutes (300 seconds)
export const revalidate = 300;

// ✅ ADD THIS: Allow dynamic params (perfumeId)
export const dynamic = 'force-dynamic';

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

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // Get votes from PostgreSQL
    const votes = await prisma.similarPerfumeVote.findMany({
      where: {
        sourcePerfumeId: perfumeId,
      },
      select: {
        similarPerfumeId: true,
        voteType: true,
        userId: true,
      },
    });

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

    // Get perfume IDs from votes
    let perfumeIds = Array.from(voteMap.keys());

    // FALLBACK: If no votes, get from MongoDB reminds_me field
    const { db } = await connectMongoDB();
    
    // Convert perfumeId string to ObjectId if needed
    let sourcePerfumeObjectId;
    try {
      sourcePerfumeObjectId = new ObjectId(perfumeId);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid perfume ID format' }, { status: 400 });
    }

    const sourcePerfume = await db
      .collection('perfumes')
      .findOne(
        { _id: sourcePerfumeObjectId },
        { projection: { reminds_me: 1 } }
      );

    // If we have reminds_me data, add those perfumes
    if (sourcePerfume?.reminds_me && Array.isArray(sourcePerfume.reminds_me)) {
      console.log(`Found ${sourcePerfume.reminds_me.length} reminds_me entries`);
      
      // Strategy: Search by creating a case-insensitive regex for each name
      // But use $in for better performance with indexes
      const searchPatterns = sourcePerfume.reminds_me
        .filter(name => name && typeof name === 'string')
        .map(name => name.trim());

      if (searchPatterns.length > 0) {
        // Use aggregation pipeline for better performance
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

        console.log(`Successfully matched ${remindsOfPerfumes.length} out of ${sourcePerfume.reminds_me.length} reminds_me entries`);

        // Add reminds_me perfumes to the list if not already there
        remindsOfPerfumes.forEach((p) => {
          const id = p._id.toString();
          if (!voteMap.has(id)) {
            perfumeIds.push(id);
            // Initialize with 0 votes for reminds_me perfumes
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

    // Get perfume details from MongoDB
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

    // Calculate Bayesian Average for each perfume
    const fragrances = perfumes
      .map((perfume) => {
        const perfumeIdStr = perfume._id.toString();
        const voteData = voteMap.get(perfumeIdStr);

        if (!voteData) return null;

        const { upvotes, downvotes, userVote } = voteData;

        // Bayesian Average calculation
        const C = 5; // Confidence threshold
        const m = 0.5; // Prior probability (50%)
        const total = upvotes + downvotes;

        let similarityScore = 50; // Default 50% for new items
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
        // Sort by similarity score (highest first)
        // But prioritize perfumes with votes over reminds_me (0 votes)
        if (a! .upvotes + a!.downvotes === 0 && b!.upvotes + b!.downvotes > 0) return 1;
        if (b!.upvotes + b! .downvotes === 0 && a!.upvotes + a!.downvotes > 0) return -1;
        return b!.similarityScore - a!.similarityScore;
      });

    return NextResponse.json({ fragrances });
  } catch (error) {
    console.error('Error fetching similar fragrances:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch similar fragrances',
      details: error instanceof Error ?  error.message : 'Unknown error'
    }, { status: 500 });
  }
}