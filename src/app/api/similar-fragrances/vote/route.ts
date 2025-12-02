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

    const { sourcePerfumeId, similarPerfumeId, voteType } = await request.json();

    if (!sourcePerfumeId || !similarPerfumeId || !['UP', 'DOWN'].includes(voteType)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

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