// scripts/generate-ai-summaries. mjs
// Fast, resumable batch job with OpenAI GPT-4o-mini
// Processes perfumes with 5+ reviews in parallel with failure tracking
// NOW WITH CHECKPOINT SUPPORT & FAILED ENTRIES LOGGING

import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGODB_URI = process.env.MONGODB_URI;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = 'gpt-4o-mini';

// Configuration
const CONCURRENT_REQUESTS = 5;
const DELAY_BETWEEN_REQUESTS = 2000;
const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 5000;
const CHECK_BATCH_SIZE = 1000; // Check 1000 perfumes at once

// Checkpoint & Logging
const CHECKPOINT_FILE = path.join(__dirname, '.checkpoint-ai-summaries.json');
const FAILED_LOG_FILE = path.join(__dirname, 'failed-ai-summaries.log');

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
 * Load checkpoint from file
 */
function loadCheckpoint() {
  try {
    if (fs.existsSync(CHECKPOINT_FILE)) {
      const data = fs.readFileSync(CHECKPOINT_FILE, 'utf8');
      const checkpoint = JSON.parse(data);
      return checkpoint;
    }
  } catch (error) {
    console.error('⚠️  Warning: Checkpoint file is corrupted:', error.message);
    return null;
  }
  return null;
}

/**
 * Save checkpoint to file (atomic write)
 */
function saveCheckpoint(checkpoint) {
  try {
    const tempFile = CHECKPOINT_FILE + '.tmp';
    fs.writeFileSync(tempFile, JSON.stringify(checkpoint, null, 2), 'utf8');
    fs.renameSync(tempFile, CHECKPOINT_FILE);
  } catch (error) {
    console.error('⚠️  Warning: Failed to save checkpoint:', error.message);
  }
}

/**
 * Delete checkpoint file
 */
function deleteCheckpoint() {
  try {
    if (fs.existsSync(CHECKPOINT_FILE)) {
      fs.unlinkSync(CHECKPOINT_FILE);
    }
  } catch (error) {
    console.error('⚠️  Warning: Failed to delete checkpoint:', error.message);
  }
}

/**
 * Log failed entry to file (append mode)
 */
