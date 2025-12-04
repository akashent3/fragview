import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET flagged reviews
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const flaggedReviews = await prisma.review.findMany({
      where: {
        isFlagged: true,
        isDeleted: false
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            image: true,
            role: true
          }
        }
      },
      orderBy: {
        flaggedCount: 'desc'
      }
    });

    return NextResponse.json({ reviews: flaggedReviews });
  } catch (error) {
    console.error('Error fetching flagged reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch flagged reviews' }, { status: 500 });
  }
}

// POST approve review (unflag)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reviewId } = await req.json();

    if (!reviewId) {
      return NextResponse.json({ error: 'Review ID is required' }, { status: 400 });
    }

    await prisma.review.update({
      where: { id: reviewId },
      data: {
        isFlagged: false,
        flaggedCount: 0
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error approving review:', error);
    return NextResponse.json({ error: 'Failed to approve review' }, { status: 500 });
  }
}

// DELETE remove review
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const reviewId = searchParams.get('reviewId');

    if (!reviewId) {
      return NextResponse.json({ error: 'Review ID is required' }, { status: 400 });
    }

    // Soft delete
    await prisma.review.update({
      where: { id: reviewId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        text: '[This review has been removed by moderators]'
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing review:', error);
    return NextResponse.json({ error: 'Failed to remove review' }, { status: 500 });
  }
}