import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET user settings
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?. user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await prisma.user. findUnique({
      where: { id: session.user.id },
      select: {
        isWardrobePublic: true,
        isActivityPublic: true,
      }
    });

    if (!user) {
      return NextResponse. json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      priceAlerts: true, // Default - not in DB yet
      reviewResponses: true, // Default - not in DB yet
      newsletter: false, // Default - not in DB yet
      isWardrobePublic: user. isWardrobePublic,
      isActivityPublic: user.isActivityPublic,
    });
  } catch (error) {
    console.error('GET settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST update settings
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const { isWardrobePublic, isActivityPublic } = body;

    await prisma.user.update({
      where: { id: session. user.id },
      data: {
        isWardrobePublic: isWardrobePublic ??  false,
        isActivityPublic: isActivityPublic ?? true,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}