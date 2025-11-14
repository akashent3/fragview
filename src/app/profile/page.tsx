'use client';
import React, { useState , useEffect} from 'react';
import Link from 'next/link';
import { Star, Calendar, Award, Edit, Settings, TrendingUp, Heart, MessageSquare, Leaf, Flower2, Trees } from 'lucide-react';
import AccordTags from '@/components/ui/AccordTags';
import UserBadges from '@/components/gamification/UserBadges';
import { useSession } from 'next-auth/react';
import { useAuthModal } from '@/components/auth/AuthModal';

type TabId = 'overview' | 'reviews' | 'achievements' | 'settings';

const ProfilePage = () => {
  // ✅ Hooks first, every render
  const { data: session, status } = useSession();
  const { open } = useAuthModal();

  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [isEditing, setIsEditing] = useState(false);

  // Open sign-in popup when needed
  useEffect(() => {
    if (status === 'unauthenticated') {
      open({ mode: 'signin', reason: 'Sign in to view your profile' });
    }
  }, [status, open]);

  // Loading and unauth states AFTER hooks
  if (status === 'loading') {
    return (
      <div className="min-h-screen relative overflow-hidden py-8" style={{ backgroundColor: '#FAFFF5' }}>
        <div className="mx-auto max-w-4xl p-6">
          <div className="glass-card rounded-lg p-4 text-sm text-gray-600">
            Loading…
          </div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated' || !session) {
    return (
      <div className="min-h-screen relative overflow-hidden py-8" style={{ backgroundColor: '#FAFFF5' }}>
        <div className="mx-auto max-w-md p-6">
          <div className="space-y-3 glass-card rounded-xl p-6">
            <h1 className="text-xl font-semibold text-gray-800">Sign in required</h1>
            <p className="text-sm text-gray-600">A sign-in popup should be visible. After signing in, you'll see your profile here.</p>
          </div>
        </div>
      </div>
    );
  }

  // Mock user data (unchanged)
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
    <div key={activity.id} className="border-b border-green-100 pb-4 last:border-b-0">
      <div className="flex items-start space-x-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          activity.type === 'review' ? 'bg-blue-100' :
          activity.type === 'wardrobe_add' ? 'bg-green-100' :
          'bg-orange-100'
        }`}>
          {activity.type === 'review' && <MessageSquare className="w-4 h-4 text-blue-600" />}
          {activity.type === 'wardrobe_add' && <Heart className="w-4 h-4 text-green-600" />}
          {activity.type === 'helpful_vote' && <TrendingUp className="w-4 h-4 text-orange-600" />}
        </div>
        <div className="flex-1">
          <div className="text-sm text-gray-700">
            {activity.type === 'review' && (
              <>Reviewed <Link href={`/perfume/${activity.id}`} className="font-medium text-green-600 hover:text-green-700">{activity.fragranceName}</Link> by {activity.brand}</>
            )}
            {activity.type === 'wardrobe_add' && (
              <>Added <span className="font-medium text-gray-900">{activity.fragranceName}</span> by {activity.brand} to {activity.category}</>
            )}
            {activity.type === 'helpful_vote' && (
              <>Found {activity.reviewer}'s review of <span className="font-medium text-gray-900">{activity.fragranceName}</span> helpful</>
            )}
          </div>
          {activity.rating && (
            <div className="flex items-center mt-1">
              <Star className="w-3 h-3 text-orange-400 fill-current" />
              <span className="ml-1 text-xs text-gray-600">{activity.rating}</span>
            </div>
          )}
          {activity.preview && (
            <p className="text-xs text-gray-600 mt-1 italic">"{activity.preview}"</p>
          )}
          <span className="text-xs text-gray-500">{formatDate(activity.date)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden py-8" style={{ backgroundColor: '#FAFFF5' }}>
      {/* Animated Background Elements - ADDED */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-green-200/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-200/10 rounded-full blur-3xl animate-pulse animate-delay-2" />
        
        <div className="absolute top-32 right-20 animate-float">
          <Leaf size={20} className="text-green-300/20" />
        </div>
        <div className="absolute bottom-40 left-32 animate-float animate-delay-3">
          <Flower2 size={18} className="text-orange-300/20" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Profile Header - BOTANICAL THEME */}
        <div className="glass-card rounded-2xl shadow-sm p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-5">
            <Trees size={200} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
            <div className="lg:col-span-2">
              <div className="flex items-start space-x-6">
                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-orange-400 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user.displayName.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-orange-500 bg-clip-text text-transparent">{user.displayName}</h1>
                    <span className="text-gray-600">@{user.username}</span>
                    <button 
                      onClick={() => setIsEditing(!isEditing)}
                      className="p-2 text-gray-500 hover:text-green-600 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Joined {formatDate(user.joinDate)}
                    </div>
                    <div>{user.location}</div>
                  </div>

                  <p className="text-gray-700 leading-relaxed mb-4">
                    {user.bio}
                  </p>

                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      user.stats.level === 'Fragrance Expert' 
                        ? 'bg-gradient-to-r from-green-100 to-orange-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      <Award className="w-4 h-4 inline mr-1" />
                      {user.stats.level}
                    </span>
                    <span className="text-sm text-gray-600">
                      {user.stats.xp} XP
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid - BOTANICAL COLORS */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center border border-green-200">
                <div className="text-2xl font-bold text-green-600">{user.stats.reviewsCount}</div>
                <div className="text-sm text-green-700">Reviews</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 text-center border border-orange-200">
                <div className="text-2xl font-bold text-orange-600">{user.stats.wardrobeCount}</div>
                <div className="text-sm text-orange-700">Wardrobe</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center border border-green-200">
                <div className="text-2xl font-bold text-green-600">{user.stats.helpfulVotes}</div>
                <div className="text-sm text-green-700">Helpful</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 text-center border border-orange-200">
                <div className="text-2xl font-bold text-orange-600">{user.stats.followers}</div>
                <div className="text-sm text-orange-700">Followers</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs - BOTANICAL THEME */}
        <div className="glass-card rounded-2xl shadow-sm mb-8">
          <div className="border-b border-green-100">
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
                    onClick={() => setActiveTab(tab.id as TabId)}
                    className={`pb-2 border-b-2 font-medium text-sm transition-colors duration-300 flex items-center ${
                      activeTab === tab.id
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
              {/* Wardrobe button → /wardrobe */}
              <a href="/wardrobe" className="ml-auto inline-flex items-center gap-2 rounded-md border border-green-200 px-3 py-1.5 text-sm hover:bg-green-50 text-gray-700 transition-colors">My Wardrobe</a>
            </div>
          </div>

          {/* Tab Content - Keep existing content, just updating colors */}
          <div className="p-8">
            {/* Content remains the same, just update color classes to use green/orange theme */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activity */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-6">
                    Recent Activity
                  </h3>
                  <div className="space-y-4">
                    {user.recentActivity.map(renderActivityItem)}
                  </div>
                </div>

                {/* Top Fragrances */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-6">
                    Top Rated Fragrances
                  </h3>
                  <div className="space-y-4">
                    {user.topFragrances.map((fragrance) => (
                      <div 
                        key={fragrance.id} 
                        className="glass-card rounded-xl p-4 hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">{fragrance.name}</h4>
                            <p className="text-gray-600 text-sm">{fragrance.brand}</p>
                          </div>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-orange-400 fill-current" />
                            <span className="ml-1 text-sm font-medium text-gray-900">{fragrance.myRating}</span>
                          </div>
                        </div>
                        <AccordTags accords={fragrance.accords} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Other tabs content remains same with updated colors */}
            {activeTab === 'reviews' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-6">My Reviews</h3>
                <div className="space-y-6">
                  {user.recentReviews.map((review) => (
                    <div key={review.id} className="glass-card rounded-2xl p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{review.fragranceName}</h4>
                          <p className="text-gray-600">{review.brand}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-orange-400 fill-current" />
                            <span className="ml-1 text-sm font-medium text-gray-900">{review.rating}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{formatDate(review.date)}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <span className="text-gray-600">Longevity:</span>
                          <span className="ml-2 font-medium text-gray-800">{review.longevity}/5</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Sillage:</span>
                          <span className="ml-2 font-medium text-gray-800">{review.sillage}/5</span>
                        </div>
                      </div>

                      <AccordTags accords={review.accords} className="mb-4" />

                      <p className="text-gray-700 leading-relaxed mb-4">
                        {review.text}
                      </p>

                      <div className="flex justify-between items-center text-sm">
                        <span className="text-green-600">
                          {review.helpful} people found this helpful
                        </span>
                        <div className="flex space-x-4">
                          <button className="text-green-600 hover:text-green-700 transition-colors">
                            Edit
                          </button>
                          <button className="text-red-600 hover:text-red-700 transition-colors">
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
              <UserBadges user={{ credibilityScore: 62 }} />
            )}

            {activeTab === 'settings' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Account Settings</h3>
                <div className="space-y-6">
                  <div className="glass-card rounded-xl p-6">
                    <h4 className="text-lg font-medium text-gray-800 mb-4">Profile Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                        <input 
                          type="text" 
                          defaultValue={user.displayName}
                          className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/80 text-gray-800"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                        <input 
                          type="text" 
                          defaultValue={user.location}
                          className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/80 text-gray-800"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                      <textarea 
                        defaultValue={user.bio}
                        rows={3}
                        className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/80 text-gray-800"
                      />
                    </div>
                    <button className="mt-4 bg-gradient-to-r from-green-500 to-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all">
                      Save Changes
                    </button>
                  </div>

                  <div className="glass-card rounded-xl p-6">
                    <h4 className="text-lg font-medium text-gray-800 mb-4">Privacy Settings</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Make profile public</span>
                        <button className="bg-green-500 relative inline-flex h-6 w-11 items-center rounded-full">
                          <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition"></span>
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Show wardrobe to others</span>
                        <button className="bg-gray-300 relative inline-flex h-6 w-11 items-center rounded-full">
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