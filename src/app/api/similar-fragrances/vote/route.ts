import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { similarVoteSchema } from '@/lib/validation'; // ✅ ADDED
import { rateLimit } from '@/lib/rate-limit'; // ✅ ADDED

// ✅ ADDED: Rate limit: 20 votes per minute
const limiter = rateLimit({ interval: 60000, uniqueTokenPerInterval: 20 });

export async function POST(request: NextRequest) {
  try {
    // ✅ ADDED: Check rate limit
    const rateLimitResult = await limiter(request);
    if (rateLimitResult) return rateLimitResult;

    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json(); // ✅ CHANGED

    // ✅ CHANGED: Validate input with Zod schema
    const validation = similarVoteSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid input', 
        details: validation.error.issues 
      }, { status: 400 });
    }

    const { sourcePerfumeId, similarPerfumeId, voteType } = validation.data; // ✅ CHANGED

    // Upsert vote (create if doesn't exist, update if it does)
    await prisma.similarPerfumeVote.upsert({
      where: {
        userId_sourcePerfumeId_similarPerfumeId: {
          userId: session.user.id,
          sourcePerfumeId,
          similarPerfumeId,
        },
      },
      create: {
        userId: session.user.id,
        sourcePerfumeId,
        similarPerfumeId,
        voteType,
      },
      update: {
        voteType,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error voting:', error);
    return NextResponse.json({ 
      error: 'Failed to vote',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}