import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { email, code, newPassword } = await req.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json({ 
        error: 'Email, code, and new password are required' 
      }, { status: 400 });
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json({ 
        error: 'Password must be at least 8 characters' 
      }, { status: 400 });
    }

    // Find valid token
    const token = await prisma.passwordResetToken.findFirst({
      where: {
        email,
        code,
        used: false,
        expires: { gt: new Date() },
      },
    });

    if (!token) {
      return NextResponse.json({ 
        error: 'Invalid or expired code' 
      }, { status: 400 });
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: token.id },
        data: { used: true },
      }),
    ]);

    return NextResponse.json({ 
      message: 'Password reset successfully' 
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ 
      error: 'Something went wrong' 
    }, { status: 500 });
  }
}