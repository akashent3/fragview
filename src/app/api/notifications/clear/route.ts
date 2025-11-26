import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// DELETE - Clear all notifications for user
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse. json({ error: 'Not authenticated' }, { status: 401 });
    }

    await prisma.notification.deleteMany({
      where: { userId: session. user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Clear notifications error:', error);
    return NextResponse. json({ error: 'Failed to clear notifications' }, { status: 500 });
  }
}