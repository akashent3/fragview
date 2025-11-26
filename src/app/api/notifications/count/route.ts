import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - Fetch unread notification count only (for polling)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse. json({ count: 0 });
    }

    const count = await prisma.notification.count({
      where: { 
        userId: session.user.id,
        read: false 
      },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Fetch notification count error:', error);
    return NextResponse.json({ count: 0 });
  }
}