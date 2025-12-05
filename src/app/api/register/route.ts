import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { randomBytes } from 'crypto';
import { UserRole } from '@prisma/client';
import { sendVerificationEmail } from '@/lib/email';
import { rateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

// Rate limit: 5 registrations per hour per IP (more lenient for testing)
const limiter = rateLimit({ interval: 3600000, uniqueTokenPerInterval: 5 });

// Registration validation schema (LESS strict to match original)
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6), // ✅ Reduced from 8 to match your original
  username: z.string().min(3).max(50),
});

export async function POST(req: NextRequest) {
  try {
    // Check rate limit
    const rateLimitResult = await limiter(req);
    if (rateLimitResult) return rateLimitResult;

    const body = await req.json();

    // Validate input
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid input', 
        details: validation.error.issues 
      }, { status: 400 });
    }

    const { email, username, password } = validation.data;

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

    const hashed = await bcrypt.hash(password, 10); // ✅ Keep original 10 rounds
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