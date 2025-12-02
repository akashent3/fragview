import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma'; // ✅ Default import

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sourcePerfumeId, targetPerfumeId } = await request.json();

    if (!sourcePerfumeId || !targetPerfumeId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (sourcePerfumeId === targetPerfumeId) {
      return NextResponse.json({ error: 'Cannot suggest same perfume' }, { status: 400 });
    }

    // Check if user already voted for this combination
    const existing = await prisma.similarPerfumeVote.findUnique({
      where: {
        userId_sourcePerfumeId_similarPerfumeId: {
          userId: session.user.id,
          sourcePerfumeId,
          similarPerfumeId: targetPerfumeId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'You already suggested this perfume' }, { status: 400 });
    }

    // Add vote (default to UP when adding)
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
      error: 'Failed to add similar fragrance',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}