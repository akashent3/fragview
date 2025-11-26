'use client';
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Award, Star, ShoppingBag, MessageSquare, Users, UserPlus, UserMinus, Lock, Leaf, Flower2, Package } from 'lucide-react';
import { useAuthModal } from '@/components/auth/AuthModal';

interface ProfileData {
  user: {
    id: string;
    username: string;
    image: string | null;
    bio: string | null;
    location: string | null;
    joinDate: Date;
    badges: string[];
  };
  stats: {
    reviews: number;
    wardrobe: number;
    helpful: number;
    followers: number;
    following: number;
  };
  gamification: {
    xp: number;
    level: string;
    nextLevelXP: number;
    progress: number;
  };
  privacy: {
    isWardrobePublic: boolean;
    isActivityPublic: boolean;
    isOwnProfile: boolean;
  };
  isFollowing: boolean;
  recentActivity: any[];
  signatureScents: any[];
  fullWardrobe: any[];
  wardrobeStats: {
    currentlyUsing: number;
    wishlist: number;
    inCollection: number;
    total: number;
  };
}

interface Props {
  profileData: ProfileData;
  isSignedIn: boolean;
}

export default function PublicProfileClient({ profileData, isSignedIn }: Props) {
  const [isFollowing, setIsFollowing] = useState(profileData.isFollowing);
  const [followerCount, setFollowerCount] = useState(profileData.stats. followers);
  const [loading, setLoading] = useState(false);
  const { open } = useAuthModal();

  const { user, stats, gamification, privacy, recentActivity, signatureScents, fullWardrobe, wardrobeStats } = profileData;

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const formatActivityDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const joinDateFormatted = useMemo(() => formatDate(user.joinDate), [user.joinDate]);

  const handleFollowToggle = async () => {
    if (! isSignedIn) {
      open({ mode: 'signin', reason: `Sign in to follow @${user.username}` });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: user.id })
      });

      const result = await response.json();
      
      if (result.success) {
        setIsFollowing(result.isFollowing);
        setFollowerCount(prev => result.isFollowing ? prev + 1 : prev - 1);
      }
    } catch (error) {
      console.error('Follow error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 relative">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-32 right-20 animate-float">
          <Leaf size={20} className="text-green-300/20" />
        </div>
        <div className="absolute bottom-40 left-32 animate-float animate-delay-3">
          <Flower2 size={18} className="text-orange-300/20" />
        </div>
      </div>

      <div className="glass-card rounded-2xl shadow-sm p-8 mb-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row gap-6 items-start relative z-10">
          <div className="shrink-0">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-200 rounded-full overflow-hidden ring-4 ring-white shadow-lg">
              {user.image ?  (
                <img src={user.image} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400">
                  {user.username.charAt(0). toUpperCase()}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">@{user.username}</h1>
                {user.bio && (
                  <p className="text-gray-600 max-w-2xl">{user.bio}</p>
                )}
              </div>
              
              {! privacy.isOwnProfile && (
                <button
                  onClick={handleFollowToggle}
                  disabled={loading}
                  className={`flex items-center gap-2 px-6 py-2. 5 rounded-lg font-semibold transition-all ${
                    isFollowing
                      ?  'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-gradient-to-r from-green-500 to-orange-500 text-white hover:shadow-lg'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserMinus className="w-4 h-4" />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Follow
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
              {user.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {user.location}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Joined {joinDateFormatted}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                gamification.level === 'Master' ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white' :
                gamification.level === 'Expert' ? 'bg-gradient-to-r from-purple-400 to-pink-500 text-white' :
                gamification.level === 'Connoisseur' ? 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white' :
                gamification.level === 'Enthusiast' ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' :
                'bg-gray-200 text-gray-700'
              }`}>
                <Award className="w-3 h-3 inline mr-1" />
                {gamification.level}
              </span>

              <span className="text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                {gamification.xp} XP
              </span>

              {user.badges.map((badge, idx) => (
                <span 
                  key={idx} 
                  className="text-xs font-medium px-3 py-1 rounded-full bg-gradient-to-r from-green-100 to-orange-100 text-gray-700 border border-green-200"
                >
                  {badge === 'Early Adopter' && '🌱 '}
                  {badge === 'Active Reviewer' && '⭐ '}
                  {badge === 'Photo Contributor' && '📸 '}
                  {badge === 'Community Helper' && '🤝 '}
                  {badge}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <span className="font-bold text-gray-900">{stats.reviews}</span>
                <span className="text-gray-600 ml-1">Reviews</span>
              </div>
              <div>
                <span className="font-bold text-gray-900">{stats.wardrobe}</span>
                <span className="text-gray-600 ml-1">Wardrobe</span>
              </div>
              <div>
                <span className="font-bold text-gray-900">{followerCount}</span>
                <span className="text-gray-600 ml-1">Followers</span>
              </div>
              <div>
                <span className="font-bold text-gray-900">{stats.following}</span>
                <span className="text-gray-600 ml-1">Following</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {signatureScents.length > 0 && (
        <div className="glass-card rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-orange-500" />
            Signature Scents
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {signatureScents.map((scent, idx) => (
              <Link 
                key={idx} 
                href={`/perfumes/${scent.slug}`}
                className="group"
              >
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2 flex items-center justify-center p-2">
                  {scent.image ? (
                    <img 
                      src={scent. image} 
                      alt={scent.name}
                      className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform"
                    />
                  ) : (
                    <Leaf className="w-6 h-6 text-gray-300" />
                  )}
                </div>
                <p className="text-[10px] font-semibold text-gray-900 line-clamp-1">{scent.name}</p>
                <p className="text-[9px] text-gray-500 line-clamp-1">{scent.brand}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {(! privacy.isWardrobePublic && !privacy.isOwnProfile) ?  (
        <div className="glass-card rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-orange-500" />
            Wardrobe
          </h2>
          <div className="text-center py-12">
            <Lock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">This user&apos;s wardrobe is private</p>
          </div>
        </div>
      ) : fullWardrobe && fullWardrobe.length > 0 ? (
        <div className="glass-card rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-orange-500" />
            Wardrobe ({wardrobeStats.total} bottles)
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            <div className="bg-green-50 rounded-lg p-3 text-center border border-green-100">
              <Package className="w-4 h-4 text-green-600 mx-auto mb-1" />
              <p className="text-xl font-bold text-green-600">
                {wardrobeStats.currentlyUsing}
              </p>
              <p className="text-[10px] text-gray-600 mt-1">Currently Using</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-100">
              <Star className="w-4 h-4 text-blue-600 mx-auto mb-1" />
              <p className="text-xl font-bold text-blue-600">
                {wardrobeStats.wishlist}
              </p>
              <p className="text-[10px] text-gray-600 mt-1">Wishlist</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 text-center border border-purple-100">
              <ShoppingBag className="w-4 h-4 text-purple-600 mx-auto mb-1" />
              <p className="text-xl font-bold text-purple-600">
                {wardrobeStats.inCollection}
              </p>
              <p className="text-[10px] text-gray-600 mt-1">In Collection</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
              <Leaf className="w-4 h-4 text-gray-600 mx-auto mb-1" />
              <p className="text-xl font-bold text-gray-600">
                {wardrobeStats.total}
              </p>
              <p className="text-[10px] text-gray-600 mt-1">Total Bottles</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {fullWardrobe. slice(0, 24).map((item: any) => (
              <Link
                key={item.id}
                href={`/perfumes/${item.slug}`}
                className="group"
              >
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2 flex items-center justify-center p-1. 5">
                  {item. image ? (
                    <img 
                      src={item. image} 
                      alt={item.name}
                      className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform"
                    />
                  ) : (
                    <Leaf className="w-6 h-6 text-gray-300" />
                  )}
                </div>
                <p className="text-[10px] font-semibold text-gray-900 line-clamp-1">{item.name}</p>
                <p className="text-[9px] text-gray-500 line-clamp-1">{item.brand}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className={`text-[8px] px-1. 5 py-0.5 rounded-full ${
                    item.status === 'CURRENTLY_USING' ? 'bg-green-100 text-green-700' :
                    item.status === 'WISH_LIST' ? 'bg-blue-100 text-blue-700' :
                    item. status === 'IN_COLLECTION' ? 'bg-purple-100 text-purple-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {item.status. replace(/_/g, ' ').toLowerCase()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
          
          {fullWardrobe.length > 24 && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Showing 24 of {fullWardrobe.length} bottles
              </p>
            </div>
          )}
        </div>
      ) : null}

      <div className="glass-card rounded-2xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        
        {! privacy.isActivityPublic && (
          <div className="text-center py-12">
            <Lock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">This user&apos;s activity is private</p>
          </div>
        )}

        {privacy.isActivityPublic && recentActivity.length === 0 && (
          <p className="text-center py-8 text-gray-500">No recent activity</p>
        )}

        {privacy. isActivityPublic && recentActivity.length > 0 && (
          <div className="space-y-4">
            {recentActivity.map((activity) => {
              const isReview = activity.type === 'review';
              
              // Properly check for valid values
              const hasStarRating = isReview && typeof activity.rating === 'number' && activity.rating > 0;
              const hasSillage = isReview && typeof activity.sillage === 'number' && activity.sillage > 0;
              const hasLongevity = isReview && typeof activity.longevity === 'number' && activity.longevity > 0;
              const hasText = isReview && activity.preview;
              
              let actionBadges = [];
              
              if (hasStarRating) {
                actionBadges.push({
                  icon: '⭐',
                  text: `${activity.rating} Stars`,
                  color: 'bg-orange-100 text-orange-700 border-orange-200'
                });
              }
              
              if (hasSillage) {
                const sillageLabel = activity.sillage <= 1.5 ? 'Intimate' : activity.sillage <= 3.5 ? 'Moderate' : 'Strong';
                actionBadges. push({
                  icon: '🌬️',
                  text: `${sillageLabel} Sillage`,
                  color: 'bg-cyan-100 text-cyan-700 border-cyan-200'
                });
              }
              
              if (hasLongevity) {
                const hours = Math.round(activity.longevity * 2.4);
                actionBadges.push({
                  icon: '⏱️',
                  text: `${hours}h Longevity`,
                  color: 'bg-teal-100 text-teal-700 border-teal-200'
                });
              }
              
              if (hasText) {
                actionBadges.push({
                  icon: '💬',
                  text: 'Wrote Review',
                  color: 'bg-blue-100 text-blue-700 border-blue-200'
                });
              }
              
              if (! isReview && activity.status) {
                const statusMap: { [key: string]: { icon: string, text: string, color: string } } = {
                  'CURRENTLY_USING': { icon: '✨', text: 'Currently Using', color: 'bg-green-100 text-green-700 border-green-200' },
                  'WISH_LIST': { icon: '💫', text: 'Added to Wishlist', color: 'bg-blue-100 text-blue-700 border-blue-200' },
                  'IN_COLLECTION': { icon: '📦', text: 'Added to Collection', color: 'bg-purple-100 text-purple-700 border-purple-200' },
                  'USED_UP': { icon: '🏁', text: 'Used Up', color: 'bg-gray-100 text-gray-700 border-gray-200' },
                  'GIFTED': { icon: '🎁', text: 'Gifted', color: 'bg-pink-100 text-pink-700 border-pink-200' },
                  'DECANT': { icon: '🧪', text: 'Got Decant', color: 'bg-amber-100 text-amber-700 border-amber-200' }
                };
                
                const statusInfo = statusMap[activity.status] || statusMap['IN_COLLECTION'];
                actionBadges.push(statusInfo);
              }
              
              return (
                <Link
                  key={activity.id}
                  href={`/perfumes/${activity.slug}`}
                  className="flex gap-4 p-4 rounded-lg hover:bg-green-50 transition-colors"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center p-1">
                    {activity.image ?  (
                      <img src={activity.image} className="max-w-full max-h-full object-contain" alt={activity.fragranceName} />
                    ) : (
                      <Leaf className="w-6 h-6 text-gray-300" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {isReview ?  (
                        <MessageSquare className="w-4 h-4 text-blue-500" />
                      ) : (
                        <ShoppingBag className="w-4 h-4 text-orange-500" />
                      )}
                      <span className="text-xs font-semibold text-gray-500 uppercase">
                        {isReview ? 'Reviewed' : 'Wardrobe'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatActivityDate(activity.date)}
                      </span>
                    </div>
                    
                    <p className="font-semibold text-gray-900 line-clamp-1">{activity.fragranceName}</p>
                    <p className="text-sm text-gray-600 line-clamp-1 mb-2">{activity.brand}</p>
                    
                    {actionBadges.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1. 5 mb-2">
                        {actionBadges.map((badge, idx) => (
                          <span 
                            key={idx}
                            className={`text-[10px] font-medium px-2 py-1 rounded-full border ${badge.color}`}
                          >
                            {badge. icon} {badge.text}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {hasText && (
                      <p className="text-sm text-gray-600 line-clamp-2 italic">
                        &quot;{activity.preview}&quot;
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}