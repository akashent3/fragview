import { NextResponse } from 'next/server';
import { countBrands } from '@/lib/data/brands';
import { countPerfumes } from '@/lib/data/perfumes';
import prisma from '@/lib/prisma';

export async function GET() {
  const [brands, perfumes, users, reviews] = await Promise.all([
    countBrands(),
    countPerfumes(),
    prisma.user.count(),
    prisma.review ? prisma.review.count() : Promise.resolve(0), // review model later
  ]);

  return NextResponse.json({
    brands,
    perfumes,
    users,
    reviews,
  });
}