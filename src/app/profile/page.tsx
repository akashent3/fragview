'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Star, Calendar, Award, Edit, Settings, TrendingUp, Heart, MessageSquare } from 'lucide-react';
import AccordTags from '@/components/ui/AccordTags';
import UserBadges from '@/components/gamification/UserBadges';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);

  // Mock user data
  const user = {
    username: 'akashent3',
    displayName: 'Akash',
    joinDate: '2023-08-15',
    location: 'Mumbai, India',
    bio: 'Fragrance enthusiast with a passion for niche and designer perfumes. Always exploring new scents and sharing honest reviews.',
    avatar: '/api/placeholder/150/150',
    stats: {
      reviewsCount: 89,
      wardrobeCount: 34,
      helpfulVotes: 156,
      followers: 423,
      following: 89,
      level: 'Fragrance Expert',
      xp: 2450
    },
    recentActivity: [
      {
        id: 1,
        type: 'review',
        fragranceName: 'Sauvage',
        brand: 'Dior',
        rating: 4.5,
        date: '2025-09-03',
        preview: 'Amazing fresh scent perfect for daily wear...'
      },
      {
        id: 2,
        type: 'wardrobe_add',
        fragranceName: 'Tom Ford Oud Wood',
        brand: 'Tom Ford',
        date: '2025-09-01',
        category: 'Special Occasions'
      },
      {
        id: 3,
        type: 'helpful_vote',
        fragranceName: 'Black Opium',
        brand: 'Yves Saint Laurent',
        date: '2025-08-30',
        reviewer: 'fragrancelover'
      }
    ],
    topFragrances: [
      {
        id: 1,
        name: 'Sauvage',
        brand: 'Dior',
        myRating: 4.8,
        accords: [{ name: 'fresh' }, { name: 'woody' }, { name: 'spicy' }]
      },
      {
        id: 2,
        name: 'Tom Ford Oud Wood',
        brand: 'Tom Ford',
        myRating: 4.9,
        accords: [{ name: 'woody' }, { name: 'oriental' }, { name: 'smoky' }]
      },
      {
        id: 3,
        name: 'Bleu de Chanel',
        brand: 'Chanel',
        myRating: 4.6,
        accords: [{ name: 'fresh' }, { name: 'woody' }, { name: 'citrus' }]
      }
    ],
    recentReviews: [
      {
        id: 1,
        fragranceName: 'Sauvage',
        brand: 'Dior',
        rating: 4.5,
        longevity: 4.2,
        sillage: 4.0,
        date: '2025-09-03',
        text: 'This fragrance has become my daily driver. The fresh opening with bergamot is incredible, and the dry down is sophisticated yet approachable. Perfect for any occasion.',
        helpful: 12,
        accords: [{ name: 'fresh' }, { name: 'woody' }, { name: 'spicy' }]
      },
      {
        id: 2,
        fragranceName: 'Tom Ford Oud Wood',
        brand: 'Tom Ford',
        rating: 4.9,
        longevity: 4.8,
        sillage: 4.5,
        date: '2025-08-28',
        text: 'Absolutely stunning oud fragrance. Not overwhelming at all, very wearable and sophisticated. The sandalwood and rosewood complement the oud perfectly.',
        helpful: 8,
        accords: [{ name: 'woody' }, { name: 'oriental' }, { name: 'smoky' }]
      }
    ]
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderActivityItem = (activity: any) => (
    <div key={activity.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0 transition-colors duration-300">
      <div className="flex items-start space-x-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          activity.type === 'review' ? 'bg-blue-100 dark:bg-blue-900/30' :
          activity.type === 'wardrobe_add' ? 'bg-green-100 dark:bg-green-900/30' :
          'bg-purple-100 dark:bg-purple-900/30'
        } transition-colors duration-300`}>
          {activity.type === 'review' && <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
          {activity.type === 'wardrobe_add' && <Heart className="w-4 h-4 text-green-600 dark:text-green-400" />}
          {activity.type === 'helpful_vote' && <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
        </div>
        <div className="flex-1">
          <div className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
            {activity.type === 'review' && (
              <>Reviewed <Link href={`/perfume/${activity.id}`} className="font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400">{activity.fragranceName}</Link> by {activity.brand}</>
            )}
            {activity.type === 'wardrobe_add' && (
              <>Added <span className="font-medium text-gray-900 dark:text-white">{activity.fragranceName}</span> by {activity.brand} to {activity.category}</>
            )}
            {activity.type === 'helpful_vote' && (
              <>Found {activity.reviewer}'s review of <span className="font-medium text-gray-900 dark:text-white">{activity.fragranceName}</span> helpful</>
            )}
          </div>
          {activity.rating && (
            <div className="flex items-center mt-1">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">{activity.rating}</span>
            </div>
          )}
          {activity.preview && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">"{activity.preview}"</p>
          )}
          <span className="text-xs text-gray-400 dark:text-gray-500 transition-colors duration-300">{formatDate(activity.date)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4">
        {/* Profile Header - FIXED */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 mb-8 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-start space-x-6">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user.displayName.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">{user.displayName}</h1>
                    <span className="text-gray-500 dark:text-gray-400 transition-colors duration-300">@{user.username}</span>
                    <button 
                      onClick={() => setIsEditing(!isEditing)}
                      className="p-2 text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300 mb-4 transition-colors duration-300">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Joined {formatDate(user.joinDate)}
                    </div>
                    <div>{user.location}</div>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 transition-colors duration-300">
                    {user.bio}
                  </p>

                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      user.stats.level === 'Fragrance Expert' 
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' 
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                    } transition-colors duration-300`}>
                      <Award className="w-4 h-4 inline mr-1" />
                      {user.stats.level}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                      {user.stats.xp} XP
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid - FIXED */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 text-center border border-blue-200 dark:border-blue-800 transition-colors duration-300">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{user.stats.reviewsCount}</div>
                <div className="text-sm text-blue-700 dark:text-blue-300">Reviews</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 text-center border border-green-200 dark:border-green-800 transition-colors duration-300">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{user.stats.wardrobeCount}</div>
                <div className="text-sm text-green-700 dark:text-green-300">Wardrobe</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 text-center border border-purple-200 dark:border-purple-800 transition-colors duration-300">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{user.stats.helpfulVotes}</div>
                <div className="text-sm text-purple-700 dark:text-purple-300">Helpful</div>
              </div>
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-xl p-4 text-center border border-pink-200 dark:border-pink-800 transition-colors duration-300">
                <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">{user.stats.followers}</div>
                <div className="text-sm text-pink-700 dark:text-pink-300">Followers</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation - FIXED */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm mb-8 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex space-x-8 px-8 py-4">
              {[
                { id: 'overview', label: 'Overview', icon: TrendingUp },
                { id: 'reviews', label: 'Reviews', icon: MessageSquare },
                { id: 'achievements', label: 'Achievements', icon: Award },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map(tab => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-2 border-b-2 font-medium text-sm transition-colors duration-300 flex items-center ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content - FIXED */}
          <div className="p-8">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activity - FIXED */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 transition-colors duration-300">Recent Activity</h3>
                  <div className="space-y-4">
                    {user.recentActivity.map(renderActivityItem)}
                  </div>
                </div>

                {/* Top Fragrances - FIXED */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 transition-colors duration-300">Top Rated Fragrances</h3>
                  <div className="space-y-4">
                    {user.topFragrances.map((fragrance) => (
                      <div key={fragrance.id} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer border border-gray-100 dark:border-gray-600">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white transition-colors duration-300">{fragrance.name}</h4>
                            <p className="text-gray-600 dark:text-gray-300 text-sm transition-colors duration-300">{fragrance.brand}</p>
                          </div>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="ml-1 text-sm font-medium text-gray-900 dark:text-white">{fragrance.myRating}</span>
                          </div>
                        </div>
                        <AccordTags accords={fragrance.accords} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 transition-colors duration-300">My Reviews</h3>
                <div className="space-y-6">
                  {user.recentReviews.map((review) => (
                    <div key={review.id} className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6 border border-gray-100 dark:border-gray-600 transition-colors duration-300">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">{review.fragranceName}</h4>
                          <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">{review.brand}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="ml-1 text-sm font-medium text-gray-900 dark:text-white">{review.rating}</span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">{formatDate(review.date)}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Longevity:</span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-white">{review.longevity}/5</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Sillage:</span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-white">{review.sillage}/5</span>
                        </div>
                      </div>

                      <AccordTags accords={review.accords} className="mb-4" />

                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 transition-colors duration-300">
                        {review.text}
                      </p>

                      <div className="flex justify-between items-center text-sm">
                        <span className="text-green-600 dark:text-green-400 transition-colors duration-300">
                          {review.helpful} people found this helpful
                        </span>
                        <div className="flex space-x-4">
                          <button className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
                            Edit
                          </button>
                          <button className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors">
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'achievements' && (
              <UserBadges userId={user.username} />
            )}

            {activeTab === 'settings' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 transition-colors duration-300">Account Settings</h3>
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 border border-gray-100 dark:border-gray-600 transition-colors duration-300">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4 transition-colors duration-300">Profile Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Display Name</label>
                        <input 
                          type="text" 
                          value={user.displayName}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white transition-colors duration-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Location</label>
                        <input 
                          type="text" 
                          value={user.location}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white transition-colors duration-300"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Bio</label>
                      <textarea 
                        value={user.bio}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white transition-colors duration-300"
                      />
                    </div>
                    <button className="mt-4 bg-gradient-to-r from-primary-500 to-purple-500 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-shadow">
                      Save Changes
                    </button>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 border border-gray-100 dark:border-gray-600 transition-colors duration-300">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4 transition-colors duration-300">Privacy Settings</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300 transition-colors duration-300">Make profile public</span>
                        <button className="bg-primary-500 relative inline-flex h-6 w-11 items-center rounded-full">
                          <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition"></span>
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300 transition-colors duration-300">Show wardrobe to others</span>
                        <button className="bg-gray-300 dark:bg-gray-600 relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300">
                          <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition"></span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;