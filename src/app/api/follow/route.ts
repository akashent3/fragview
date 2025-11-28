import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createNotification } from '@/lib/notifications';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!  session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { targetUserId } = await req.json();
    
    if (!targetUserId) {
      return NextResponse. json({ error: 'Target user ID required' }, { status: 400 });
    }

    // Can't follow yourself
    if (session.user.id === targetUserId) {
      return NextResponse. json({ error: 'Cannot follow yourself' }, { status: 400 });
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user. id,
          followingId: targetUserId
        }
      }
    });

    if (existingFollow) {
      // Unfollow
      await prisma.follow.delete({
        where: { id: existingFollow.id }
      });
      
      return NextResponse.json({ success: true, isFollowing: false });
    } else {
      // Follow
      await prisma.follow.create({
        data: {
          followerId: session.user.id,
          followingId: targetUserId
        }
      });

      // 🔔 CREATE NOTIFICATION (in-app only)
      const follower = await prisma.user.findUnique({
        where: { id: session.user.id },
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
      
      return NextResponse.json({ success: true, isFollowing: true });
    }
  } catch (error) {
    console.error('Follow error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}