import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { rateLimit } from '@/lib/rate-limit';

// 🔒 ADD RATE LIMITING - Only 5 attempts per hour
const limiter = rateLimit({ interval: 3600000, uniqueTokenPerInterval: 5 });

export async function POST(req: NextRequest) {
  try {
    // 🔒 CHECK RATE LIMIT FIRST
    const rateLimitResult = await limiter(req);
    if (rateLimitResult) return rateLimitResult;

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

    // 🔒 ADD MAX ATTEMPTS CHECK - Lock after 5 failed attempts
    const failedAttempts = await prisma.passwordResetToken.count({
      where: {
        email,
        used: false,
        expires: { gt: new Date() }
      }
    });

    if (failedAttempts >= 5) {
      // Delete all tokens to force user to request new code
      await prisma.passwordResetToken.deleteMany({
        where: { email, used: false }
      });
      return NextResponse.json({ 
        error: 'Too many failed attempts. Please request a new reset code.' 
      }, { status: 429 });
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
    const hashedPassword = await bcrypt.hash(newPassword, 12); // 🔒 Increased from 10 to 12 rounds

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
      // 🔒 DELETE ALL OTHER UNUSED TOKENS for this email
      prisma.passwordResetToken.deleteMany({
        where: { 
          email, 
          used: false,
          id: { not: token.id }
        }
      })
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