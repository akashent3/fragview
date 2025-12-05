import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createNotification } from '@/lib/notifications';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { targetUserId } = await req.json();
    
    if (!targetUserId) {
      return NextResponse.json({ error: 'Target user ID required' }, { status: 400 });
    }

    // Can't follow yourself
    if (session.user.id === targetUserId) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
    }

    // Check if any follow relationship exists
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: targetUserId
        }
      }
    });

    if (existingFollow) {
      // If exists, delete it (unfollow/cancel request)
      await prisma.follow.delete({
        where: { id: existingFollow.id }
      });
      
      return NextResponse.json({ 
        success: true, 
        status: null,
        message: 'Unfollowed / Request cancelled'
      });
    } else {
      // Create NEW follow request with PENDING status
      const followRequest = await prisma.follow.create({
        data: {
          followerId: session.user.id,
          followingId: targetUserId,
          status: 'PENDING'
        }
      });

      // Send notification to target user
      const follower = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { username: true }
      });

      if (follower) {
        await createNotification({
          userId: targetUserId,
          type: 'FOLLOW_REQUEST',
          message: `@${follower.username} wants to follow your scent journey`,
          link: `/u/${follower.username}?followId=${followRequest.id}`, // ✅ ADD followId
          sendEmail: false,
        });
      }
      
      return NextResponse.json({ 
        success: true, 
        status: 'PENDING',
        message: 'Follow request sent'
      });
    }
  } catch (error) {
    console.error('Follow error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}