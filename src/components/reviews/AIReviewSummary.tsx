'use client';

import { motion } from 'framer-motion';
import { Sparkles, ThumbsUp, ThumbsDown, TrendingUp } from 'lucide-react';

interface ReviewsSummaryProps {
  summary: {
    overall_sentiment: 'positive' | 'mixed' | 'negative';
    summary_text: string;
    common_likes: string[];
    common_dislikes: string[];
  } | null;
  reviewCount: number;
  lastUpdated?: Date;
}

export default function ReviewsSummary({ 
  summary, 
  reviewCount, 
  lastUpdated 
}: ReviewsSummaryProps) {
  // Don't show if no summary or less than 5 reviews
  if (!summary || reviewCount < 5) {
    return null;
  }

  // Sentiment styling
  const sentimentStyles = {
    positive: {
      badge: 'bg-green-500/20 text-green-700 border-green-500/30',
      icon: '😊',
    },
    mixed: {
      badge: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
      icon: '😐',
    },
    negative: {
      badge: 'bg-red-500/20 text-red-700 border-red-500/30',
      icon: '😕',
    },
  };

  const style = sentimentStyles[summary.overall_sentiment];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl bg-white/40 backdrop-blur-xl border-2 border-white/40 p-8 mb-8 shadow-lg"
    >
      {/* Floating decoration elements (matching your theme) */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-pink-200/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      {/* Header */}
      <div className="relative flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              AI-Powered Review Summary
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Based on {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
              {lastUpdated && ` • Updated ${formatDate(lastUpdated)}`}
            </p>
          </div>
        </div>

        {/* Sentiment badge */}
        <div className={`px-4 py-2 rounded-full ${style.badge} border font-semibold text-sm capitalize flex items-center gap-2`}>
          <span className="text-xl">{style.icon}</span>
          {summary.overall_sentiment}
        </div>
      </div>

      {/* Summary text */}
      <div className="relative bg-white/60 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/60 shadow-sm">
        <p className="text-gray-800 leading-relaxed text-lg">
          {summary.summary_text}
        </p>
      </div>

      {/* Likes and Dislikes (side by side) */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* What People Love */}
        {summary.common_likes && summary.common_likes.length > 0 && (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/60 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <ThumbsUp className="w-5 h-5 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-800">What People Love</h4>
            </div>
            <ul className="space-y-3">
              {summary.common_likes.map((like, idx) => (
                <li key={idx} className="flex items-start gap-3 text-gray-700">
                  <span className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                  <span className="leading-relaxed">{like}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Common Concerns */}
        {summary.common_dislikes && summary.common_dislikes.length > 0 && (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/60 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <ThumbsDown className="w-5 h-5 text-red-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-800">Common Concerns</h4>
            </div>
            <ul className="space-y-3">
              {summary.common_dislikes.map((dislike, idx) => (
                <li key={idx} className="flex items-start gap-3 text-gray-700">
                  <span className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                  <span className="leading-relaxed">{dislike}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* AI disclaimer */}
      <div className="mt-6 flex items-center gap-2 text-xs text-gray-500">
        <TrendingUp className="w-4 h-4" />
        <span>AI-generated summary based on user reviews • May not reflect all opinions</span>
      </div>
    </motion.div>
  );
}

function formatDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffDays = Math. floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}