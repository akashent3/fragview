import { NextResponse } from 'next/server';
import { checkPerfumeExists, checkBrandExists } from '@/lib/duplicate-check';

export async function POST(request: Request) {
  try {
    const { type, name, brandName } = await request.json();

    if (type === 'perfume') {
      if (! name || !brandName) {
        return NextResponse.json(
          { error: 'Name and brand name are required' },
          { status: 400 }
        );
      }

      const result = await checkPerfumeExists(name, brandName);
      return NextResponse.json(result);
    }

    if (type === 'brand') {
      if (!name) {
        return NextResponse.json(
          { error: 'Brand name is required' },
          { status: 400 }
        );
      }

      const result = await checkBrandExists(name);
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: 'Invalid type' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Duplicate check error:', error);
    return NextResponse.json(
      { error: 'Failed to check for duplicates' },
      { status: 500 }
    );
  }
}