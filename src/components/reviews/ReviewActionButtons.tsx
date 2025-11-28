'use client';

import React, { useState, useTransition } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { voteReview } from '@/app/actions/reviews';
import { useAuthModal } from '@/components/auth/AuthModal';

interface Props {
  reviewId: string;
  initialHelpfulCount: number;
  userVote?: 'UP' | 'DOWN' | null;
  isLoggedIn: boolean;
}

export default function ReviewActionButtons({ 
  reviewId, 
  initialHelpfulCount, 
  userVote: initialUserVote,
  isLoggedIn 
}: Props) {
  const { open } = useAuthModal();
  const [helpfulCount, setHelpfulCount] = useState(initialHelpfulCount);
  const [userVote, setUserVote] = useState<'UP' | 'DOWN' | null>(initialUserVote || null);
  const [isPending, startTransition] = useTransition();

  const handleVote = (type: 'UP' | 'DOWN') => {
    if (!isLoggedIn) {
      open({ mode: 'signin', reason: 'Sign in to vote on reviews' });
      return;
    }

    startTransition(async () => {
      const prevVote = userVote;
      const prevCount = helpfulCount;

      // Optimistic update
      if (prevVote === type) {
        setUserVote(null);
        setHelpfulCount(prev => type === 'UP' ? prev - 1 : prev);
      } else {
        setUserVote(type);
        if (prevVote === 'UP' && type === 'DOWN') {
          setHelpfulCount(prev => prev - 1);
        } else if (prevVote === null && type === 'UP') {
          setHelpfulCount(prev => prev + 1);
        }
      }

      const result = await voteReview(reviewId, type);

      if (result.error) {
        // Revert on error
        setUserVote(prevVote);
        setHelpfulCount(prevCount);
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleVote('UP')}
        disabled={isPending}
        className={`flex items-center gap-1. 5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          userVote === 'UP'
            ? 'bg-green-100 text-green-700 border border-green-300'
            : 'text-gray-600 hover:bg-green-50 hover:text-green-600 border border-transparent'
        }`}
      >
        <ThumbsUp className="w-4 h-4" />
        <span>Helpful ({helpfulCount})</span>
      </button>

      <button
        onClick={() => handleVote('DOWN')}
        disabled={isPending}
        className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-sm font-medium transition-colors ${
          userVote === 'DOWN'
            ? 'bg-red-100 text-red-700 border border-red-300'
            : 'text-gray-600 hover:bg-red-50 hover:text-red-600 border border-transparent'
        }`}
      >
        <ThumbsDown className="w-4 h-4" />
      </button>
    </div>
  );
}