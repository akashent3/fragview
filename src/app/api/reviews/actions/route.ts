import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { rateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

// Rate limit: 10 review actions per minute
const limiter = rateLimit({ interval: 60000, uniqueTokenPerInterval: 10 });

// Validation schemas
const reviewEditSchema = z.object({
  reviewId: z.string().uuid(),
  text: z.string().min(10).max(5000),
});

const reviewDeleteSchema = z.object({
  reviewId: z.string().uuid(),
});

// EDIT Review
export async function PATCH(req: NextRequest) {
  try {
    // Check rate limit
    const rateLimitResult = await limiter(req);
    if (rateLimitResult) return rateLimitResult;

    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();

    // Validate input
    const validation = reviewEditSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid input', 
        details: validation.error.issues 
      }, { status: 400 });
    }

    const { reviewId, text } = validation.data;

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
    const updatedReview = await prisma.review.update({
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

// DELETE Review (Hard Delete)
export async function DELETE(req: NextRequest) {
  try {
    // Check rate limit
    const rateLimitResult = await limiter(req);
    if (rateLimitResult) return rateLimitResult;

    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const reviewId = searchParams.get('reviewId');

    // Validate input
    const validation = reviewDeleteSchema.safeParse({ reviewId });
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid review ID', 
        details: validation.error.issues 
      }, { status: 400 });
    }

    // Verify ownership
    const review = await prisma.review.findUnique({
      where: { id: reviewId!  },
      select: { userId: true, perfumeId: true, isDeleted: true },
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    if (review.isDeleted) {
      return NextResponse.json({ error: 'Review already deleted' }, { status: 400 });
    }

    if (review.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Hard delete — cascades to ReviewHelpful votes and replies (onDelete: Cascade in schema)
    await prisma.review.delete({
      where: { id: reviewId! },
    });

    // Revalidate perfume page
    revalidatePath(`/perfumes/${review.perfumeId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete review error:', error);
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  }
}