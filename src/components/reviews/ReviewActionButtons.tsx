'use client';

import React, { useState, useTransition } from 'react';
import { ThumbsUp, ThumbsDown, Flag } from 'lucide-react';
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
  
  // Report functionality
  const [isFlagging, setIsFlagging] = useState(false);
  const [hasFlagged, setHasFlagged] = useState(false);

  const handleVote = (type: 'UP' | 'DOWN') => {
    if (! isLoggedIn) {
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

  const handleFlag = async () => {
    if (!isLoggedIn) {
      open({ mode: 'signin', reason: 'Sign in to report reviews' });
      return;
    }

    if (hasFlagged) {
      alert('You have already reported this review');
      return;
    }

    if (! confirm('Are you sure you want to report this review as inappropriate?  Our moderation team will review it.')) {
      return;
    }

    setIsFlagging(true);
    try {
      const res = await fetch('/api/reviews/flag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId })
      });

      if (res.ok) {
        setHasFlagged(true);
        alert('Review has been reported to moderators. Thank you for helping keep our community safe.');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to report review');
      }
    } catch (error) {
      alert('Network error.Please try again.');
    } finally {
      setIsFlagging(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleVote('UP')}
        disabled={isPending}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
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

      {/* Report Button */}
      <button
        onClick={handleFlag}
        disabled={isFlagging || hasFlagged}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ml-auto ${
          hasFlagged
            ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
            : 'text-gray-600 hover:bg-red-50 hover:text-red-600 border border-transparent'
        }`}
        title={hasFlagged ? 'Already reported' : 'Report inappropriate content'}
      >
        <Flag className="w-4 h-4" />
        <span>{isFlagging ? 'Reporting...' : hasFlagged ? 'Reported' : 'Report'}</span>
      </button>
    </div>
  );
}