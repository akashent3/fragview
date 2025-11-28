'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { createNotification } from '@/lib/notifications';

export async function toggleFollow(targetUserId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: 'Not logged in' };

  const followerId = session.user.id;

  if (followerId === targetUserId) {
    return { error: 'Cannot follow yourself' };
  }

  try {
    // Check if already following
    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: targetUserId,
        }
      }
    });

    if (existing) {
      // Unfollow
      await prisma.follow.delete({
        where: { id: existing.id }
      });
      
      revalidatePath(`/u`);
      return { status: 'unfollowed' };
    } else {
      // Follow
      await prisma.follow.create({
        data: {
          followerId,
          followingId: targetUserId,
        }
      });

      // 🔔 CREATE NOTIFICATION (in-app only)
      const follower = await prisma.user.findUnique({
        where: { id: followerId },
        select: { username: true }
      });

      if (follower) {
        await createNotification({
          userId: targetUserId,
          type: 'NEW_FOLLOWER',
          message: `@${follower.username} started following you`,
          link: `/u/${follower.username}`,
          sendEmail: false, // In-app only
        });
      }

      revalidatePath(`/u`);
      return { status: 'followed' };
    }
  } catch (error) {
    console.error('Follow error:', error);
    return { error: 'Failed to toggle follow' };
  }
}