'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { notifyReviewHelpful, notifyThreadFollowers } from '@/lib/notifications';

// Toggle Helpful (Upvote) or Unhelpful (Downvote)
export async function voteReview(reviewId: string, type: 'UP' | 'DOWN') {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: 'Not logged in' };

  const userId = session.user. id;

  try {
    // Check existing vote
    const existing = await prisma. reviewHelpful.findUnique({
      where: {
        reviewId_userId: {
          reviewId: reviewId,
          userId: userId
        }
      }
    });

    // Get review details for notification
    const review = await prisma. review.findUnique({
      where: { id: reviewId },
      select: { 
        userId: true, 
        perfumeId: true,
        user: { select: { username: true } }
      }
    });

    if (! review) return { error: 'Review not found' };

    // Get voter's username
    const voter = await prisma. user.findUnique({
      where: { id: userId },
      select: { username: true }
    });

    if (existing) {
      // Same vote clicked -> Remove it (Toggle off)
      await prisma.reviewHelpful.delete({ where: { id: existing.id } });
      
      await prisma.review.update({
        where: { id: reviewId },
        data: { 
          helpfulCount: { decrement: 1 }
        }
      });
      return { status: 'removed' };
      
    } else {
      // New Vote
      await prisma. reviewHelpful. create({
        data: { 
          reviewId, 
          userId, 
        } 
      });

      await prisma.review. update({
        where: { id: reviewId },
        data: { helpfulCount: { increment: 1 } }
      });

      // 🔔 SEND NOTIFICATION (only if voter is not the review author)
      if (review.userId !== userId && voter && type === 'UP') {
        // We need to get perfume name - for now use slug
        await notifyReviewHelpful(
          review.userId,
          voter.username,
          review. perfumeId,
          review. perfumeId // TODO: Get actual perfume name from MongoDB
        );
      }
      
      return { status: 'added', type };
    }
  } catch (error) {
    console. error('Voting error:', error);
    return { error: 'Failed to vote' };
  }
}

// Edit Review
export async function editReview(reviewId: string, newText: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: 'Not logged in' };

  try {
    // Verify ownership
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { userId: true, perfumeId: true }
    });

    if (!review) return { error: 'Review not found' };
    if (review.userId !== session.user.id) return { error: 'Not authorized' };

    await prisma.review. update({
      where: { id: reviewId },
      data: {
        text: newText. trim(),
        isEdited: true,
        editedAt: new Date(),
      }
    });

    revalidatePath(`/perfumes/${review.perfumeId}`);
    return { success: true };
  } catch (error) {
    console.error('Edit review error:', error);
    return { error: 'Failed to edit review' };
  }
}

// Delete Review (Soft Delete)
export async function deleteReview(reviewId: string) {
  const session = await getServerSession(authOptions);
  if (!session?. user) return { error: 'Not logged in' };

  try {
    // Verify ownership
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { userId: true, perfumeId: true }
    });

    if (!review) return { error: 'Review not found' };
    if (review. userId !== session.user.id) return { error: 'Not authorized' };

    // Hard delete the review
    await prisma.review.delete({
      where: { id: reviewId }
    });

    revalidatePath(`/perfumes/${review.perfumeId}`);
    return { success: true };
  } catch (error) {
    console.error('Delete review error:', error);
    return { error: 'Failed to delete review' };
  }
}