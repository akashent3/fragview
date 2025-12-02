// src/app/api/admin/refresh-summary/route. ts
// Admin endpoint to manually refresh a perfume's AI summary

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectMongoDB } from '@/lib/mongodb';
import { generateReviewSummary, saveSummaryToMongoDB } from '@/lib/ai/summarizer';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    // 1. Check if user is admin
    const session = await getServerSession(authOptions);
    
    if (!session?. user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Add proper admin check based on your user model
    // Example: if (session.user.role !== 'admin') { return unauthorized }

    // 2. Get perfume ID from request
    const { perfumeId } = await request.json();

    if (!perfumeId) {
      return NextResponse.json({ error: 'perfumeId required' }, { status: 400 });
    }

    console.log(`Admin refresh requested for perfume: ${perfumeId}`);

    // 3.  Fetch perfume from MongoDB
    const { db } = await connectMongoDB();
    const perfume = await db.collection('perfumes'). findOne({
      _id: new ObjectId(perfumeId),
    });

    if (!perfume) {
      return NextResponse.json({ error: 'Perfume not found' }, { status: 404 });
    }

    const reviews = perfume.user_reviews || [];

    // 4. Generate summary
    const summary = await generateReviewSummary(perfumeId, reviews);

    if (!summary) {
      return NextResponse.json(
        { error: 'Failed to generate summary.  Check if Ollama is running and perfume has 5+ reviews.' },
        { status: 500 }
      );
    }

    // 5. Save to MongoDB
    const saved = await saveSummaryToMongoDB(perfumeId, summary);

    if (!saved) {
      return NextResponse.json(
        { error: 'Failed to save summary to database' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Summary refreshed successfully',
      summary: summary. summary,
    });

  } catch (error) {
    console.error('Error in refresh-summary API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}