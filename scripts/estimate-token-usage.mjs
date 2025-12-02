// scripts/estimate-token-usage.mjs
// Estimates token usage for AI review summary generation

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

// OpenAI GPT-4o-mini pricing
const PRICING = {
  INPUT_PER_1M: 0.15,      // $0.15 per 1M input tokens
  OUTPUT_PER_1M: 0.60,     // $0.60 per 1M output tokens
};

/**
 * Estimate token count for text
 * Rule of thumb: 1 token ≈ 4 characters (English text)
 * More accurate: use tiktoken library, but this is good enough
 */
function estimateTokens(text) {
  if (!text) return 0;
  // Average: 1 token = 4 characters
  return Math.ceil(text.length / 4);
}

/**
 * Estimate tokens for a single perfume's reviews
 */
function estimatePerfumeTokens(perfume) {
  const reviews = perfume.user_reviews || [];
  const validReviews = reviews.filter(r => r.text && r.text.trim().length > 10);

  if (validReviews.length < 5) {
    return null; // Won't process this perfume
  }

  // Take max 30 reviews for processing (as per our script)
  const reviewsToAnalyze = validReviews.slice(0, 30);

  // Calculate input tokens
  let inputTokens = 0;

  // System prompt tokens (~50 tokens)
  inputTokens += 50;

  // Instruction prompt tokens (~150 tokens)
  inputTokens += 150;

  // Review texts
  reviewsToAnalyze.forEach(review => {
    inputTokens += estimateTokens(review.text);
  });

  // Estimated output tokens (summary will be ~300-500 tokens)
  const outputTokens = 400; // Average estimate

  return {
    perfumeId: perfume._id,
    perfumeName: perfume.variant_name || perfume.perfume_name || 'Unknown',
    brandName: perfume.brand_name || 'Unknown',
    totalReviews: reviews.length,
    validReviews: validReviews.length,
    reviewsToProcess: reviewsToAnalyze.length,
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
  };
}

/**
 * Main function
 */
