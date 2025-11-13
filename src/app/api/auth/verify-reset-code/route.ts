import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });
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

    return NextResponse.json({ 
      valid: true,
      message: 'Code verified successfully' 
    });
  } catch (error) {
    console.error('Verify code error:', error);
    return NextResponse.json({ 
      error: 'Something went wrong' 
    }, { status: 500 });
  }
}