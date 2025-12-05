import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';

// 🔒 STRICT RATE LIMITING - Only 5 verification attempts per hour
const limiter = rateLimit({ interval: 3600000, uniqueTokenPerInterval: 5 });

export async function POST(req: NextRequest) {
  try {
    // 🔒 CHECK RATE LIMIT
    const rateLimitResult = await limiter(req);
    if (rateLimitResult) return rateLimitResult;

    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ 
        error: 'Email and code are required' 
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
        valid: false,
        error: 'Invalid or expired code' 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      valid: true,
      message: 'Code verified successfully' 
    });
  } catch (error) {
    console.error('Verify code error:', error);
    return NextResponse.json({ 
      error: 'Verification failed' 
    }, { status: 500 });
  }
}