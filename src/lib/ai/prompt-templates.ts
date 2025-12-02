// src/lib/ai/prompt-templates.ts
// Templates for asking Ollama to summarize reviews

export interface Review {
  text: string;
  stars: number | null;
}

/**
 * Build the prompt to send to Ollama
 */
export function buildReviewSummaryPrompt(reviews: Review[]): string {
  const validReviews = reviews.filter(r => r.text && r.text.trim().length > 10);
  
  if (validReviews.length === 0) {
    return '';
  }

  const reviewsToAnalyze = validReviews.slice(0, 30);
  const reviewTexts = reviewsToAnalyze.map((r, idx) => {
    return `Review ${idx + 1}: ${r.text}`;
  }).join('\n\n');

  const prompt = `You are an expert perfume reviewer analyzing customer reviews for a fragrance.  

Below are ${reviewsToAnalyze.length} customer reviews.  Your task is to create a concise, helpful summary. 

${reviewTexts}

Based on these reviews, provide a summary in EXACTLY this format:

SUMMARY:
[Write 2-3 sentences summarizing the overall experience with this fragrance]

COMMON LIKES:
- [Most mentioned positive aspect 1]
- [Most mentioned positive aspect 2]
- [Most mentioned positive aspect 3]

COMMON DISLIKES:
- [Most mentioned negative aspect 1]
- [Most mentioned negative aspect 2]
- [Most mentioned negative aspect 3]

OVERALL SENTIMENT: [positive/mixed/negative]

Keep it concise and focus on the most frequently mentioned points. `;

  return prompt;
}

/**
 * Parse Ollama's response into structured data
 */
export function parseAISummaryResponse(response: string): {
  summaryText: string;
  commonLikes: string[];
  commonDislikes: string[];
  overallSentiment: 'positive' | 'mixed' | 'negative';
} | null {
  try {
    const summaryMatch = response.match(/SUMMARY:\s*([\s\S]*?)(?=COMMON LIKES:|$)/i);
    const likesMatch = response.match(/COMMON LIKES:\s*([\s\S]*?)(?=COMMON DISLIKES:|$)/i);
    const dislikesMatch = response.match(/COMMON DISLIKES:\s*([\s\S]*?)(?=OVERALL SENTIMENT:|$)/i);
    const sentimentMatch = response.match(/OVERALL SENTIMENT:\s*(positive|mixed|negative)/i);

    const summaryText = summaryMatch 
      ? summaryMatch[1].trim() 
      : 'Summary not available';

    const likesText = likesMatch ?  likesMatch[1].trim() : '';
    const commonLikes = likesText
      .split('\n')
      .map(line => line.replace(/^[-*•]\s*/, '').trim())
      .filter(line => line.length > 0)
      .slice(0, 5);

    const dislikesText = dislikesMatch ? dislikesMatch[1].trim() : '';
    const commonDislikes = dislikesText
      .split('\n')
      .map(line => line.replace(/^[-*•]\s*/, '').trim())
      .filter(line => line.length > 0)
      .slice(0, 5);

    const sentimentText = sentimentMatch 
      ? sentimentMatch[1].toLowerCase() 
      : 'mixed';
    
    const overallSentiment = ['positive', 'mixed', 'negative'].includes(sentimentText)
      ? (sentimentText as 'positive' | 'mixed' | 'negative')
      : 'mixed';

    return {
      summaryText,
      commonLikes,
      commonDislikes,
      overallSentiment,
    };
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return null;
  }
}