import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Invalid verification link' }, { status: 400 });

  const vt = await prisma.verificationToken.findUnique({ where: { token } });
  if (!vt) return NextResponse.json({ error: 'Invalid or expired verification link' }, { status: 400 });

  if (vt.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token } });
    return NextResponse.json({ error: 'Verification link has expired' }, { status: 400 });
  }

  await prisma.user.update({ where: { email: vt.identifier }, data: { emailVerified: new Date() } });
  await prisma.verificationToken.delete({ where: { token } });

  return NextResponse.json({ success: true, message: 'Email verified successfully! You can now sign in.' });
}