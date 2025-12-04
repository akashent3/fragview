'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Ban, User } from 'lucide-react';
import Link from 'next/link';

interface FlaggedReview {
  id: string;
  userId: string;
  perfumeId: string;
  rating: number;
  text: string;
  flaggedCount: number;
  createdAt: string;
  user: {
    id: string;
    username: string;
    email: string;
    image?: string | null;
    role: string;
  };
}

export default function ModerationQueueClient() {
  const [reviews, setReviews] = useState<FlaggedReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  useEffect(() => {
    fetchFlaggedReviews();
  }, []);

  const fetchFlaggedReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/moderation');
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error('Error fetching flagged reviews:', error);
      alert('Failed to load flagged reviews');
    }
    setLoading(false);
  };

  const handleApprove = async (reviewId: string) => {
    if (!confirm('Are you sure you want to approve this review and remove all flags?')) return;

    setActioningId(reviewId);
    try {
      const res = await fetch('/api/admin/moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId })
      });

      if (res.ok) {
        alert('Review approved! ');
        fetchFlaggedReviews();
      } else {
        alert('Failed to approve review');
      }
    } catch (error) {
      console.error('Error approving review:', error);
      alert('Error approving review');
    } finally {
      setActioningId(null);
    }
  };

  const handleRemove = async (reviewId: string) => {
    if (!confirm('Are you sure you want to REMOVE this review?  This will soft-delete it.')) return;

    setActioningId(reviewId);
    try {
      const res = await fetch(`/api/admin/moderation? reviewId=${reviewId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        alert('Review removed! ');
        fetchFlaggedReviews();
      } else {
        alert('Failed to remove review');
      }
    } catch (error) {
      console.error('Error removing review:', error);
      alert('Error removing review');
    } finally {
      setActioningId(null);
    }
  };

  const handleBanUser = async (userId: string, username: string) => {
    const reason = prompt(
      `⚠️ WARNING: This will permanently BAN user "${username}" and remove ALL their content.\n\nEnter reason for ban:`
    );
    
    if (!reason) return;

    if (!confirm(`FINAL CONFIRMATION: Ban user "${username}" permanently?`)) return;

    setActioningId(userId);
    try {
      const res = await fetch('/api/admin/moderation/ban-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, reason })
      });

      if (res.ok) {
        alert(`User "${username}" has been banned successfully. `);
        fetchFlaggedReviews();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to ban user');
      }
    } catch (error) {
      console.error('Error banning user:', error);
      alert('Error banning user');
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="space-y-6">
      {loading ?  (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          <p className="ml-4 text-gray-600">Loading flagged reviews... </p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">All Clear!</h3>
          <p className="text-gray-600">
            There are no flagged reviews to moderate at this time.
          </p>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {reviews.length} Flagged Review{reviews.length !== 1 ? 's' : ''}
                </h3>
                <p className="text-sm text-gray-600">Pending moderation review</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          {/* Review Cards */}
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                {/* Header: User Info & Flag Count */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {/* User Avatar */}
                    <Link href={`/u/${review.user.username}`}>
                      {review.user.image ? (
                        <img
                          src={review.user.image}
                          alt={review.user.username}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                          <span className="text-xl font-bold text-white">
                            {review.user.username[0].toUpperCase()}
                          </span>
                        </div>
                      )}
                    </Link>

                    {/* User Details */}
                    <div>
                      <Link 
                        href={`/u/${review.user.username}`}
                        className="font-semibold text-gray-900 hover:text-blue-600"
                      >
                        @{review.user.username}
                      </Link>
                      <p className="text-sm text-gray-600">{review.user.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Posted {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Flag Badge */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                      <AlertTriangle className="w-4 h-4" />
                      {review.flaggedCount} Report{review.flaggedCount !== 1 ? 's' : ''}
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      review.user.role === 'ADMIN' ?  'bg-purple-100 text-purple-700' :
                      review.user.role === 'MODERATOR' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {review.user.role}
                    </span>
                  </div>
                </div>

                {/* Review Content */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-700">Rating:</span>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className={`text-lg ${
                            i < review.rating ? 'text-yellow-500' : 'text-gray-300'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Review Text */}
                  <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                    {review.text}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => handleApprove(review.id)}
                    disabled={actioningId === review.id}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {actioningId === review.id ?  'Processing...' : 'Approve (Remove Flag)'}
                  </button>

                  <button
                    onClick={() => handleRemove(review.id)}
                    disabled={actioningId === review.id}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    <XCircle className="w-4 h-4" />
                    {actioningId === review.id ?  'Processing...' : 'Remove Review'}
                  </button>

                  <div className="h-6 w-px bg-gray-300"></div>

                  <button
                    onClick={() => handleBanUser(review.user.id, review.user.username)}
                    disabled={actioningId === review.user.id || review.user.role === 'ADMIN'}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    title={review.user.role === 'ADMIN' ? 'Cannot ban admin users' : 'Permanently ban this user'}
                  >
                    <Ban className="w-4 h-4" />
                    {actioningId === review.user.id ?  'Banning...' : 'Ban User'}
                  </button>

                  <Link
                    href={`/u/${review.user.username}`}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium ml-auto"
                  >
                    <User className="w-4 h-4" />
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}