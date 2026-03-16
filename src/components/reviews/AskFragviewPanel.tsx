'use client';

import { useEffect, useRef } from 'react';
import { Sparkles, X, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

interface AskFragviewPanelProps {
  question: string;
  streamedText: string;
  isStreaming: boolean;
  isDone: boolean;
  error: string | null;
  onDismiss: () => void;
}

export default function AskFragviewPanel({
  question,
  streamedText,
  isStreaming,
  isDone,
  error,
  onDismiss,
}: AskFragviewPanelProps) {
  const bodyRef = useRef<HTMLDivElement>(null);

  // Auto-scroll as text streams in
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [streamedText]);

  return (
    <div className="rounded-xl border border-indigo-200 bg-white overflow-hidden shadow-sm mt-4">
      {/* Header */}
      <div className="flex items-center justify-between px-3 sm:px-5 py-3 bg-indigo-50 border-b border-indigo-100">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-inter font-semibold text-[14px] sm:text-[15px] text-indigo-700">
            FragView AI
          </span>
          {isStreaming && (
            <span className="text-[12px] sm:text-[13px] text-indigo-400 animate-pulse">
              thinking...
            </span>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="p-1 rounded-lg text-indigo-400 hover:text-indigo-600 hover:bg-indigo-100 transition-colors shrink-0 ml-2"
          aria-label="Dismiss AI panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Question */}
      <div className="px-3 sm:px-5 pt-4 pb-1">
        <p className="font-inter text-[12px] sm:text-[13px] text-[#737270]">
          <span className="font-medium text-[#4A4946]">Your question: </span>
          {question}
        </p>
      </div>

      {/* Answer body */}
      <div
        ref={bodyRef}
        className="px-3 sm:px-5 py-4 min-h-[72px] max-h-[220px] sm:max-h-[280px] overflow-y-auto"
      >
        {error ? (
          <div className="flex items-start gap-2 text-red-600">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p className="font-inter text-[14px] sm:text-[15px] leading-[22px] sm:leading-[24px]">{error}</p>
          </div>
        ) : streamedText ? (
          <div className="font-inter text-[14px] sm:text-[15px] leading-[24px] sm:leading-[26px] text-[#4A4946] whitespace-pre-wrap">
            {streamedText}
            {isStreaming && (
              <span className="inline-block w-0.5 h-[18px] bg-indigo-500 ml-0.5 animate-pulse align-middle" />
            )}
          </div>
        ) : (
          /* Loading dots while waiting for first chunk */
          <div className="flex items-center gap-1.5 pt-1">
            <div className="w-2 h-2 rounded-full bg-indigo-300 animate-bounce [animation-delay:0ms]" />
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:150ms]" />
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:300ms]" />
          </div>
        )}
      </div>

      {/* Footer — only shown when streaming is done */}
      {isDone && !error && (
        <div className="px-3 sm:px-5 py-3 border-t border-indigo-100 bg-indigo-50/50 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[12px] sm:text-[13px] text-indigo-500 min-w-0">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Saved as reply on your review</span>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-1.5 text-[12px] sm:text-[13px] font-medium text-indigo-600 hover:text-indigo-800 transition-colors shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            View full thread
          </button>
        </div>
      )}
    </div>
  );
}
