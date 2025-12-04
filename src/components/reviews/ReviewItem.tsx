'use client';

import React, { useState } from 'react';
import { Star, MessageCircle, ThumbsUp, Flag, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import EditReviewModal from './EditReviewModal';

interface Review {
  id: string;
  rating: number;
  text?: string | null;
  photos?: string[];
  createdAt: string;
  isEdited?: boolean;
  editedAt?: string | null;
  isDeleted?: boolean;
  user: {
    username: string;
    image?: string | null;
    experiencePoints: number;
    badges: string[];
  };
  replies?: Review[];
}

interface ReviewItemProps {
  review: Review;
  perfumeSlug: string;
  depth?: number;
  onReplySuccess: () => void;
  currentUserId?: string;
}

export default function ReviewItem({ 
  review, 
  perfumeSlug, 
  depth = 0,
  onReplySuccess,
  currentUserId 
}: ReviewItemProps) {
  const { data: session } = useSession();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwnReview = session?.user?.id === currentUserId;

  const getLevel = (xp: number) => {
    if (xp >= 1001) return 'Master';
    if (xp >= 501) return 'Expert';
    if (xp >= 201) return 'Connoisseur';
    if (xp >= 51) return 'Enthusiast';
    return 'Novice';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const handleDelete = async () => {
    if (! confirm('Are you sure you want to delete this review?  This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/reviews/actions?reviewId=${review.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        onReplySuccess(); // Refresh the reviews
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete review');
      }
    } catch (error) {
      alert('Network error.Please try again.');
    } finally {
      setIsDeleting(false);
      setShowMenu(false);
    }
  };

  // If deleted, show placeholder
  if (review.isDeleted) {
    return (
      <div 
        className={`p-4 bg-gray-50 rounded-lg border border-gray-200 ${depth > 0 ? 'ml-12' : ''}`}
        id={`review-${review.id}`}
      >
        <p className="text-gray-500 text-sm italic">
          [This review has been deleted by the user]
        </p>
      </div>
    );
  }

  return (
    <div className={depth > 0 ? 'ml-12' : ''} id={`review-${review.id}`}>
      <div className="p-4 bg-white rounded-lg border border-green-100 hover:border-green-200 transition-colors">
        {/* User Info */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <a 
              href={`/u/${review.user.username}`}
              className="shrink-0"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-orange-400 flex items-center justify-center text-white font-bold">
                {review.user.image ? (
                  <img 
                    src={review.user.image} 
                    alt={review.user.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  review.user.username.charAt(0).toUpperCase()
                )}
              </div>
            </a>

            {/* User Details */}
            <div>
              <a 
                href={`/u/${review.user.username}`}
                className="font-semibold text-gray-900 hover:text-green-600"
              >
                @{review.user.username}
              </a>
              
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                  {getLevel(review.user.experiencePoints)}
                </span>
                
                {review.user.badges.map((badge) => (
                  <span 
                    key={badge}
                    className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full"
                    title={badge}
                  >
                    {badge === 'Early Adopter' && '🌟'}
                    {badge === 'Active Reviewer' && '📝'}
                    {badge === 'Photo Contributor' && '📸'}
                    {badge === 'Community Helper' && '🤝'}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Rating, Date & Menu */}
          <div className="text-right flex items-start gap-2">
            <div>
              {review.rating > 0 && (
                <div className="flex items-center gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < review.rating
                          ? 'fill-orange-400 text-orange-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500">
                {formatDate(review.createdAt)}
                {review.isEdited && review.editedAt && (
                  <span className="ml-1 text-gray-400" title={`Edited on ${new Date(review.editedAt).toLocaleString()}`}>
                    (edited)
                  </span>
                )}
              </p>
            </div>

            {/* Menu for own reviews */}
            {isOwnReview && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <MoreVertical className="w-4 h-4 text-gray-600" />
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                    <button
                      onClick={() => {
                        setShowEditModal(true);
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Review Text */}
        {review.text && (
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line mb-3">
            {review.text}
          </p>
        )}

        {/* Review Photos */}
        {review.photos && review.photos.length > 0 && (
          <div className="flex gap-2 mb-3 flex-wrap">
            {review.photos.map((photo, idx) => (
              <img
                key={idx}
                src={photo}
                alt={`Review photo ${idx + 1}`}
                className="w-20 h-20 object-cover rounded-lg border border-gray-200 hover:scale-105 transition-transform cursor-pointer"
              />
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-4 pt-3 border-t border-green-50">
          
          <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-green-600 transition-colors">
            <ThumbsUp className="w-4 h-4" />
            Helpful
          </button>

          <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 transition-colors ml-auto">
            <Flag className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && review.text && (
        <EditReviewModal
          reviewId={review.id}
          currentText={review.text}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            onReplySuccess();
          }}
        />
      )}
    </div>
  );
}