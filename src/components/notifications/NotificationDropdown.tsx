'use client';

import { useState, useEffect } from 'react';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Notification {
  id: string;
  type: string;
  message: string;
  link?: string | null;
  read: boolean;
  createdAt: string;
}

interface Props {
  onClose: () => void;
  onCountChange: (count: number) => void;
}

export default function NotificationDropdown({ onClose, onCountChange }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setNotifications(data. notifications?. slice(0, 10) || []);
      onCountChange(data.unreadCount || 0);
    } catch (error) {
      console. error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      });
      
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ?  { ...n, read: true } : n))
      );
      
      const unreadCount = notifications.filter(n => !n.read && n.id !== notificationId).length;
      onCountChange(unreadCount);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    setMarking(true);
    try {
      await fetch('/api/notifications/read-all', { method: 'POST' });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      onCountChange(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    } finally {
      setMarking(false);
    }
  };

  const getIcon = (type: string) => {
    const icons: Record<string, string> = {
      NEW_FOLLOWER: '👤',
      REVIEW_HELPFUL: '👍',
      REVIEW_LIKE: '❤️',
      REVIEW_REPLY: '💬',
      THREAD_ACTIVITY: '🔔',
      SUBMISSION_APPROVED: '✅',
      SUBMISSION_REJECTED: '❌',
      SYSTEM_ANNOUNCEMENT: '📢',
    };
    return icons[type] || '🔔';
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-orange-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-green-600" />
            <h3 className="font-bold text-gray-900">Notifications</h3>
          </div>
          <button
            onClick={markAllAsRead}
            disabled={marking || notifications.every(n => n.read)}
            className="text-xs font-medium text-green-600 hover:text-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            {marking ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <CheckCheck className="w-3 h-3" />
            )}
            Mark all read
          </button>
        </div>
      </div>

      {/* Notification List */}
      <div className="max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="py-10 text-center">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-500">Loading... </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-10 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No notifications yet</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                ! notif.read ? 'bg-green-50/30' : ''
              }`}
              onClick={() => {
                if (! notif.read) markAsRead(notif.id);
                if (notif.link) {
                  window.location.href = notif.link;
                  onClose();
                }
              }}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl shrink-0">{getIcon(notif.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-relaxed ${! notif.read ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                    {notif.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{formatTime(notif.createdAt)}</p>
                </div>
                {! notif.read && (
                  <span className="w-2 h-2 bg-green-500 rounded-full shrink-0 mt-1" />
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <Link
          href="/notifications"
          onClick={onClose}
          className="block text-center text-sm font-medium text-green-600 hover:text-green-700"
        >
          View all notifications
        </Link>
      </div>
    </div>
  );
}