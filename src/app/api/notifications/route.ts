import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - Fetch user's notifications
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?. user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const notifications = await prisma. notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to last 50 notifications
    });

    const unreadCount = await prisma.notification. count({
      where: { 
        userId: session.user.id,
        read: false 
      },
    });

    // Serialize dates for JSON response
    const serializedNotifications = notifications.map(n => ({
      ... n,
      createdAt: n. createdAt.toISOString(),
    }));

    return NextResponse.json({
      notifications: serializedNotifications,
      unreadCount,
    });
  } catch (error) {
    console. error('Fetch notifications error:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}