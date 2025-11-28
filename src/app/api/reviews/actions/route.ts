import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// EDIT Review
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?. user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { reviewId, text } = await req.json();

    // Validation
    if (!reviewId || ! text?. trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (text.trim().length < 10) {
      return NextResponse.json({ error: 'Review must be at least 10 characters' }, { status: 400 });
    }

    // Verify ownership
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { userId: true, perfumeId: true, isDeleted: true },
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    if (review.isDeleted) {
      return NextResponse.json({ error: 'Cannot edit deleted review' }, { status: 400 });
    }

    if (review.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Update review
    const updatedReview = await prisma.review. update({
      where: { id: reviewId },
      data: {
        text: text.trim(),
        isEdited: true,
        editedAt: new Date(),
      },
    });

    // Revalidate perfume page
    revalidatePath(`/perfumes/${review.perfumeId}`);

    return NextResponse.json({ success: true, review: updatedReview });
  } catch (error) {
    console.error('Edit review error:', error);
    return NextResponse.json({ error: 'Failed to edit review' }, { status: 500 });
  }
}

// DELETE Review (Soft Delete)
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?. user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(req. url);
    const reviewId = searchParams.get('reviewId');

    if (!reviewId) {
      return NextResponse. json({ error: 'Review ID required' }, { status: 400 });
    }

    // Verify ownership
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { userId: true, perfumeId: true, isDeleted: true },
    });

    if (! review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    if (review.isDeleted) {
      return NextResponse.json({ error: 'Review already deleted' }, { status: 400 });
    }

    if (review.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Soft delete
    await prisma.review.update({
      where: { id: reviewId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    // Revalidate perfume page
    revalidatePath(`/perfumes/${review.perfumeId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete review error:', error);
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  }
}