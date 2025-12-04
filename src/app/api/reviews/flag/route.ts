import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Must be logged in to flag reviews' }, { status: 401 });
    }

    const { reviewId } = await req.json();

    if (!reviewId) {
      return NextResponse.json({ error: 'Review ID is required' }, { status: 400 });
    }

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Increment flag count and mark as flagged if threshold reached
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        flaggedCount: { increment: 1 },
        isFlagged: true // Flag immediately after first report
      }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Review has been flagged for moderation'
    });
  } catch (error) {
    console.error('Error flagging review:', error);
    return NextResponse.json({ error: 'Failed to flag review' }, { status: 500 });
  }
}