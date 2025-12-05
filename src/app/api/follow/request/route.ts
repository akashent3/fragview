import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createNotification } from '@/lib/notifications';

// GET pending follow requests
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const pendingRequests = await prisma.follow.findMany({
      where: {
        followingId: session.user.id,
        status: 'PENDING'
      },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            image: true,
            bio: true,
            experiencePoints: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ requests: pendingRequests });
  } catch (error) {
    console.error('Error fetching follow requests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST approve/reject follow request
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { followId, action } = await req.json();
    
    if (! followId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Check if this follow request is for current user
    const followRequest = await prisma.follow.findUnique({
      where: { id: followId },
      include: {
        follower: {
          select: { username: true, id: true }
        }
      }
    });

    if (! followRequest || followRequest.followingId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    if (action === 'approve') {
      // Approve the follow request
      await prisma.follow.update({
        where: { id: followId },
        data: {
          status: 'APPROVED',
          approvedAt: new Date()
        }
      });

      // ✅ Notify the follower (person who sent the request)
      await createNotification({
        userId: followRequest.followerId,
        type: 'FOLLOW_APPROVED',
        message: `@${session.user.username} approved your follow request! `,
        link: `/u/${session.user.username}`,
        sendEmail: false,
      });

      // ✅ NEW: Create notification for the approver (person who approved)
      await createNotification({
        userId: session.user.id,
        type: 'FOLLOW_APPROVED',
        message: `You approved @${followRequest.follower.username}'s follow request. They can now see your activity.`,
        link: `/u/${followRequest.follower.username}`,
        sendEmail: false,
      });

      // Delete the original FOLLOW_REQUEST notification
      await prisma.notification.deleteMany({
        where: {
          userId: session.user.id,
          type: 'FOLLOW_REQUEST',
          link: {
            contains: `followId=${followId}`
          }
        }
      });

      return NextResponse.json({ success: true, action: 'approved' });
    } else {
      // Reject and delete the follow request
      await prisma.follow.delete({
        where: { id: followId }
      });

      // ✅ NEW: Create notification for the rejecter (person who rejected)
      await createNotification({
        userId: session.user.id,
        type: 'SYSTEM_ANNOUNCEMENT',
        message: `You rejected @${followRequest.follower.username}'s follow request.`,
        link: '#',
        sendEmail: false,
      });

      // Delete the FOLLOW_REQUEST notification
      await prisma.notification.deleteMany({
        where: {
          userId: session.user.id,
          type: 'FOLLOW_REQUEST',
          link: {
            contains: `followId=${followId}`
          }
        }
      });

      return NextResponse.json({ success: true, action: 'rejected' });
    }
  } catch (error) {
    console.error('Error processing follow request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}