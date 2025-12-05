import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// ✅ CRITICAL: Cache this endpoint
export const revalidate = 10; // Cache for 10 seconds

// GET - Fetch unread notification count only (for polling)
export async function GET() {
  try {
    // ✅ OPTIMIZATION: Use try-catch for faster failure
    let session;
    try {
      session = await getServerSession(authOptions);
    } catch (error) {
      return NextResponse.json({ count: 0 });
    }

    if (!session?.user?.id) {
      return NextResponse.json({ count: 0 });
    }

    // ✅ FIXED: Use "read" instead of "isRead" (matches Prisma schema)
    const count = await prisma.notification.count({
      where: { 
        userId: session.user.id,
        read: false  // ✅ Correct field name
      },
    });

    // ✅ OPTIMIZATION: Add cache headers
    return NextResponse.json(
      { count },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
        },
      }
    );
  } catch (error) {
    console.error('Fetch notification count error:', error);
    return NextResponse.json({ count: 0 });
  }
}