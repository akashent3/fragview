import { NextResponse } from 'next/server';
import { cleanupTestData } from '@/tests/fixtures/test-data-cleanup';

export async function DELETE() {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse. json(
      { error: 'Test data cleanup not allowed in production' },
      { status: 403 }
    );
  }

  try {
    await cleanupTestData();
    
    return NextResponse.json({
      success: true,
      message: 'Test data cleaned up successfully',
    });
  } catch (error) {
    console.error('Error cleaning up test data:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup test data', details: error },
      { status: 500 }
    );
  }
}