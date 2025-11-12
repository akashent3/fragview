import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { randomBytes } from 'crypto';
import { UserRole } from '@prisma/client';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { email, username, password } = await req.json();

    // 🔧 CHECK 1: Email already exists?
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    // 🔧 CHECK 2: Username already exists?
    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, username, password: hashed, emailVerified: null, role: UserRole.USER },
    });

    const token = randomBytes(20).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24);
    await prisma.verificationToken.create({ data: { identifier: email, token, expires } });

    // 🔧 CHANGED: Use dedicated email function with proper error handling
    try {
      await sendVerificationEmail(email, username, token);
    } catch (emailError) {
      console.error('Email send failed:', emailError);
      // Don't fail registration if email fails - user can request resend later
    }

    return NextResponse.json({ 
      message: 'Registration successful. Please check your email to verify.' 
    });
  } catch (e: any) {
    console.error('Registration error:', e);
    return NextResponse.json({ 
      error: e?.message || 'Registration failed' 
    }, { status: 500 });
  }
}