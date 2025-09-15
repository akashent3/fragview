'use client';
import React from 'react';
import { MessageSquare, TrendingUp, Star, Users, ThumbsUp, BarChart3 } from 'lucide-react';

interface ReviewsSummaryProps {
  summary: {
    totalReviews: number;
    averageRating: number;
    sentiment: 'positive' | 'mixed' | 'negative';
    keyPoints: string[];
    commonWords: Array<{ word: string; frequency: number }>;
    ratingDistribution: { [key: number]: number };
    aiSummary: string;
  };
}

const ReviewsSummary: React.FC<ReviewsSummaryProps> = ({ summary }) => {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800';
      case 'mixed':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800';
      case 'negative':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30 border-gray-200 dark:border-gray-800';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center transition-colors duration-300">
          <MessageSquare className="w-6 h-6 mr-3 text-primary-600 dark:text-primary-400" />
          Reviews Summary
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">AI Generated</span>
        </h3>
        
        <div className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors duration-300 ${getSentimentColor(summary.sentiment)}`}>
          {summary.sentiment.charAt(0).toUpperCase() + summary.sentiment.slice(1)} Sentiment
        </div>
      </div>

      {/* AI Summary Text */}
      <div className="bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-xl p-4 mb-6 border border-primary-100 dark:border-primary-800 transition-colors duration-300">
        <div className="flex items-start">
          <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-purple-500 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">AI Analysis</h4>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm transition-colors duration-300">
              {summary.aiSummary}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-3 text-center border border-blue-200 dark:border-blue-800 transition-colors duration-300">
          <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{summary.totalReviews}</div>
          <div className="text-xs text-blue-700 dark:text-blue-300">Reviews</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg p-3 text-center border border-yellow-200 dark:border-yellow-800 transition-colors duration-300">
          <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mx-auto mb-2 fill-current" />
          <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{summary.averageRating}</div>
          <div className="text-xs text-yellow-700 dark:text-yellow-300">Average</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-3 text-center border border-green-200 dark:border-green-800 transition-colors duration-300">
          <ThumbsUp className="w-5 h-5 text-green-600 dark:text-green-400 mx-auto mb-2" />
          <div className="text-xl font-bold text-green-600 dark:text-green-400">87%</div>
          <div className="text-xs text-green-700 dark:text-green-300">Positive</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-3 text-center border border-purple-200 dark:border-purple-800 transition-colors duration-300">
          <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
          <div className="text-xl font-bold text-purple-600 dark:text-purple-400">↑12%</div>
          <div className="text-xs text-purple-700 dark:text-purple-300">Trending</div>
        </div>

      </div>

      {/* Key Points and Common Words */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Key Points */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center transition-colors duration-300">
            <span className="w-2 h-2 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full mr-2"></span>
            Key Points
          </h4>
          <ul className="space-y-2">
            {summary.keyPoints.map((point, index) => (
              <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start transition-colors duration-300">
                <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        {/* Common Words */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center transition-colors duration-300">
            <span className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-2"></span>
            Common Descriptors
          </h4>
          <div className="flex flex-wrap gap-2">
            {summary.commonWords.map((item, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors cursor-default"
              >
                {item.word} ({item.frequency})
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* Rating Distribution Bar */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 transition-colors duration-300">Rating Distribution</h4>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map(rating => {
            const count = summary.ratingDistribution[rating] || 0;
            const percentage = (count / summary.totalReviews) * 100;
            
            return (
              <div key={rating} className="flex items-center text-sm">
                <span className="w-8 text-gray-600 dark:text-gray-400">{rating}★</span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mx-3">
                  <div 
                    className="bg-gradient-to-r from-primary-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="w-12 text-gray-600 dark:text-gray-400 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ReviewsSummary;