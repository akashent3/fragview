import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (! session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();

    const {
      emailNotifWeeklyDigest,
      unsubscribedFromAll,
    } = body;

    await prisma.user.update({
      where: { id: session. user.id },
      data: {
        emailNotifWeeklyDigest,
        unsubscribedFromAll,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save notification settings error:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}