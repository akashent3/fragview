"use client";
import { useState } from "react";
import { api } from "@/lib/api";

export default function SmellsLikeVoteCard({ slug, candidateSlug }: { slug: string; candidateSlug: string; }) {
  const [voted, setVoted] = useState<null | boolean>(null);

  const vote = async (yes: boolean) => {
    await api.voteSmellsLike(slug, candidateSlug, yes);
    setVoted(yes);
  };

  return (
    <div className="rounded-xl border p-4">
      <div className="mb-2 text-lg font-semibold">Does this smell like <span className="underline">{candidateSlug}</span>?</div>
      <div className="flex gap-2">
        <button onClick={() => vote(true)} className="rounded-md bg-primary px-3 py-1 text-white">Yes</button>
        <button onClick={() => vote(false)} className="rounded-md border px-3 py-1">No</button>
      </div>
      {voted !== null && (
        <div className="mt-2 text-sm text-muted-foreground">Thanks for your vote!</div>
      )}
    </div>
  );
}