async function estimateTokenUsage() {
  console.log('🔍 Analyzing MongoDB perfumes collection...\n');

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db('fragview');
    const perfumesCollection = db.collection('perfumes');

    // Count total perfumes
    const totalPerfumes = await perfumesCollection.countDocuments();
    console.log(`📊 Total perfumes in database: ${totalPerfumes.toLocaleString()}\n`);

    // Count perfumes with 5+ reviews
    const perfumesWithReviewsCount = await perfumesCollection.countDocuments({
      'user_reviews.4': { $exists: true }, // Has at least 5 reviews
    });
    console.log(`📊 Perfumes with 5+ reviews: ${perfumesWithReviewsCount.toLocaleString()}\n`);

    console.log('🔄 Analyzing all perfumes with 5+ reviews...\n');
    console.log('This may take a few minutes for large datasets...\n');

    // Fetch all perfumes with 5+ reviews
    const perfumes = await perfumesCollection
      .find({
        'user_reviews.4': { $exists: true },
      })
      .project({
        _id: 1,
        variant_name: 1,
        perfume_name: 1,
        brand_name: 1,
        user_reviews: 1,
      })
      .toArray();

    console.log(`✅ Fetched ${perfumes.length} perfumes\n`);
    console.log('📊 Calculating token estimates...\n');

    // Calculate token estimates for each perfume
    const estimates = [];
    let processedCount = 0;

    for (const perfume of perfumes) {
      const estimate = estimatePerfumeTokens(perfume);
      
      if (estimate) {
        estimates.push(estimate);
        processedCount++;

        // Show progress every 1000 perfumes
        if (processedCount % 1000 === 0) {
          console.log(`  Processed ${processedCount}/${perfumes.length} perfumes...`);
        }
      }
    }

    console.log(`\n✅ Analysis complete! \n`);

    // Calculate totals
    const totalInputTokens = estimates.reduce((sum, e) => sum + e.inputTokens, 0);
    const totalOutputTokens = estimates.reduce((sum, e) => sum + e.outputTokens, 0);
    const totalTokens = totalInputTokens + totalOutputTokens;

    // Calculate costs
    const inputCost = (totalInputTokens / 1_000_000) * PRICING.INPUT_PER_1M;
    const outputCost = (totalOutputTokens / 1_000_000) * PRICING.OUTPUT_PER_1M;
    const totalCost = inputCost + outputCost;

    // Statistics
    const avgInputTokens = Math.round(totalInputTokens / estimates.length);
    const avgOutputTokens = Math.round(totalOutputTokens / estimates.length);
    const avgTotalTokens = Math.round(totalTokens / estimates.length);
    const avgCostPerPerfume = totalCost / estimates.length;

    // Sort by token usage (highest first)
    estimates.sort((a, b) => b.totalTokens - a.totalTokens);

    // Print results
    console.log('\n' + '='.repeat(70));
    console.log('📊 TOKEN USAGE ESTIMATION REPORT');
    console.log('='.repeat(70));
    
    console.log('\n📈 OVERALL STATISTICS:');
    console.log('─'.repeat(70));
    console.log(`Total perfumes in database:        ${totalPerfumes.toLocaleString()}`);
    console.log(`Perfumes with 5+ reviews:          ${perfumesWithReviewsCount.toLocaleString()}`);
    console.log(`Perfumes to process:               ${estimates.length.toLocaleString()}`);
    console.log(`Perfumes skipped (<5 reviews):     ${(perfumes.length - estimates.length).toLocaleString()}`);

    console.log('\n💰 TOKEN USAGE:');
    console.log('─'.repeat(70));
    console.log(`Total input tokens:                ${totalInputTokens.toLocaleString()} tokens`);
    console.log(`Total output tokens:               ${totalOutputTokens.toLocaleString()} tokens`);
    console.log(`Total tokens:                      ${totalTokens.toLocaleString()} tokens`);
    console.log(`\nAverage input per perfume:         ${avgInputTokens.toLocaleString()} tokens`);
    console.log(`Average output per perfume:        ${avgOutputTokens.toLocaleString()} tokens`);
    console.log(`Average total per perfume:         ${avgTotalTokens.toLocaleString()} tokens`);

    console.log('\n💵 COST ESTIMATION (OpenAI GPT-4o-mini):');
    console.log('─'.repeat(70));
    console.log(`Input cost ($0.15 per 1M tokens):  $${inputCost.toFixed(2)}`);
    console.log(`Output cost ($0.60 per 1M tokens): $${outputCost.toFixed(2)}`);
    console.log(`Total estimated cost:              $${totalCost.toFixed(2)}`);
    console.log(`\nAverage cost per perfume:          $${avgCostPerPerfume.toFixed(4)}`);

    console.log('\n⏱️ TIME ESTIMATION:');
    console.log('─'.repeat(70));
    
    // Estimate processing time
    // OpenAI GPT-4o-mini: ~1000 tokens/sec, but with API overhead ~2-5 sec per request
    const avgSecondsPerPerfume = 3; // Conservative estimate
    const totalSeconds = estimates.length * avgSecondsPerPerfume;
    const totalMinutes = Math.round(totalSeconds / 60);
    const totalHours = Math.round(totalMinutes / 60);
    const totalDays = Math.round(totalHours / 24);

    console.log(`Average time per perfume:          ~${avgSecondsPerPerfume} seconds`);
    console.log(`Total processing time (sequential): ~${totalMinutes.toLocaleString()} minutes (${totalHours} hours / ${totalDays} days)`);
    
    // With parallel processing (10 concurrent)
    const parallelMinutes = Math.round(totalMinutes / 10);
    const parallelHours = Math.round(parallelMinutes / 60);
    const parallelDays = Math.round(parallelHours / 24);
    console.log(`With 10 concurrent requests:       ~${parallelMinutes.toLocaleString()} minutes (${parallelHours} hours / ${parallelDays} days)`);

    console.log('\n📊 TOP 10 MOST TOKEN-INTENSIVE PERFUMES:');
    console.log('─'.repeat(70));
    estimates.slice(0, 10).forEach((e, idx) => {
      console.log(`${idx + 1}.${e.perfumeName} by ${e.brandName}`);
      console.log(`   Reviews: ${e.totalReviews} (processing ${e.reviewsToProcess})`);
      console.log(`   Tokens: ${e.totalTokens.toLocaleString()} (input: ${e.inputTokens.toLocaleString()}, output: ${e.outputTokens.toLocaleString()})`);
      console.log(`   Est.cost: $${((e.totalTokens / 1_000_000) * ((PRICING.INPUT_PER_1M + PRICING.OUTPUT_PER_1M) / 2)).toFixed(4)}`);
      console.log('');
    });

    console.log('\n📊 DISTRIBUTION BY REVIEW COUNT:');
    console.log('─'.repeat(70));
    
    const distribution = {
      '5-9 reviews': estimates.filter(e => e.validReviews >= 5 && e.validReviews <= 9).length,
      '10-19 reviews': estimates.filter(e => e.validReviews >= 10 && e.validReviews <= 19).length,
      '20-29 reviews': estimates.filter(e => e.validReviews >= 20 && e.validReviews <= 29).length,
      '30+ reviews': estimates.filter(e => e.validReviews >= 30).length,
    };

    Object.entries(distribution).forEach(([range, count]) => {
      const percentage = ((count / estimates.length) * 100).toFixed(1);
      console.log(`${range.padEnd(20)} ${count.toString().padStart(6)} perfumes (${percentage}%)`);
    });

    console.log('\n💡 RECOMMENDATIONS:');
    console.log('─'.repeat(70));
    
    if (totalCost < 20) {
      console.log('✅ Cost is very reasonable - process all perfumes in one go!');
    } else if (totalCost < 100) {
      console.log('✅ Cost is manageable - consider processing all at once.');
      console.log('💡 Alternative: Process in batches to spread cost over time.');
    } else {
      console.log('⚠️  High cost - consider these strategies:');
      console.log('   1.Process only perfumes with 10+ reviews first');
      console.log('   2.Batch processing over multiple weeks/months');
      console.log('   3.Use cheaper model (but lower quality)');
    }

    if (parallelDays > 7) {
      console.log('⚠️  Processing time is high - consider:');
      console.log('   1.Increase concurrent requests (10 → 20)');
      console.log('   2.Process in batches over time');
      console.log('   3.Filter to only most popular perfumes');
    }

    console.log('\n' + '='.repeat(70));
    console.log('📝 EXPORT OPTIONS:');
    console.log('─'.repeat(70));
    console.log('Run with --export flag to save detailed breakdown to CSV:');
    console.log('  node scripts/estimate-token-usage.mjs --export');
    console.log('='.repeat(70) + '\n');

    // Export to CSV if --export flag is provided
    if (process.argv.includes('--export')) {
      const fs = await import('fs');
      const csvPath = 'token-estimates.csv';
      
      const csvHeaders = 'Perfume ID,Perfume Name,Brand Name,Total Reviews,Valid Reviews,Reviews to Process,Input Tokens,Output Tokens,Total Tokens,Est.Cost\n';
      const csvRows = estimates.map(e => {
        const cost = ((e.totalTokens / 1_000_000) * ((PRICING.INPUT_PER_1M + PRICING.OUTPUT_PER_1M) / 2)).toFixed(4);
        return `"${e.perfumeId}","${e.perfumeName}","${e.brandName}",${e.totalReviews},${e.validReviews},${e.reviewsToProcess},${e.inputTokens},${e.outputTokens},${e.totalTokens},${cost}`;
      }).join('\n');

      fs.writeFileSync(csvPath, csvHeaders + csvRows);
      console.log(`✅ Detailed breakdown exported to: ${csvPath}\n`);
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error);
  } finally {
    await client.close();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run the script
estimateTokenUsage();