import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { randomBytes } from 'crypto';
import { UserRole } from '@prisma/client';
import { sendVerificationEmail } from '@/lib/email';
import { rateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

// Rate limit: 5 registrations per hour per IP
const limiter = rateLimit({ interval: 3600000, uniqueTokenPerInterval: 5 });

// 🔒 STRONGER PASSWORD VALIDATION
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores'),
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

    // 🔒 SANITIZE EMAIL (lowercase and trim)
    const sanitizedEmail = email.toLowerCase().trim();
    const sanitizedUsername = username.trim();

    // CHECK 1: Email already exists?  
    const existingEmail = await prisma.user.findUnique({ 
      where: { email: sanitizedEmail } 
    });
    if (existingEmail) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    // CHECK 2: Username already exists? 
    const existingUsername = await prisma.user.findUnique({ 
      where: { username: sanitizedUsername } 
    });
    if (existingUsername) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
    }

    // 🔒 INCREASED BCRYPT ROUNDS from 10 to 12 for better security
    const hashed = await bcrypt.hash(password, 12);
    
    const user = await prisma.user.create({
      data: { 
        email: sanitizedEmail, 
        username: sanitizedUsername, 
        password: hashed, 
        emailVerified: null, 
        role: UserRole.USER 
      },
    });

    // 🔒 USE CRYPTOGRAPHICALLY SECURE TOKEN (32 bytes = 64 hex chars)
    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours
    
    await prisma.verificationToken.create({ 
      data: { 
        identifier: sanitizedEmail, 
        token, 
        expires 
      } 
    });

    // Send verification email
    try {
      await sendVerificationEmail(sanitizedEmail, sanitizedUsername, token);
    } catch (emailError) {
      console.error('Email send failed:', emailError);
      // Don't fail registration if email fails - user can request resend later
    }

    return NextResponse.json({ 
      message: 'Registration successful.  Please check your email to verify.' 
    });
  } catch (e: any) {
    console.error('Registration error:', e);
    return NextResponse.json({ 
      error: e?.message || 'Registration failed' 
    }, { status: 500 });
  }
}