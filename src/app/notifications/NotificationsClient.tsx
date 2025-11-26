'use client';

import React, { useState } from 'react';
import { Bell, CheckCheck, Trash2, Loader2, Leaf, Flower2 } from 'lucide-react';
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
  initialNotifications: Notification[];
}

export default function NotificationsClient({ initialNotifications }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [marking, setMarking] = useState(false);
  const [clearing, setClearing] = useState(false);

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n. read)
    : notifications;

  const unreadCount = notifications. filter(n => ! n.read).length;

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      });
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } catch (error) {
      console. error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    setMarking(true);
    try {
      await fetch('/api/notifications/read-all', { method: 'POST' });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console. error('Failed to mark all as read:', error);
    } finally {
      setMarking(false);
    }
  };

  const clearAll = async () => {
    if (! confirm('Are you sure you want to delete all notifications?  This cannot be undone.')) return;
    
    setClearing(true);
    try {
      await fetch('/api/notifications/clear', { method: 'DELETE' });
      setNotifications([]);
    } catch (error) {
      console. error('Failed to clear notifications:', error);
    } finally {
      setClearing(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'NEW_FOLLOWER': return '👤';
      case 'REVIEW_HELPFUL': return '👍';
      case 'REVIEW_LIKE': return '❤️';
      case 'REVIEW_REPLY': return '💬';
      case 'THREAD_ACTIVITY': return '🔔';
      case 'SUBMISSION_APPROVED': return '✅';
      case 'SUBMISSION_REJECTED': return '❌';
      case 'SYSTEM_ANNOUNCEMENT': return '📢';
      default: return '🔔';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math. floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'NEW_FOLLOWER': return 'Follower';
      case 'REVIEW_HELPFUL': return 'Helpful Vote';
      case 'REVIEW_LIKE': return 'Like';
      case 'REVIEW_REPLY': return 'Reply';
      case 'THREAD_ACTIVITY': return 'Thread';
      case 'SUBMISSION_APPROVED': return 'Approved';
      case 'SUBMISSION_REJECTED': return 'Rejected';
      case 'SYSTEM_ANNOUNCEMENT': return 'System';
      default: return 'Notification';
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFFF5] py-8 px-4">
      {/* Floating Botanical Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-32 right-20 animate-float">
          <Leaf size={20} className="text-green-300/20" />
        </div>
        <div className="absolute bottom-40 left-32 animate-float animate-delay-3">
          <Flower2 size={18} className="text-orange-300/20" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-orange-400 rounded-xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-orange-500 bg-clip-text text-transparent">
                  Notifications
                </h1>
                <p className="text-sm text-gray-600">
                  {unreadCount > 0 ?  `${unreadCount} unread` : 'All caught up! '}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={markAllAsRead}
                disabled={marking || unreadCount === 0}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {marking ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCheck className="w-4 h-4" />}
                Mark all read
              </button>
              <button
                onClick={clearAll}
                disabled={clearing || notifications.length === 0}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {clearing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Clear all
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-green-500 to-orange-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === 'unread'
                  ? 'bg-gradient-to-r from-green-500 to-orange-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="glass-card rounded-2xl overflow-hidden">
          {filteredNotifications.length === 0 ? (
            <div className="py-16 text-center">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </h3>
              <p className="text-gray-500 text-sm">
                {filter === 'unread' 
                  ? 'You\'re all caught up!' 
                  : 'When you get notifications, they\'ll show up here. '}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-green-50">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-green-50/50 transition-colors cursor-pointer flex items-start gap-4 ${
                    ! notification.read ? 'bg-green-50/30' : ''
                  }`}
                  onClick={() => {
                    if (! notification.read) markAsRead(notification. id);
                    if (notification.link) {
                      window. location.href = notification.link;
                    }
                  }}
                >
                  {/* Icon */}
                  <span className="text-2xl shrink-0">
                    {getNotificationIcon(notification.type)}
                  </span>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        notification. type === 'SUBMISSION_APPROVED' ?  'bg-green-100 text-green-700' :
                        notification.type === 'SUBMISSION_REJECTED' ? 'bg-red-100 text-red-700' :
                        notification.type === 'SYSTEM_ANNOUNCEMENT' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {getTypeLabel(notification. type)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatTime(notification.createdAt)}
                      </span>
                    </div>
                    <p className={`text-sm leading-relaxed ${
                      ! notification.read ? 'font-medium text-gray-900' : 'text-gray-700'
                    }`}>
                      {notification.message}
                    </p>
                    {notification.link && (
                      <p className="text-xs text-green-600 mt-1 hover:underline">
                        View details →
                      </p>
                    )}
                  </div>

                  {/* Unread Indicator */}
                  {!notification. read && (
                    <span className="w-3 h-3 bg-green-500 rounded-full shrink-0 mt-1" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}