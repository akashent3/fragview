'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { createNotification, extractMentions } from '@/lib/notifications';

// Toggle Helpful (Upvote) or Unhelpful (Downvote)
export async function voteReview(reviewId: string, type: 'UP' | 'DOWN') {
  const session = await getServerSession(authOptions);
  if (!session?. user) return { error: 'Not logged in' };

  const userId = session.user.id;

  try {
    // Check existing vote
    const existing = await prisma.reviewHelpful.findUnique({
      where: {
        reviewId_userId: {
          reviewId: reviewId,
          userId: userId
        }
      }
    });

    // Get review details for notification
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { 
        userId: true, 
        perfumeId: true,
        user: { select: { username: true } }
      }
    });

    if (!review) return { error: 'Review not found' };

    // Get voter's username
    const voter = await prisma.user.findUnique({
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
      await prisma.reviewHelpful. create({
        data: { 
          reviewId, 
          userId, 
        } 
      });

      await prisma.review.update({
        where: { id: reviewId },
        data: { helpfulCount: { increment: 1 } }
      });

      // 🔔 CREATE NOTIFICATION (only if voter is not the review author, in-app only)
      if (review.userId !== userId && voter && type === 'UP') {
        await createNotification({
          userId: review.userId,
          type: 'REVIEW_HELPFUL',
          message: `@${voter.username} found your review helpful`,
          link: `/perfumes/${review.perfumeId}#review-${reviewId}`,
          sendEmail: false, // In-app only
        });
      }
      
      return { status: 'added', type };
    }
  } catch (error) {
    console.error('Voting error:', error);
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
      select: { userId: true, perfumeId: true, text: true }
    });

    if (!review) return { error: 'Review not found' };
    if (review.userId !== session.user.id) return { error: 'Not authorized' };

    // Update review
    await prisma.review. update({
      where: { id: reviewId },
      data: {
        text: newText. trim(),
        isEdited: true,
        editedAt: new Date(),
      },
    });

    // 🔔 DETECT @MENTIONS IN EDITED REVIEW (in-app only)
    const mentions = extractMentions(newText);
    const oldMentions = review.text ? extractMentions(review.text) : [];
    
    // Only notify NEW mentions (not already mentioned in old text)
    const newMentions = mentions.filter(m => !oldMentions.includes(m));
    
    for (const mentionedUsername of newMentions) {
      // Find mentioned user
      const mentionedUser = await prisma. user.findUnique({
        where: { username: mentionedUsername },
        select: { id: true },
      });

      // Create notification if user exists and it's not self-mention
      if (mentionedUser && mentionedUser. id !== session.user.id) {
        await createNotification({
          userId: mentionedUser.id,
          type: 'REVIEW_REPLY',
          message: `@${session.user.username} mentioned you in an edited review`,
          link: `/perfumes/${review.perfumeId}#review-${reviewId}`,
          sendEmail: false, // In-app only
        });
      }
    }

    // 🆕 NOTIFY THREAD FOLLOWERS ON EDIT
    const threadFollowers = await prisma.threadFollow.findMany({
      where: {
        perfumeId: review.perfumeId,
        userId: { not: session.user.id },
      },
      select: { userId: true },
    });

    for (const follower of threadFollowers) {
      await createNotification({
        userId: follower.userId,
        type: 'THREAD_ACTIVITY',
        message: `@${session.user.username} edited their review on a thread you follow`,
        link: `/perfumes/${review.perfumeId}#review-${reviewId}`,
        sendEmail: false,
      });
    }

    revalidatePath(`/perfumes/${review.perfumeId}`);
    return { success: true };
  } catch (error) {
    console.error('Edit review error:', error);
    return { error: 'Failed to edit review' };
  }
}

// Delete Review (Hard Delete)
export async function deleteReview(reviewId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: 'Not logged in' };

  try {
    // Verify ownership
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { userId: true, perfumeId: true }
    });

    if (!review) return { error: 'Review not found' };
    if (review.userId !== session.user. id) return { error: 'Not authorized' };

    // Hard delete the review
    await prisma.review.delete({
      where: { id: reviewId }
    });

    revalidatePath(`/perfumes/${review.perfumeId}`);
    return { success: true };
  } catch (error) {
    console. error('Delete review error:', error);
    return { error: 'Failed to delete review' };
  }
}