'use server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Get comments for an article
 */
export async function getArticleComments(articleId: string) {
  try {
    const comments = await prisma.articleComment.findMany({
      where: { articleId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            image: true,
            badges: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return comments;
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
}

/**
 * Post a new comment
 */
export async function postArticleComment(articleId: string, content: string) {
  try {
    const session = await auth();

    if (!session?. user) {
      return { success: false, error: 'You must be logged in to comment' };
    }

    if (!content.trim()) {
      return { success: false, error: 'Comment cannot be empty' };
    }

    if (content.length > 1000) {
      return { success: false, error: 'Comment is too long (max 1000 characters)' };
    }

    const comment = await prisma.articleComment. create({
      data: {
        articleId,
        userId: session.user.id,
        content: content.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            image: true,
            badges: true,
          },
        },
      },
    });

    // TODO: Create notification for article author
    // TODO: Award +1 XP to commenter

    revalidatePath(`/drydown/*`);

    return { success: true, comment };
  } catch (error) {
    console. error('Error posting comment:', error);
    return { success: false, error: 'Failed to post comment' };
  }
}

/**
 * Delete a comment (own comments only or admin)
 */
export async function deleteArticleComment(commentId: string) {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: 'Not authenticated' };
    }

    const comment = await prisma.articleComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return { success: false, error: 'Comment not found' };
    }

    // Check if user owns comment or is admin
    if (comment.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return { success: false, error: 'You can only delete your own comments' };
    }

    await prisma. articleComment.delete({
      where: { id: commentId },
    });

    revalidatePath(`/drydown/*`);

    return { success: true };
  } catch (error) {
    console.error('Error deleting comment:', error);
    return { success: false, error: 'Failed to delete comment' };
  }
}