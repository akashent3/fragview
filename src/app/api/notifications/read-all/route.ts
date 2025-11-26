import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST - Mark all notifications as read
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse. json({ error: 'Not authenticated' }, { status: 401 });
    }

    await prisma.notification. updateMany({
      where: { 
        userId: session.user.id,
        read: false,
      },
      data: { read: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    return NextResponse. json({ error: 'Failed to mark all as read' }, { status: 500 });
  }
}