import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { randomBytes } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { email, username, password } = await req.json();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 400 });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, username, password: hashed, emailVerified: null, role: 'user' },
    });

    const token = randomBytes(20).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24);
    await prisma.verificationToken.create({ data: { identifier: email, token, expires } });

    // Send email (Resend) – keep your existing send function if you have one.
    const base = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const url = `${base}/verify-email?token=${token}`;
    // Minimal inline email (replace with your existing sendVerificationEmail if present)
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: 'FragView <onboarding@resend.dev>',
        to: email,
        subject: 'Verify your email',
        html: `<p>Hi ${username},</p><p>Click to verify: <a href="${url}">${url}</a></p>`,
      });
    } catch (e) {
      console.warn('Email send failed (continuing):', (e as any)?.message);
    }

    return NextResponse.json({ message: 'Registration successful. Please check your email to verify.' });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Registration failed' }, { status: 500 });
  }
}