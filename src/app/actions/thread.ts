'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function toggleFollowThread(perfumeId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: 'Not logged in', isFollowing: false };
  }

  const userId = session.user.id;

  try {
    const existing = await prisma.threadFollow.findUnique({
      where: {
        userId_perfumeId: {
          userId: userId,
          perfumeId: perfumeId
        }
      }
    });

    if (existing) {
      await prisma.threadFollow.delete({
        where: { id: existing.id }
      });
      
      revalidatePath(`/perfumes/${perfumeId}`);
      return { success: true, isFollowing: false };
    } else {
      await prisma.threadFollow.create({
        data: {
          userId: userId,
          perfumeId: perfumeId
        }
      });
      
      revalidatePath(`/perfumes/${perfumeId}`);
      return { success: true, isFollowing: true };
    }
  } catch (error) {
    console.error('Thread follow error:', error);
    return { error: 'Failed to update follow status', isFollowing: false };
  }
}

export async function checkThreadFollowStatus(perfumeId: string, userId: string) {
  try {
    const follow = await prisma.threadFollow.findUnique({
      where: {
        userId_perfumeId: {
          userId: userId,
          perfumeId: perfumeId
        }
      }
    });
    
    return !!follow;
  } catch (error) {
    console.error('Check follow status error:', error);
    return false;
  }
}