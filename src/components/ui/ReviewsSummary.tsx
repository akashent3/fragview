'use client';
import React from 'react';
import { MessageSquare, TrendingUp, Star, Users, ThumbsUp, BarChart3, Leaf } from 'lucide-react';

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
        return 'text-green-700 bg-green-100 border-green-200';
      case 'mixed':
        return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'negative':
        return 'text-red-700 bg-red-100 border-red-200';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  return (
    <div className="glass-card rounded-2xl shadow-sm p-6 relative overflow-hidden">
      {/* Decorative element */}
      <div className="absolute top-0 right-0 opacity-5">
        <Leaf size={100} style={{ transform: 'rotate(-30deg)' }} />
      </div>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center">
          <MessageSquare className="w-6 h-6 mr-3 text-green-600" />
          Reviews Summary
          <span className="ml-2 text-sm text-gray-500">AI Generated</span>
        </h3>
        
        <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getSentimentColor(summary.sentiment)}`}>
          {summary.sentiment.charAt(0).toUpperCase() + summary.sentiment.slice(1)} Sentiment
        </div>
      </div>

      {/* AI Summary Text - BOTANICAL THEME */}
      <div className="bg-gradient-to-br from-green-50 to-orange-50 rounded-xl p-4 mb-6 border border-green-200 relative z-10">
        <div className="flex items-start">
          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-orange-500 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">AI Analysis</h4>
            <p className="text-gray-700 leading-relaxed text-sm">
              {summary.aiSummary}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid - BOTANICAL COLORS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 relative z-10">
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 text-center border border-green-200">
          <Users className="w-5 h-5 text-green-600 mx-auto mb-2" />
          <div className="text-xl font-bold text-green-600">{summary.totalReviews}</div>
          <div className="text-xs text-green-700">Reviews</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 text-center border border-orange-200">
          <Star className="w-5 h-5 text-orange-600 mx-auto mb-2 fill-current" />
          <div className="text-xl font-bold text-orange-600">{summary.averageRating}</div>
          <div className="text-xs text-orange-700">Average</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg p-3 text-center border border-green-200">
          <ThumbsUp className="w-5 h-5 text-green-600 mx-auto mb-2" />
          <div className="text-xl font-bold text-green-600">87%</div>
          <div className="text-xs text-green-700">Positive</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-lg p-3 text-center border border-orange-200">
          <TrendingUp className="w-5 h-5 text-orange-600 mx-auto mb-2" />
          <div className="text-xl font-bold text-orange-600">↑12%</div>
          <div className="text-xs text-orange-700">Trending</div>
        </div>

      </div>

      {/* Key Points and Common Words */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        
        {/* Key Points */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
            <span className="w-2 h-2 bg-gradient-to-r from-green-500 to-orange-500 rounded-full mr-2"></span>
            Key Points
          </h4>
          <ul className="space-y-2">
            {summary.keyPoints.map((point, index) => (
              <li key={index} className="text-sm text-gray-700 flex items-start">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        {/* Common Words */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
            <span className="w-2 h-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full mr-2"></span>
            Common Descriptors
          </h4>
          <div className="flex flex-wrap gap-2">
            {summary.commonWords.map((item, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium hover:bg-green-200 transition-colors cursor-default"
              >
                {item.word} ({item.frequency})
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* Rating Distribution Bar - BOTANICAL COLORS */}
      <div className="mt-6 pt-6 border-t border-green-100 relative z-10">
        <h4 className="font-semibold text-gray-800 mb-3">Rating Distribution</h4>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map(rating => {
            const count = summary.ratingDistribution[rating] || 0;
            const percentage = (count / summary.totalReviews) * 100;
            
            return (
              <div key={rating} className="flex items-center text-sm">
                <span className="w-8 text-gray-600">{rating}★</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2 mx-3">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="w-12 text-gray-600 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ReviewsSummary;