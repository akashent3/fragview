// scripts/generate-ai-summaries.mjs
// Fast, resumable batch job with OpenAI GPT-4o-mini
// Processes perfumes with 5+ reviews in parallel with failure tracking

import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = 'gpt-4o-mini';

// Configuration
const CONCURRENT_REQUESTS = 5; // REDUCED from 10 to 5 for better rate limit management
const DELAY_BETWEEN_REQUESTS = 2000; // 2 seconds between each batch (INCREASED from 1000ms)
const MAX_RETRIES = 5; // Retry failed requests up to 5 times
const INITIAL_RETRY_DELAY = 5000; // Start with 5 second delay for retries

// Validate API key
if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY not found in .env.local');
  console.error('Please add: OPENAI_API_KEY=sk-proj-your-key-here');
  process.exit(1);
}

/**
 * Sleep utility
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Exponential backoff retry logic
 */
async function retryWithBackoff(fn, maxRetries = MAX_RETRIES, initialDelay = INITIAL_RETRY_DELAY) {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Check if it's a rate limit error
      const isRateLimit = error.message?.includes('Rate limit') || 
                         error.message?.includes('Too Many Requests') ||
                         error.message?.includes('429');
      
      if (isRateLimit && attempt < maxRetries - 1) {
        // Exponential backoff: 5s, 10s, 20s, 40s, 80s
        const delay = initialDelay * Math.pow(2, attempt);
        console.log(`  ⏳ Rate limit hit.  Waiting ${(delay/1000).toFixed(1)}s before retry ${attempt + 1}/${maxRetries}...`);
        await sleep(delay);
        continue;
      }
      
      // If it's not a rate limit error, or we're out of retries, throw
      if (attempt === maxRetries - 1) {
        throw lastError;
      }
      
      // For other errors, wait a bit before retrying
      await sleep(2000);
    }
  }
  
  throw lastError;
}

/**
 * Call OpenAI GPT-4o-mini to generate summary
 */
async function generateWithOpenAI(prompt) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are an expert perfume reviewer.  Analyze reviews and create concise, helpful summaries.'
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
      top_p: 0.9,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${error}`);
  }

  const data = await response.json();
  
  // Log token usage for cost tracking
  const tokensUsed = data.usage?.total_tokens || 0;
  const estimatedCost = (tokensUsed / 1000000) * 0.30; // Rough estimate
  
  return {
    text: data.choices[0]?.message?.content?.trim() || '',
    tokensUsed,
    estimatedCost,
  };
}

/**
 * Build prompt for review summary
 */
function buildPrompt(reviews) {
  const validReviews = reviews
    .filter(r => r.text && r.text.trim().length > 10)
    .slice(0, 30); // Max 30 reviews

  if (validReviews.length === 0) return null;

  const reviewTexts = validReviews
    .map((r, idx) => `Review ${idx + 1}: ${r.text}`)
    .join('\n\n');

  return `You are an expert perfume reviewer analyzing customer reviews for a fragrance.  

Below are ${validReviews.length} customer reviews.  Your task is to create a concise, helpful summary.  

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

