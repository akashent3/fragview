// src/lib/ai/summarizer.ts
// Main logic for generating and saving review summaries

import { OpenAIClient as OllamaClient } from './openai-client';
import { buildReviewSummaryPrompt, parseAISummaryResponse } from './prompt-templates';
import { connectMongoDB } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

interface Review {
  text: string;
  stars: number | null;
}

interface AISummary {
  generated_at: Date;
  review_count: number;
  summary: {
    overall_sentiment: 'positive' | 'mixed' | 'negative';
    summary_text: string;
    common_likes: string[];
    common_dislikes: string[];
  };
  last_updated: Date;
  needs_refresh: boolean;
}

/**
 * Generate AI summary for a perfume's reviews
 */
export async function generateReviewSummary(
  perfumeId: string,
  reviews: Review[]
): Promise<AISummary | null> {
  try {
    const validReviews = reviews.filter(r => r.text && r.text.trim().length > 10);
    
    if (validReviews.length < 5) {
      console.log(`Perfume ${perfumeId}: Not enough reviews (${validReviews.length}/5 minimum)`);
      return null;
    }

    console.log(`📝 Generating summary for perfume ${perfumeId} (${validReviews.length} reviews)`);

    const prompt = buildReviewSummaryPrompt(validReviews);
    
    if (!prompt) {
      return null;
    }

    const ollama = new OllamaClient();
    
    const isHealthy = await ollama.healthCheck();
    if (!isHealthy) {
      console.error('❌ Ollama is not running!  Please start it with: ollama serve');
      return null;
    }

    console.log('🤖 Asking Ollama to analyze reviews...');
    const response = await ollama.generate(prompt);

    const parsed = parseAISummaryResponse(response);
    
    if (! parsed) {
      console.error('Failed to parse AI response');
      return null;
    }

    const summary: AISummary = {
      generated_at: new Date(),
      review_count: validReviews.length,
      summary: {
        overall_sentiment: parsed.overallSentiment,
        summary_text: parsed.summaryText,
        common_likes: parsed.commonLikes,
        common_dislikes: parsed.commonDislikes,
      },
      last_updated: new Date(),
      needs_refresh: false,
    };

    console.log('✅ Summary generated successfully');
    return summary;

  } catch (error) {
    console.error('Error generating summary:', error);
    return null;
  }
}

/**
 * Save AI summary to MongoDB
 */
export async function saveSummaryToMongoDB(
  perfumeId: string,
  summary: AISummary
): Promise<boolean> {
  try {
    const { db } = await connectMongoDB();
    
    const result = await db.collection('perfumes').updateOne(
      { _id: new ObjectId(perfumeId) },
      { $set: { ai_summary: summary } }
    );

    if (result.modifiedCount === 1) {
      console.log(`✅ Saved summary to MongoDB for perfume ${perfumeId}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error saving summary to MongoDB:', error);
    return false;
  }
}

/**
 * Get AI summary from MongoDB
 */
export async function getAISummaryFromMongoDB(
  perfumeId: string
): Promise<AISummary | null> {
  try {
    const { db } = await connectMongoDB();
    
    const perfume = await db.collection('perfumes').findOne(
      { _id: new ObjectId(perfumeId) },
      { projection: { ai_summary: 1 } }
    );

    return perfume?.ai_summary || null;
  } catch (error) {
    console.error('Error fetching summary from MongoDB:', error);
    return null;
  }
}

/**
 * Check if summary needs refresh
 */
export async function shouldRefreshSummary(
  perfumeId: string,
  currentReviewCount: number
): Promise<boolean> {
  try {
    const cached = await getAISummaryFromMongoDB(perfumeId);

    if (! cached) {
      return true;
    }

    const lastUpdated = new Date(cached.last_updated);
    const daysSinceUpdate = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceUpdate >= 30) {
      console.log(`Perfume ${perfumeId}: Summary is ${Math.floor(daysSinceUpdate)} days old, needs refresh`);
      return true;
    }

    const newReviews = currentReviewCount - cached.review_count;
    if (newReviews >= 5) {
      console.log(`Perfume ${perfumeId}: ${newReviews} new reviews since last summary, needs refresh`);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking refresh status:', error);
    return false;
  }
}