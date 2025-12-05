'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useSession } from 'next-auth/react';
import NotificationDropdown from './NotificationDropdown';

export default function NotificationBell() {
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ✅ ONLY CHANGE: Optimized polling (60s instead of 30s, pauses when tab hidden)
  useEffect(() => {
    if (! session?.user) return;

    let pollInterval: NodeJS.Timeout;

    const fetchCount = async () => {
      // ✅ OPTIMIZATION: Only fetch if tab is visible
      if (document.hidden) return;
      
      try {
        const res = await fetch('/api/notifications/count');
        const data = await res.json();
        setUnreadCount(data.count || 0);
      } catch (error) {
        console.error('Failed to fetch notification count:', error);
      }
    };

    fetchCount();
    // ✅ OPTIMIZATION: Changed from 30000 to 60000 (60 seconds instead of 30)
    pollInterval = setInterval(fetchCount, 60000);

    // ✅ OPTIMIZATION: Pause polling when tab is hidden
    const handleVisibilityChange = () => {
      if (! document.hidden) {
        // Tab became visible - fetch immediately
        fetchCount();
        clearInterval(pollInterval);
        pollInterval = setInterval(fetchCount, 60000);
      } else {
        // Tab hidden - stop polling to save resources
        clearInterval(pollInterval);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [session]);

  // 🆕 Close dropdown when clicking outside (YOUR ORIGINAL CODE - UNCHANGED)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  if (!session?.user) return null;

  // ✅ YOUR ORIGINAL UI - 100% UNCHANGED
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(! showDropdown)}
        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 z-50">
          <NotificationDropdown
            onClose={() => setShowDropdown(false)}
            onCountChange={setUnreadCount}
          />
        </div>
      )}
    </div>
  );
}