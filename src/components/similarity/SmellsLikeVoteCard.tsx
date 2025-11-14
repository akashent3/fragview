"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { ThumbsUp, ThumbsDown, Check } from 'lucide-react';

export default function SmellsLikeVoteCard({ slug, candidateSlug }: { slug: string; candidateSlug: string; }) {
  const [voted, setVoted] = useState<null | boolean>(null);

  const vote = async (yes: boolean) => {
    await api.voteSmellsLike(slug, candidateSlug, yes);
    setVoted(yes);
  };

  return (
    <div className="glass-card rounded-xl p-4 border border-green-200">
      <div className="mb-3 text-lg font-semibold text-gray-800">
        Does this smell like <span className="text-green-600">{candidateSlug}</span>?
      </div>
      <div className="flex gap-2">
        <button 
          onClick={() => vote(true)} 
          className="flex-1 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 text-white font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <ThumbsUp className="w-4 h-4" />
          Yes
        </button>
        <button 
          onClick={() => vote(false)} 
          className="flex-1 rounded-lg border-2 border-green-200 px-4 py-2 text-gray-700 font-medium hover:bg-green-50 transition-all flex items-center justify-center gap-2"
        >
          <ThumbsDown className="w-4 h-4" />
          No
        </button>
      </div>
      {voted !== null && (
        <div className="mt-3 text-sm text-green-600 flex items-center gap-2 bg-green-50 p-2 rounded-lg">
          <Check className="w-4 h-4" />
          Thanks for your vote!
        </div>
      )}
    </div>
  );
}