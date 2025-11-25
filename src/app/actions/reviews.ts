'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Toggle Helpful (Upvote) or Unhelpful (Downvote)
export async function voteReview(reviewId: string, type: 'UP' | 'DOWN') {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: 'Not logged in' };

  const userId = session.user.id;

  try {
    // Check existing vote
    const existing = await prisma.reviewHelpful.findUnique({
      where: {
        reviewId_userId: { // Compound unique key
          reviewId: reviewId,
          userId: userId
        }
      }
    });

    if (existing) {
      // If schema doesn't have 'type', we assume existing means 'UP'.
      // To keep it simple without schema changes, we just toggle off.
      // If you added 'type' to schema, uncomment the type check logic.
      
      // Same vote clicked -> Remove it (Toggle off)
      await prisma.reviewHelpful.delete({ where: { id: existing.id } });
      
      await prisma.review.update({
        where: { id: reviewId },
        data: { 
          helpfulCount: { decrement: 1 } // Simple toggle for now
        }
      });
      return { status: 'removed' };
      
    } else {
      // New Vote
      await prisma.reviewHelpful.create({
        data: { 
          reviewId, 
          userId, 
          // type: type // Add this if you migrated the schema
        } 
      });

      await prisma.review.update({
        where: { id: reviewId },
        data: { helpfulCount: { increment: 1 } }
      });
      
      return { status: 'added', type };
    }
  } catch (error) {
    console.error('Voting error:', error);
    return { error: 'Failed to vote' };
  }
}