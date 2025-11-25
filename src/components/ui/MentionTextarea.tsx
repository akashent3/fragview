'use client';
import React, { useState, useRef, useEffect } from 'react';
import { searchUsersForMention, UserSearchResult } from '@/app/actions/user-search';
import { Loader2 } from 'lucide-react';

interface Props {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export default function MentionTextarea({ value, onChange, placeholder, className, minHeight = '100px' }: Props) {
  const [suggestions, setSuggestions] = useState<UserSearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const newPos = e.target.selectionStart;
    
    onChange(newValue);
    setCursorPosition(newPos);

    // Check for @ mention
    const textBeforeCursor = newValue.slice(0, newPos);
    const words = textBeforeCursor.split(/\s/);
    const currentWord = words[words.length - 1];

    if (currentWord.startsWith('@') && currentWord.length > 1) {
      const query = currentWord.slice(1);
      fetchSuggestions(query);
    } else {
      setShowSuggestions(false);
    }
  };

  const fetchSuggestions = async (query: string) => {
    setLoading(true);
    const results = await searchUsersForMention(query);
    setSuggestions(results);
    setLoading(false);
    setShowSuggestions(results.length > 0);
  };

  const insertMention = (username: string) => {
    const textBeforeCursor = value.slice(0, cursorPosition);
    const textAfterCursor = value.slice(cursorPosition);
    
    const words = textBeforeCursor.split(/\s/);
    // Remove the partial @mention
    words.pop(); 
    
    const newTextBefore = words.join(' ') + (words.length > 0 ? ' ' : '') + `@${username} `;
    const newValue = newTextBefore + textAfterCursor;
    
    onChange(newValue);
    setShowSuggestions(false);
    
    // Restore focus
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="relative w-full">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInput}
        placeholder={placeholder}
        className={className}
        style={{ minHeight }}
      />
      
      {showSuggestions && (
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
          {loading ? (
            <div className="p-3 text-center text-gray-400"><Loader2 className="w-4 h-4 animate-spin mx-auto" /></div>
          ) : (
            <ul className="max-h-48 overflow-y-auto">
              {suggestions.map(user => (
                <li key={user.id}>
                  <button
                    type="button"
                    onClick={() => insertMention(user.username)}
                    className="w-full text-left px-4 py-2 hover:bg-green-50 flex items-center gap-2 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
                      {user.image ? (
                        <img src={user.image} alt={user.username} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-500">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="text-sm text-gray-700 font-medium">@{user.username}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}