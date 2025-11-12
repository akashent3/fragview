import { NextResponse } from 'next/server';
import { countBrands } from '@/lib/data/brands';
import { countPerfumes } from '@/lib/data/perfumes';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const [brands, perfumes, users, reviews] = await Promise.all([
      countBrands(),
      countPerfumes(),
      prisma.user.count(),
      // review model may not exist yet; guard safely
      (prisma as any).review?.count?.() ?? Promise.resolve(0),
    ]);

    return NextResponse.json({
      brands,
      perfumes,
      users,
      reviews,
    });
  } catch {
    // Avoid failing build/export if DB is unavailable during build:
    // return safe defaults so pages can still be generated.
    return NextResponse.json({
      brands: 0,
      perfumes: 0,
      users: 0,
      reviews: 0,
    });
  }
}