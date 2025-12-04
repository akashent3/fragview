import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const brandId = searchParams.get('brandId');

    if (!brandId) {
      return NextResponse.json({ error: 'Brand ID required' }, { status: 400 });
    }

    // Get follower count
    const followerCount = await prisma.brandFollow.count({
      where: { brandId }
    });

    // Check if current user is following (if logged in)
    const session = await getServerSession(authOptions);
    let isFollowing = false;

    if (session?.user) {
      const follow = await prisma.brandFollow.findUnique({
        where: {
          userId_brandId: {
            userId: session.user.id,
            brandId
          }
        }
      });
      isFollowing = !!follow;
    }

    return NextResponse.json({ 
      isFollowing, 
      followerCount 
    });
  } catch (error) {
    console.error('Error checking brand follow status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}