'use client';
import React, { useState, useRef, useEffect } from 'react';
import { searchUsersForMention, UserSearchResult } from '@/app/actions/user-search';
import { searchPerfumesForMention, PerfumeSearchResult } from '@/app/actions/perfume-search';
import { Loader2 } from 'lucide-react';

interface Props {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
  name?: string;
}

type MentionResult =
  | { type: 'user'; data: UserSearchResult }
  | { type: 'perfume'; data: PerfumeSearchResult };

export default function MentionTextarea({ value, onChange, placeholder, className, minHeight = '100px', name }: Props) {
  const [suggestions, setSuggestions] = useState<MentionResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [loading, setLoading] = useState(false);
  const [mentionType, setMentionType] = useState<'user' | 'perfume' | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ✅ FIXED: Better mention detection that allows spaces
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const newPos = e.target.selectionStart;
    
    onChange(newValue);
    setCursorPosition(newPos);

    const textBeforeCursor = newValue.slice(0, newPos);
    
    // Find the last @ or #
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    const lastHashIndex = textBeforeCursor.lastIndexOf('#');
    
    let mentionStartIndex = -1;
    let currentMentionType: 'user' | 'perfume' | null = null;
    
    if (lastAtIndex > lastHashIndex && lastAtIndex !== -1) {
      mentionStartIndex = lastAtIndex;
      currentMentionType = 'user';
    } else if (lastHashIndex > lastAtIndex && lastHashIndex !== -1) {
      mentionStartIndex = lastHashIndex;
      currentMentionType = 'perfume';
    }
    
    if (mentionStartIndex === -1 || currentMentionType === null) {
      setShowSuggestions(false);
      setMentionType(null);
      return;
    }
    
    // Check if there's a space or newline BEFORE the trigger
    if (mentionStartIndex > 0) {
      const charBefore = textBeforeCursor[mentionStartIndex - 1];
      if (charBefore !== ' ' && charBefore !== '\n') {
        setShowSuggestions(false);
        setMentionType(null);
        return;
      }
    }
    
    // ✅ Get everything after trigger (allows spaces!)
    const query = textBeforeCursor.slice(mentionStartIndex + 1);
    
    // Stop only on newline (not space)
    if (query.includes('\n')) {
      setShowSuggestions(false);
      setMentionType(null);
      return;
    }
    
    if (query.length < 1) {
      setShowSuggestions(false);
      setMentionType(null);
      return;
    }
    
    setMentionType(currentMentionType);
    if (currentMentionType === 'user') {
      fetchUserSuggestions(query);
    } else {
      fetchPerfumeSuggestions(query);
    }
  };

  const fetchUserSuggestions = async (query: string) => {
    setLoading(true);
    const results = await searchUsersForMention(query);
    setSuggestions(results.map(user => ({ type: 'user', data: user })));
    setLoading(false);
    setShowSuggestions(results.length > 0);
  };

  const fetchPerfumeSuggestions = async (query: string) => {
    setLoading(true);
    const results = await searchPerfumesForMention(query);
    setSuggestions(results.map(perfume => ({ type: 'perfume', data: perfume })));
    setLoading(false);
    setShowSuggestions(results.length > 0);
  };

  // ✅ FIXED: Better insertion that replaces from trigger position
  const insertMention = (result: MentionResult) => {
    const textBeforeCursor = value.slice(0, cursorPosition);
    const textAfterCursor = value.slice(cursorPosition);
    
    const triggerChar = result.type === 'user' ? '@' : '#';
    const lastTriggerIndex = textBeforeCursor.lastIndexOf(triggerChar);
    
    if (lastTriggerIndex === -1) return;
    
    let mentionText = '';
    
    if (result.type === 'user') {
      mentionText = `@${result.data.username} `;
    } else {
      mentionText = `#[${result.data.name}](${result.data.slug}) `;
    }
    
    const newTextBefore = textBeforeCursor.slice(0, lastTriggerIndex) + mentionText;
    const newValue = newTextBefore + textAfterCursor;
    
    onChange(newValue);
    setShowSuggestions(false);
    setSuggestions([]);
    setMentionType(null);
    
    if (textareaRef.current) {
      textareaRef.current.focus();
      const newCursorPos = newTextBefore.length;
      setTimeout(() => {
        textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  };

  return (
    <div className="relative w-full">
      <textarea
        ref={textareaRef}
        name={name}
        suppressHydrationWarning
        value={value}
        onChange={handleInput}
        placeholder={placeholder || "Share your experience...  Type @ for users, # for perfumes"}
        className={className}
        style={{ minHeight }}
      />
      
      {showSuggestions && (
        <div className="absolute bottom-full left-0 mb-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
          <div className="px-4 py-2 bg-gradient-to-r from-green-50 to-orange-50 border-b border-green-100">
            <p className="text-xs font-semibold text-gray-600">
              {mentionType === 'user' ? '👤 Mention User' : '✨ Mention Perfume'}
            </p>
          </div>

          {loading ?  (
            <div className="p-4 text-center text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            </div>
          ) : (
            <ul className="max-h-60 overflow-y-auto">
              {suggestions.map((result) => {
                if (result.type === 'user') {
                  const user = result.data;
                  return (
                    <li key={`user-${user.id}`}>
                      <button
                        type="button"
                        onClick={() => insertMention(result)}
                        className="w-full text-left px-4 py-3 hover:bg-green-50 flex items-center gap-3 transition-colors border-b border-gray-100 last:border-0"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 overflow-hidden flex-shrink-0">
                          {user.image ? (
                            <img src={user.image} alt={user.username} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-sm font-bold text-blue-600">
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            @{user.username}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user.experiencePoints} XP
                          </p>
                        </div>

                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium flex-shrink-0">
                          User
                        </span>
                      </button>
                    </li>
                  );
                } else {
                  const perfume = result.data;
                  return (
                    <li key={`perfume-${perfume.id}`}>
                      <button
                        type="button"
                        onClick={() => insertMention(result)}
                        className="w-full text-left px-4 py-3 hover:bg-green-50 flex items-center gap-3 transition-colors border-b border-gray-100 last:border-0"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 overflow-hidden flex-shrink-0">
                          {perfume.image ? (
                            <img src={perfume.image} alt={perfume.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg">
                              ✨
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {perfume.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {perfume.brand}
                          </p>
                        </div>

                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium flex-shrink-0">
                          Perfume
                        </span>
                      </button>
                    </li>
                  );
                }
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}