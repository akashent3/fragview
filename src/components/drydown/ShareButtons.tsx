'use client';
import React from 'react';
import { Share2 } from 'lucide-react';

export default function ShareButtons({ title }: { title: string }) {
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: window.location.href
        });
      } catch (err) {
        console.error('Share failed', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-bold text-gray-400 uppercase tracking-wider mr-2">Share</span>
      <button onClick={handleShare} className="p-2 rounded-full bg-gray-100 hover:bg-green-100 hover:text-green-600 transition-colors">
        <Share2 size={18} />
      </button>
    </div>
  );
}