function logFailedEntry(perfume, reason, attempts) {
  try {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const perfumeId = perfume._id.toString();
    const perfumeName = perfume.variant_name || perfume.perfume_name || 'Unknown';
    const brandName = perfume.brand_name || 'Unknown Brand';
    
    const logLine = `[${timestamp}] ID: ${perfumeId} | Name: ${perfumeName} | Brand: ${brandName} | Attempts: ${attempts} | Reason: ${reason}\n`;
    
    fs.appendFileSync(FAILED_LOG_FILE, logLine, 'utf8');
  } catch (error) {
    console.error('⚠️  Warning: Failed to log failed entry:', error.message);
  }
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
      
      const isRateLimit = error.message?.includes('Rate limit') || 
                         error.message?.includes('Too Many Requests') ||
                         error.message?.includes('429');
      
      if (isRateLimit && attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        console.log(`  ⏳ Rate limit hit. Waiting ${(delay/1000).toFixed(1)}s before retry ${attempt + 1}/${maxRetries}...`);
        await sleep(delay);
        continue;
      }
      
      if (attempt === maxRetries - 1) {
        throw lastError;
      }
      
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
          content: 'You are an expert perfume reviewer. Analyze reviews and create concise, helpful summaries.'
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
  
  const tokensUsed = data.usage?.total_tokens || 0;
  const estimatedCost = (tokensUsed / 1000000) * 0.30;
  
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
    .slice(0, 30);

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

Keep it concise and focus on the most frequently mentioned points. `;
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
 */
function needsRefresh(perfume, retryFailed = false) {
  if (!retryFailed && perfume.ai_summary?.failed_attempts >= 3) {
    return false;
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

  const reviews = perfume.user_reviews || [];
  const validReviews = reviews.filter(r => r.text && r.text.trim().length > 10);

  if (validReviews.length < 5) {
    console.log(`  ⏭️  Skipped (only ${validReviews.length} valid reviews)`);
    return { status: 'skipped' };
  }

  console.log(`  📝 Generating summary (${validReviews.length} reviews)...`);

  const currentFailedAttempts = perfume.ai_summary?.failed_attempts || 0;

  const prompt = buildPrompt(reviews);
  if (!prompt) {
    console.log('  ❌ Failed to build prompt');
    
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
    
    logFailedEntry(perfume, 'Failed to build prompt', currentFailedAttempts + 1);
    
    return { status: 'failed', reason: 'prompt_build_failed' };
  }

  let response;
  try {
    response = await retryWithBackoff(async () => {
      return await generateWithOpenAI(prompt);
    });
  } catch (error) {
    console.log(`  ❌ Failed after ${MAX_RETRIES} retries: ${error.message}`);
    
    const failureReason = error.message.substring(0, 200);
    
    await perfumesCollection.updateOne(
      { _id: perfume._id },
      {
        $set: {
          'ai_summary.failed_attempts': currentFailedAttempts + 1,
          'ai_summary.last_failure': new Date(),
          'ai_summary.failure_reason': failureReason
        }
      }
    );
    
    logFailedEntry(perfume, failureReason, currentFailedAttempts + 1);
    
    return { status: 'failed', error: error.message, reason: 'api_error' };
  }

  if (!response) {
    console.log('  ❌ Failed to generate summary');
    
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
    
    logFailedEntry(perfume, 'Empty response from OpenAI', currentFailedAttempts + 1);
    
    return { status: 'failed', reason: 'empty_response' };
  }

  console.log(`  💰 Tokens: ${response.tokensUsed}, Cost: $${response.estimatedCost.toFixed(4)}`);

  const parsed = parseResponse(response.text);
  if (!parsed) {
    console.log('  ❌ Failed to parse response');
    
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
    
    logFailedEntry(perfume, 'Failed to parse AI response', currentFailedAttempts + 1);
    
    return { status: 'failed', reason: 'parse_failed' };
  }

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
    failed_attempts: 0,
    last_failure: null,
    failure_reason: null,
  };

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
      cost: response.estimatedCost,
      perfumeId: perfume._id.toString(),
      perfumeName: perfumeName
    };
  } else {
    console.log('  ❌ Failed to save summary');
    
    logFailedEntry(perfume, 'Failed to save to database', currentFailedAttempts + 1);
    
    return { status: 'failed', reason: 'db_save_failed' };
  }
}

/**
 * Process perfumes in parallel batches of 5 with checkpoint saving
 */
async function processBatch(perfumes, perfumesCollection, startIndex, retryFailed, globalStats) {
  const results = {
    generated: 0,
    skipped: 0,
    failed: 0,
    totalTokens: 0,
    totalCost: 0,
  };

  let processedCount = 0;

  for (let i = 0; i < perfumes.length; i += CONCURRENT_REQUESTS) {
    const chunk = perfumes.slice(i, i + CONCURRENT_REQUESTS);
    
    const promises = chunk.map((perfume, chunkIndex) => 
      processPerfume(perfume, perfumesCollection, perfumes.length, i + chunkIndex + 1, retryFailed)
    );

    const chunkResults = await Promise.all(promises);

    chunkResults.forEach((result, idx) => {
      if (result.status === 'success') {
        results.generated++;
        results.totalTokens += result.tokensUsed || 0;
        results.totalCost += result.cost || 0;
        
        processedCount++;
        
        // Save checkpoint after every successful generation
        const checkpointData = {
          lastProcessedId: result.perfumeId,
          lastProcessedName: result.perfumeName,
          timestamp: new Date().toISOString(),
          totalProcessed: globalStats.totalProcessed + processedCount,
          stats: {
            generated: globalStats.generated + results.generated,
            skipped: globalStats.skipped + results.skipped,
            failed: globalStats.failed + results.failed
          }
        };
        
        saveCheckpoint(checkpointData);
        
      } else if (result.status === 'skipped') {
        results.skipped++;
        processedCount++;
      } else {
        results.failed++;
        processedCount++;
      }
    });

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
  
  const args = process.argv.slice(2);
  const testMode = args.includes('--test');
  const testPerfumeName = args.find(arg => arg.startsWith('--perfume='))?.split('=')[1];
  const processAll = args.includes('--all');
  const retryFailed = args.includes('--retry-failed');
  const ignoreCheckpoint = args.includes('--ignore-checkpoint');
  const resumeMode = args.includes('--resume');

  console.log('🚀 Starting AI Summary Generation with OpenAI GPT-4o-mini\n');

  if (processAll) {
    console.log('🔄 PROCESS ALL MODE: Will process ALL valid perfumes\n');
  }

  if (retryFailed) {
    console.log('🔁 RETRY FAILED MODE: Will retry perfumes that failed 3+ times\n');
  }

  // Health check
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

    // Handle checkpoint logic
    let checkpoint = null;
    let startFromId = null;
    let globalStats = {
      totalProcessed: 0,
      generated: 0,
      skipped: 0,
      failed: 0
    };

    if (! testMode && !ignoreCheckpoint) {
      checkpoint = loadCheckpoint();
      
      if (checkpoint && resumeMode) {
        console.log('📂 Checkpoint found!  Resuming...');
        console.log(`   Last processed: ${checkpoint.lastProcessedName}`);
        console.log(`   Total processed: ${checkpoint.totalProcessed} perfumes`);
        console.log(`   Timestamp: ${checkpoint.timestamp}\n`);
        
        startFromId = checkpoint.lastProcessedId;
        globalStats = checkpoint.stats || globalStats;
      } else if (checkpoint && !resumeMode) {
        console.log('📂 Checkpoint found (use --resume to resume from it)');
        console.log(`   Last processed: ${checkpoint.lastProcessedName}`);
        console.log(`   Starting fresh this run...\n`);
      }
    }

    if (ignoreCheckpoint && checkpoint) {
      console.log('🔄 Ignoring checkpoint (--ignore-checkpoint flag)\n');
      deleteCheckpoint();
    }

    // Build base query
    let query = {
      'user_reviews.4': { $exists: true },
    };

    if (! retryFailed) {
      query['$or'] = [
        { 'ai_summary.failed_attempts': { $exists: false } },
        { 'ai_summary.failed_attempts': { $lt: 3 } }
      ];
    }

    // TEST MODE
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

    // Count stats
    const totalPerfumes = await perfumesCollection.countDocuments({
      'user_reviews.4': { $exists: true },
    });
    
    const failedPerfumes = await perfumesCollection.countDocuments({
      'user_reviews.4': { $exists: true },
      'ai_summary.failed_attempts': { $gte: 3 }
    });

    console.log(`📊 Total perfumes with 5+ reviews: ${totalPerfumes.toLocaleString()}`);
    console.log(`❌ Failed perfumes (3+ attempts): ${failedPerfumes.toLocaleString()}\n`);

    console.log(`⚙️  Configuration:`);
    console.log(`   - Check batch size: ${CHECK_BATCH_SIZE} perfumes at once`);
    console.log(`   - Process concurrency: ${CONCURRENT_REQUESTS} perfumes at once`);
    console.log(`   - Delay between batches: ${DELAY_BETWEEN_REQUESTS}ms`);
    console.log(`   - Max retries per perfume: ${MAX_RETRIES}`);
    console.log(`   - Retry failed: ${retryFailed ?  'YES' : 'NO'}`);
    console.log(`   - Model: ${OPENAI_MODEL}`);
    console.log(`   - Checkpoint: ${! testMode && !ignoreCheckpoint ?  'ENABLED' : 'DISABLED'}`);
    console.log(`\n${'='.repeat(70)}\n`);

    let overallResults = {
      totalGenerated: 0,
      totalSkipped: 0,
      totalFailed: 0,
      totalTokens: 0,
      totalCost: 0,
      batchesProcessed: 0
    };

    let currentSkip = 0;
    let foundUnprocessed = false;

    // ========== MAIN LOOP: Check 1000, process if needed, repeat ==========
    while (true) {
      console.log(`\n${'='.repeat(70)}`);
      console.log(`📦 BATCH ${overallResults.batchesProcessed + 1}: Fetching ${CHECK_BATCH_SIZE} perfumes (skip ${currentSkip})...`);
      console.log('='.repeat(70));

      // Build query with skip position
      let batchQuery = { ...query };
      if (startFromId && currentSkip === 0) {
        batchQuery._id = { $gt: new ObjectId(startFromId) };
      }

      // Fetch 1000 perfumes
      const fetchedPerfumes = await perfumesCollection
        .find(batchQuery)
        .skip(currentSkip)
        .limit(CHECK_BATCH_SIZE)
        .toArray();

      if (fetchedPerfumes.length === 0) {
        console.log('\n✅ No more perfumes found in database!\n');
        break;
      }

      console.log(`✅ Fetched ${fetchedPerfumes.length} perfumes`);
      console.log(`🔍 Checking all ${fetchedPerfumes.length} perfumes concurrently for processing criteria...`);

      // Check all 1000 at once
      const checkStartTime = Date.now();
      const checkPromises = fetchedPerfumes.map((perfume, index) => 
        Promise.resolve({
          perfume,
          index,
          needsProcessing: needsRefresh(perfume, retryFailed)
        })
      );

      const checkResults = await Promise.all(checkPromises);
      const perfumesToProcess = checkResults
        .filter(result => result.needsProcessing)
        .map(result => result.perfume);

      const checkTime = ((Date.now() - checkStartTime) / 1000).toFixed(2);
      const skippedInBatch = fetchedPerfumes.length - perfumesToProcess.length;

      console.log(`✅ Check complete in ${checkTime}s`);
      console.log(`   - Needs processing: ${perfumesToProcess.length}`);
      console.log(`   - Already processed: ${skippedInBatch}\n`);

      if (perfumesToProcess.length === 0) {
        console.log('⏭️  All perfumes in this batch are already processed.  Moving to next batch...');
        overallResults.totalSkipped += skippedInBatch;
        currentSkip += CHECK_BATCH_SIZE;
        overallResults.batchesProcessed++;
        
        if (! processAll && overallResults.batchesProcessed >= 10) {
          console.log('\n⚠️  Checked 10 batches (10,000 perfumes) with no work to do.');
          console.log('   Use --all flag to continue checking all perfumes.\n');
          break;
        }
        
        continue; // Go to next 1000
      }

      // Found perfumes to process! 
      foundUnprocessed = true;
      console.log(`${'='.repeat(70)}`);
      console.log(`🚀 PROCESSING ${perfumesToProcess.length} PERFUMES (in batches of ${CONCURRENT_REQUESTS})`);
      console.log('='.repeat(70));

      // Process them in batches of 5
      const batchResults = await processBatch(
        perfumesToProcess, 
        perfumesCollection, 
        globalStats.totalProcessed,
        retryFailed,
        globalStats
      );

      // Update global stats
      globalStats.totalProcessed += fetchedPerfumes.length;
      globalStats.generated += batchResults.generated;
      globalStats.skipped += batchResults.skipped + skippedInBatch;
      globalStats.failed += batchResults.failed;

      // Update overall results
      overallResults.totalGenerated += batchResults.generated;
      overallResults.totalSkipped += batchResults.skipped + skippedInBatch;
      overallResults.totalFailed += batchResults.failed;
      overallResults.totalTokens += batchResults.totalTokens;
      overallResults.totalCost += batchResults.totalCost;
      overallResults.batchesProcessed++;

      console.log(`\n✅ Batch ${overallResults.batchesProcessed} complete! `);
      console.log(`   Generated: ${batchResults.generated} | Skipped: ${batchResults.skipped + skippedInBatch} | Failed: ${batchResults.failed}`);

      // Move to next batch
      currentSkip += CHECK_BATCH_SIZE;

      // If not processing all, stop after first batch with work
      if (!processAll) {
        console.log('\n💡 Stopping after processing one batch.  Use --all to continue.\n');
        break;
      }
    }

    // Calculate execution time
    const executionTime = ((Date.now() - startTime) / 1000).toFixed(2);

    // Final summary
    console.log('\n\n' + '='.repeat(70));
    console.log('🎉 ALL BATCHES COMPLETE');
    console.log('='.repeat(70));
    console.log(`📊 TOTAL RESULTS:`);
    console.log(`   ✅ Generated: ${overallResults.totalGenerated}`);
    console.log(`   ⏭️  Skipped: ${overallResults.totalSkipped}`);
    console.log(`   ❌ Failed: ${overallResults.totalFailed}`);
    console.log(`   📦 Batches checked: ${overallResults.batchesProcessed}`);
    console.log(`   📊 Total perfumes checked: ${overallResults.batchesProcessed * CHECK_BATCH_SIZE}`);
    
    if (checkpoint && !testMode) {
      console.log(`\n📂 CHECKPOINT STATUS:`);
      console.log(`   Total processed (all time): ${globalStats.totalProcessed}`);
      console.log(`   Checkpoint saved at: ${CHECKPOINT_FILE}`);
    }
    
    console.log('\n💰 COST SUMMARY:');
    console.log(`   Total tokens used: ${overallResults.totalTokens.toLocaleString()}`);
    console.log(`   Total cost: $${overallResults.totalCost.toFixed(4)}`);
    if (overallResults.totalGenerated > 0) {
      console.log(`   Avg cost per perfume: $${(overallResults.totalCost / overallResults.totalGenerated).toFixed(4)}`);
    }
    
    console.log('\n⏱️  PERFORMANCE:');
    console.log(`   Total time: ${executionTime}s`);
    if (overallResults.totalGenerated > 0) {
      const avgTime = (executionTime / overallResults.totalGenerated).toFixed(2);
      console.log(`   Avg time per perfume: ${avgTime}s`);
      console.log(`   Perfumes per hour: ~${Math.round(3600 / avgTime)}`);
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

    const currentFailedCount = await perfumesCollection.countDocuments({
      'user_reviews.4': { $exists: true },
      'ai_summary.failed_attempts': { $gte: 3 }
    });

    if (remainingPerfumes > 0 || currentFailedCount > 0) {
      const estimatedHours = overallResults.totalGenerated > 0 
        ? Math.ceil((remainingPerfumes * (executionTime / overallResults.totalGenerated)) / 3600) 
        : 0;
      const estimatedCost = overallResults.totalGenerated > 0 
        ?  (remainingPerfumes * (overallResults.totalCost / overallResults.totalGenerated)).toFixed(2) 
        : '0.00';
      
      console.log('📊 REMAINING WORK:');
      console.log('─'.repeat(70));
      console.log(`   Perfumes remaining: ${remainingPerfumes.toLocaleString()}`);
      console.log(`   Failed perfumes (skipped): ${currentFailedCount.toLocaleString()}`);
      console.log(`   Estimated time: ~${estimatedHours} hours`);
      console.log(`   Estimated cost: ~$${estimatedCost}`);
      console.log('\n💡 OPTIONS TO CONTINUE:');
      console.log('   - Resume from checkpoint: node scripts/generate-ai-summaries.mjs --resume');
      console.log('   - Process all: node scripts/generate-ai-summaries.mjs --all --resume');
      console.log('   - Start fresh: node scripts/generate-ai-summaries.mjs --ignore-checkpoint');
      console.log('   - Retry failed: node scripts/generate-ai-summaries.mjs --retry-failed\n');
    } else {
      console.log('🎉 ALL PERFUMES PROCESSED!\n');
      console.log('All perfumes with 5+ reviews have AI summaries.\n');
      
      if (currentFailedCount > 0) {
        console.log(`⚠️  Note: ${currentFailedCount} perfumes failed 3+ times and were skipped.`);
        console.log('   Use --retry-failed to attempt them again.\n');
      }
      
      // Delete checkpoint when done
      console.log('🗑️  Deleting checkpoint file...\n');
      deleteCheckpoint();
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