import { NextResponse } from 'next/server';
import { generateTestData } from '@/tests/fixtures/test-data-generator';

export async function POST() {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse. json(
      { error: 'Test data seeding not allowed in production' },
      { status: 403 }
    );
  }

  try {
    const testDataIds = await generateTestData();
    
    return NextResponse.json({
      success: true,
      message: 'Test data generated successfully',
      data: testDataIds,
    });
  } catch (error) {
    console.error('Error seeding test data:', error);
    return NextResponse.json(
      { error: 'Failed to seed test data', details: error },
      { status: 500 }
    );
  }
}