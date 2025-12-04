import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, reason } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent banning admins
    if (user.role === 'ADMIN') {
      return NextResponse.json({ error: 'Cannot ban admin users' }, { status: 403 });
    }

    // Soft delete all user's reviews
    await prisma.review.updateMany({
      where: { 
        userId,
        isDeleted: false
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        text: '[This review has been removed due to user ban]'
      }
    });

    // Delete user's sessions
    await prisma.session.deleteMany({
      where: { userId }
    });

    // Delete user account
    await prisma.user.delete({
      where: { id: userId }
    });

    // Log the action
    await prisma.adminActivityLog.create({
      data: {
        adminId: session.user.id,
        action: 'BAN_USER',
        target: userId,
        details: { reason: reason || 'No reason provided', bannedUser: user.email }
      }
    });

    return NextResponse.json({ 
      success: true,
      message: 'User has been banned and all content removed'
    });
  } catch (error) {
    console.error('Error banning user:', error);
    return NextResponse.json({ error: 'Failed to ban user' }, { status: 500 });
  }
}