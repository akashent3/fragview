import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { similarAddSchema } from '@/lib/validation'; // ✅ ADD
import { rateLimit } from '@/lib/rate-limit'; // ✅ ADD

// ✅ ADD: Rate limit: 10 additions per minute
const limiter = rateLimit({ interval: 60000, uniqueTokenPerInterval: 10 });

export async function POST(request: NextRequest) {
  try {
    // ✅ ADD: Check rate limit
    const rateLimitResult = await limiter(request);
    if (rateLimitResult) return rateLimitResult;

    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // ✅ ADD: Validate input
    const validation = similarAddSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid input', 
        details: validation.error.issues 
      }, { status: 400 });
    }

    const { sourcePerfumeId, targetPerfumeId } = validation.data;

    // ✅ Prevent self-referencing
    if (sourcePerfumeId === targetPerfumeId) {
      return NextResponse.json({ 
        error: 'Cannot add perfume as similar to itself' 
      }, { status: 400 });
    }

    // Check if already exists
    const existing = await prisma.similarPerfumeVote.findFirst({
      where: {
        userId: session.user.id,
        sourcePerfumeId,
        similarPerfumeId: targetPerfumeId,
      },
    });

    if (existing) {
      return NextResponse.json({ 
        error: 'Already added as similar' 
      }, { status: 409 });
    }

    // Create vote
    await prisma.similarPerfumeVote.create({
      data: {
        userId: session.user.id,
        sourcePerfumeId,
        similarPerfumeId: targetPerfumeId,
        voteType: 'UP',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding similar fragrance:', error);
    return NextResponse.json({ 
      error: 'Failed to add similar fragrance' 
    }, { status: 500 });
  }
}