Keep it concise and focus on the most frequently mentioned points.`;
}

/**
 * Parse AI response
 */
function parseResponse(response) {
  try {
    const summaryMatch = response.match(/SUMMARY:\s*([\s\S]*?)(?=COMMON LIKES:|$)/i);
    const likesMatch = response.match(/COMMON LIKES:\s*([\s\S]*?)(?=COMMON DISLIKES:|$)/i);
    const dislikesMatch = response.match(/COMMON DISLIKES:\s*([\s\S]*?)(?=OVERALL SENTIMENT:|$)/i);
    const sentimentMatch = response.match(/OVERALL SENTIMENT:\s*(positive|mixed|negative)/i);

    const summaryText = summaryMatch ? summaryMatch[1].trim() : 'Summary not available';

    const likesText = likesMatch ? likesMatch[1].trim() : '';
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

    const sentimentText = sentimentMatch ? sentimentMatch[1].toLowerCase() : 'mixed';
    const overallSentiment = ['positive', 'mixed', 'negative'].includes(sentimentText)
      ? sentimentText
      : 'mixed';

    return {
      summaryText,
      commonLikes,
      commonDislikes,
      overallSentiment,
    };
  } catch (error) {
    console.error('Error parsing response:', error);
    return null;
  }
}

/**
 * Check if summary needs refresh
 * Skip if failed 3+ times (unless retryFailed flag is true)
 */
function needsRefresh(perfume, retryFailed = false) {
  // Skip if failed too many times (unless --retry-failed flag)
  if (! retryFailed && perfume.ai_summary?.failed_attempts >= 3) {
    return false; // Don't retry after 3 failures
  }

  if (! perfume.ai_summary) {
    return true;
  }

  const lastUpdated = new Date(perfume.ai_summary.last_updated);
  const daysSinceUpdate = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);

  if (daysSinceUpdate >= 30) {
    return true;
  }

  const currentReviewCount = perfume.user_reviews?.length || 0;
  const cachedReviewCount = perfume.ai_summary.review_count || 0;
  
  if (currentReviewCount - cachedReviewCount >= 5) {
    return true;
  }

  return false;
}

/**
 * Process a single perfume with retry logic and failure tracking
 */
async function processPerfume(perfume, perfumesCollection, totalCount, currentIndex, retryFailed) {
  const perfumeName = perfume.variant_name || perfume.perfume_name || 'Unknown';
  const brandName = perfume.brand_name || 'Unknown Brand';
  
  console.log(`\n[${currentIndex}/${totalCount}] ${perfumeName} by ${brandName}`);

  // Check if needs refresh
  if (! needsRefresh(perfume, retryFailed)) {
    // Check if it's a failed perfume
    if (perfume.ai_summary?.failed_attempts >= 3) {
      console.log(`  ⏭️  Skipped (failed ${perfume.ai_summary.failed_attempts} times - use --retry-failed to retry)`);
      return { status: 'skipped_failed', failedAttempts: perfume.ai_summary.failed_attempts };
    }
    console.log('  ⏭️  Skipped (summary is fresh)');
    return { status: 'skipped' };
  }

  const reviews = perfume.user_reviews || [];
  const validReviews = reviews.filter(r => r.text && r.text.trim().length > 10);

  if (validReviews.length < 5) {
    console.log(`  ⏭️  Skipped (only ${validReviews.length} valid reviews)`);
    return { status: 'skipped' };
  }

  console.log(`  📝 Generating summary (${validReviews.length} reviews)...`);

  // Get current failure count
  const currentFailedAttempts = perfume.ai_summary?.failed_attempts || 0;

  // Build prompt
  const prompt = buildPrompt(reviews);
  if (!prompt) {
    console.log('  ❌ Failed to build prompt');
    
    // Mark as failed in DB
    await perfumesCollection.updateOne(
      { _id: perfume._id },
      {
        $set: {
          'ai_summary.failed_attempts': currentFailedAttempts + 1,
          'ai_summary.last_failure': new Date(),
          'ai_summary.failure_reason': 'Failed to build prompt'
        }
      }
    );
    
    return { status: 'failed', reason: 'prompt_build_failed' };
  }

  // Call OpenAI with retry logic
  let response;
  try {
    response = await retryWithBackoff(async () => {
      return await generateWithOpenAI(prompt);
    });
  } catch (error) {
    console.log(`  ❌ Failed after ${MAX_RETRIES} retries: ${error.message}`);
    
    // Mark as failed in DB
    await perfumesCollection.updateOne(
      { _id: perfume._id },
      {
        $set: {
          'ai_summary.failed_attempts': currentFailedAttempts + 1,
          'ai_summary.last_failure': new Date(),
          'ai_summary.failure_reason': error.message.substring(0, 200) // Truncate long errors
        }
      }
    );
    
    return { status: 'failed', error: error.message, reason: 'api_error' };
  }

  if (!response) {
    console.log('  ❌ Failed to generate summary');
    
    // Mark as failed in DB
    await perfumesCollection.updateOne(
      { _id: perfume._id },
      {
        $set: {
          'ai_summary.failed_attempts': currentFailedAttempts + 1,
          'ai_summary.last_failure': new Date(),
          'ai_summary.failure_reason': 'Empty response from OpenAI'
        }
      }
    );
    
    return { status: 'failed', reason: 'empty_response' };
  }

  console.log(`  💰 Tokens: ${response.tokensUsed}, Cost: $${response.estimatedCost.toFixed(4)}`);

  // Parse response
  const parsed = parseResponse(response.text);
  if (!parsed) {
    console.log('  ❌ Failed to parse response');
    
    // Mark as failed in DB
    await perfumesCollection.updateOne(
      { _id: perfume._id },
      {
        $set: {
          'ai_summary.failed_attempts': currentFailedAttempts + 1,
          'ai_summary.last_failure': new Date(),
          'ai_summary.failure_reason': 'Failed to parse AI response'
        }
      }
    );
    
    return { status: 'failed', reason: 'parse_failed' };
  }

  // Build summary object - SUCCESS, reset failure counter
  const summary = {
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
    failed_attempts: 0, // Reset failure counter on success
    last_failure: null,
    failure_reason: null,
  };

  // Save to MongoDB
  const updateResult = await perfumesCollection.updateOne(
    { _id: perfume._id },
    { $set: { ai_summary: summary } }
  );

  if (updateResult.modifiedCount === 1) {
    console.log(`  ✅ Summary saved!  (Sentiment: ${parsed.overallSentiment})`);
    console.log(`  👍 Likes: ${parsed.commonLikes.length} | 👎 Dislikes: ${parsed.commonDislikes.length}`);
    return { 
      status: 'success', 
      tokensUsed: response.tokensUsed, 
      cost: response.estimatedCost 
    };
  } else {
    console.log('  ❌ Failed to save summary');
    return { status: 'failed', reason: 'db_save_failed' };
  }
}

/**
 * Process perfumes in parallel batches with rate limiting
 */
async function processBatch(perfumes, perfumesCollection, startIndex, retryFailed) {
  const results = {
    generated: 0,
    skipped: 0,
    skippedFailed: 0,
    failed: 0,
    totalTokens: 0,
    totalCost: 0,
  };

  // Process in chunks of CONCURRENT_REQUESTS (parallel)
  for (let i = 0; i < perfumes.length; i += CONCURRENT_REQUESTS) {
    const chunk = perfumes.slice(i, i + CONCURRENT_REQUESTS);
    
    const promises = chunk.map((perfume, chunkIndex) => 
      processPerfume(perfume, perfumesCollection, perfumes.length, startIndex + i + chunkIndex + 1, retryFailed)
    );

    // Wait for all perfumes in chunk to complete
    const chunkResults = await Promise.all(promises);

    // Aggregate results
    chunkResults.forEach(result => {
      if (result.status === 'success') {
        results.generated++;
        results.totalTokens += result.tokensUsed || 0;
        results.totalCost += result.cost || 0;
      } else if (result.status === 'skipped') {
        results.skipped++;
      } else if (result.status === 'skipped_failed') {
        results.skippedFailed++;
      } else {
        results.failed++;
      }
    });

    // Delay between chunks to avoid rate limits
    if (i + CONCURRENT_REQUESTS < perfumes.length) {
      const remainingChunks = Math.ceil((perfumes.length - i - CONCURRENT_REQUESTS) / CONCURRENT_REQUESTS);
      console.log(`\n⏱️  Waiting ${DELAY_BETWEEN_REQUESTS/1000}s before next batch (${remainingChunks} batches remaining)...\n`);
      await sleep(DELAY_BETWEEN_REQUESTS);
    }
  }

  return results;
}

/**
 * Main function
 */
async function generateAISummaries() {
  const startTime = Date.now();
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  const testMode = args.includes('--test');
  const testPerfumeName = args.find(arg => arg.startsWith('--perfume='))?.split('=')[1];
  const processAll = args.includes('--all');
  const retryFailed = args.includes('--retry-failed');
  const batchSize = parseInt(args.find(arg => arg.startsWith('--batch='))?.split('=')[1]) || (processAll ? 999999 : 1000);

  console.log('🚀 Starting AI Summary Generation with OpenAI GPT-4o-mini\n');

  if (processAll) {
    console.log('🔄 PROCESS ALL MODE: Will process ALL valid perfumes (no 1000 limit)\n');
  }

  if (retryFailed) {
    console.log('🔁 RETRY FAILED MODE: Will retry perfumes that failed 3+ times\n');
  }

  // Health check: Verify OpenAI API key
  try {
    const testResponse = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
    });
    
    if (!testResponse.ok) {
      console.error('❌ OpenAI API key is invalid or API is down! ');
      process.exit(1);
    }
    console.log('✅ OpenAI API is accessible\n');
  } catch (error) {
    console.error('❌ Cannot connect to OpenAI API! ');
    console.error(error.message);
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db('fragview');
    const perfumesCollection = db.collection('perfumes');

    // Build query: Only perfumes with 5+ reviews
    let query = {
      'user_reviews.4': { $exists: true }, // Has at least 5 reviews
    };

    // If NOT retrying failed, exclude perfumes with 3+ failures
    if (!retryFailed) {
      query['$or'] = [
        { 'ai_summary.failed_attempts': { $exists: false } },
        { 'ai_summary.failed_attempts': { $lt: 3 } }
      ];
    }

    // TEST MODE: Process single perfume
    if (testMode && testPerfumeName) {
      console.log(`🧪 TEST MODE: Processing single perfume: "${testPerfumeName}"\n`);
      
      query = {
        $or: [
          { slug: testPerfumeName },
          { variant_name: { $regex: testPerfumeName, $options: 'i' } },
          { perfume_name: { $regex: testPerfumeName, $options: 'i' } },
        ],
        'user_reviews.4': { $exists: true },
      };
    }

    // Count total perfumes matching criteria
    const totalPerfumes = await perfumesCollection.countDocuments({
      'user_reviews.4': { $exists: true },
    });
    
    // Count failed perfumes
    const failedPerfumes = await perfumesCollection.countDocuments({
      'user_reviews.4': { $exists: true },
      'ai_summary.failed_attempts': { $gte: 3 }
    });

    console.log(`📊 Total perfumes with 5+ reviews: ${totalPerfumes.toLocaleString()}`);
    console.log(`❌ Failed perfumes (3+ attempts): ${failedPerfumes.toLocaleString()}\n`);

    // Fetch perfumes
    const perfumes = await perfumesCollection
      .find(query)
      .limit(testMode ? 1 : batchSize)
      .toArray();

    if (perfumes.length === 0) {
      console.log('📊 No perfumes found matching criteria');
      return;
    }

    console.log(`📊 Processing ${perfumes.length.toLocaleString()} perfume(s) in this batch\n`);
    console.log(`⚙️  Configuration:`);
    console.log(`   - Batch size: ${processAll ? 'ALL' : batchSize.toLocaleString()}`);
    console.log(`   - Concurrent requests: ${CONCURRENT_REQUESTS}`);
    console.log(`   - Delay between batches: ${DELAY_BETWEEN_REQUESTS}ms`);
    console.log(`   - Max retries per perfume: ${MAX_RETRIES}`);
    console.log(`   - Retry failed: ${retryFailed ? 'YES' : 'NO'}`);
    console.log(`   - Model: ${OPENAI_MODEL}`);
    console.log(`\n${'='.repeat(70)}\n`);

    // Process perfumes
    const results = await processBatch(perfumes, perfumesCollection, 0, retryFailed);

    // Calculate execution time
    const executionTime = ((Date.now() - startTime) / 1000).toFixed(2);
    const avgTimePerPerfume = perfumes.length > 0 ?  (executionTime / perfumes.length).toFixed(2) : 0;

    // Final summary
    console.log('\n\n' + '='.repeat(70));
    console.log('📊 BATCH COMPLETE');
    console.log('='.repeat(70));
    console.log(`✅ Generated: ${results.generated}`);
    console.log(`⏭️  Skipped (fresh): ${results.skipped}`);
    console.log(`⏭️  Skipped (failed 3+): ${results.skippedFailed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📊 Total Processed: ${perfumes.length}`);
    console.log('\n💰 COST SUMMARY:');
    console.log(`   Total tokens used: ${results.totalTokens.toLocaleString()}`);
    console.log(`   Total cost: $${results.totalCost.toFixed(4)}`);
    if (results.generated > 0) {
      console.log(`   Avg cost per perfume: $${(results.totalCost / results.generated).toFixed(4)}`);
    }
    console.log('\n⏱️  PERFORMANCE:');
    console.log(`   Total time: ${executionTime}s`);
    if (perfumes.length > 0) {
      console.log(`   Avg time per perfume: ${avgTimePerPerfume}s`);
      console.log(`   Perfumes per hour: ~${Math.round(3600 / avgTimePerPerfume)}`);
    }
    console.log('='.repeat(70) + '\n');

    // Estimate remaining work
    const remainingPerfumes = await perfumesCollection.countDocuments({
      'user_reviews.4': { $exists: true },
      $or: [
        { ai_summary: { $exists: false } },
        { 'ai_summary.needs_refresh': true },
      ],
      'ai_summary.failed_attempts': { $lt: 3 }
    });

    // Get current failed perfumes count
    const currentFailedCount = await perfumesCollection.countDocuments({
      'user_reviews.4': { $exists: true },
      'ai_summary.failed_attempts': { $gte: 3 }
    });

    if (remainingPerfumes > 0 || currentFailedCount > 0) {
      const estimatedHours = perfumes.length > 0 ? Math.ceil((remainingPerfumes * avgTimePerPerfume) / 3600) : 0;
      const estimatedCost = results.generated > 0 ? (remainingPerfumes * (results.totalCost / results.generated)).toFixed(2) : '0.00';
      
      console.log('📊 REMAINING WORK:');
      console.log('─'.repeat(70));
      console.log(`   Perfumes remaining: ${remainingPerfumes.toLocaleString()}`);
      console.log(`   Failed perfumes (skipped): ${currentFailedCount.toLocaleString()}`);
      console.log(`   Estimated time: ~${estimatedHours} hours`);
      console.log(`   Estimated cost: ~$${estimatedCost}`);
      console.log('\n💡 OPTIONS TO CONTINUE:');
      console.log('   - Run again (default 1000): node scripts/generate-ai-summaries.mjs');
      console.log('   - Process all at once: node scripts/generate-ai-summaries.mjs --all');
      console.log('   - Retry failed perfumes: node scripts/generate-ai-summaries.mjs --retry-failed');
      console.log('   - Custom batch size: node scripts/generate-ai-summaries.mjs --batch=500');
      console.log('   - Test single perfume: node scripts/generate-ai-summaries.mjs --test --perfume="Chanel No.5"\n');
    } else {
      console.log('🎉 ALL PERFUMES PROCESSED!\n');
      console.log('All perfumes with 5+ reviews have AI summaries.\n');
      
      if (currentFailedCount > 0) {
        console.log(`⚠️  Note: ${currentFailedCount} perfumes failed 3+ times and were skipped.`);
        console.log('   Use --retry-failed to attempt them again.\n');
      }
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error);
    console.error('\nStack trace:', error.stack);
  } finally {
    await client.close();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run the script
generateAISummaries();