import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import clientPromise from '@/lib/mongodb';

const DB_NAME = process.env.MONGO_DB_NAME || 'fragview';
const PERFUMES_COLLECTION = 'perfumes';

export async function GET(req: NextRequest) {
  const count = Number(process.env.FEATURED_PERFUMES_COUNT || 8);

  // Try manual override first
  let manual: { mongoId: string }[] = [];
  try {
    manual = await prisma.featuredItem.findMany({
      where: { type: 'perfume' },
      orderBy: { position: 'asc' },
      take: count,
      select: { mongoId: true },
    });
  } catch {
    // model may not exist yet; ignore
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const col = db.collection(PERFUMES_COLLECTION);

  if (manual.length) {
    const ids = manual.map((m) => m.mongoId);
    const docs = await col
      .find({ _id: { $in: ids.map((id) => convertId(id)) } })
      .project({ _id: 1, brand_name: 1, variant_name: 1, slug: 1, image: 1 })
      .toArray();
    return NextResponse.json({ source: 'manual', items: docs });
  }

  // Auto fallback (newest N)
  const docs = await col
    .find({})
    .sort({ _id: -1 })
    .limit(count)
    .project({ _id: 1, brand_name: 1, variant_name: 1, slug: 1, image: 1 })
    .toArray();

  return NextResponse.json({ source: 'auto', items: docs });
}

function convertId(id: string) {
  // For normal ObjectId strings, we can attempt conversion.
  // If your _id is a standard ObjectId string length 24, use:
  // new ObjectId(id)
  // Otherwise just return the original (e.g., if already object).
  return id;
}