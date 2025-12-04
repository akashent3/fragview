import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (! session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { brandId, brandName } = await req.json();
    
    if (!brandId || !brandName) {
      return NextResponse.json({ error: 'Brand ID and name required' }, { status: 400 });
    }

    // Check if already following
    const existingFollow = await prisma.brandFollow.findUnique({
      where: {
        userId_brandId: {
          userId: session.user.id,
          brandId
        }
      }
    });

    if (existingFollow) {
      // Unfollow
      await prisma.brandFollow.delete({
        where: { id: existingFollow.id }
      });
      
      return NextResponse.json({ success: true, isFollowing: false });
    } else {
      // Follow
      await prisma.brandFollow.create({
        data: {
          userId: session.user.id,
          brandId,
          brandName
        }
      });
      
      return NextResponse.json({ success: true, isFollowing: true });
    }
  } catch (error) {
    console.error('Brand follow error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET user's followed brands
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || session.user.id;

    const followedBrands = await prisma.brandFollow.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ brands: followedBrands });
  } catch (error) {
    console.error('Error fetching followed brands:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}