'use client';
import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { voteReview } from '@/app/actions/reviews';
import { useAuthModal } from '@/components/auth/AuthModal';

interface Props {
  reviewId: string;
  initialHelpfulCount: number;
  userVote?: 'UP' | 'DOWN' | null;
  isLoggedIn: boolean;
}

export default function ReviewActionButtons({ reviewId, initialHelpfulCount, userVote, isLoggedIn }: Props) {
  const [count, setCount] = useState(initialHelpfulCount);
  const [currentVote, setCurrentVote] = useState<'UP' | 'DOWN' | null>(userVote || null);
  const [loading, setLoading] = useState(false);
  const { open } = useAuthModal();

  const handleVote = async (type: 'UP' | 'DOWN') => {
    if (!isLoggedIn) {
      open({ mode: 'signin', reason: 'Sign in to vote' });
      return;
    }
    if (loading) return;

    // Optimistic UI Update
    const prevVote = currentVote;
    const prevCount = count;

    setLoading(true);

    if (currentVote === type) {
      // Toggle off
      setCurrentVote(null);
      if (type === 'UP') setCount(c => c - 1);
    } else {
      // Flip or Add
      setCurrentVote(type);
      if (type === 'UP') {
        setCount(c => c + 1); 
      } else if (prevVote === 'UP') {
        setCount(c => c - 1);
      }
    }

    const res = await voteReview(reviewId, type);
    
    if (res.error) {
      // Revert on error
      setCurrentVote(prevVote);
      setCount(prevCount);
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-3 mt-3">
      <button 
        onClick={() => handleVote('UP')}
        className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
          currentVote === 'UP' ? 'text-green-600' : 'text-gray-500 hover:text-green-600'
        }`}
      >
        <ThumbsUp className={`w-3.5 h-3.5 ${currentVote === 'UP' ? 'fill-current' : ''}`} />
        Helpful ({count})
      </button>

      <button 
        onClick={() => handleVote('DOWN')}
        className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
          currentVote === 'DOWN' ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
        }`}
      >
        <ThumbsDown className={`w-3.5 h-3.5 ${currentVote === 'DOWN' ? 'fill-current' : ''}`} />
      </button>
    </div>
  );
}