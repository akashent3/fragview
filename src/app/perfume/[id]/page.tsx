'use client';
import React, { useState } from 'react';
import { Star, Heart, Share, Plus, Clock, Wind, MessageSquare } from 'lucide-react';
import NotesPyramid from '@/components/ui/NotesPyramid';
import AccordTags from '@/components/ui/AccordTags';
import RatingSlider from '@/components/ui/RatingSlider';
import SimilarFragrances from '@/components/ui/SimilarFragrances';
import PerfumeInfo from '@/components/ui/PerfumeInfo';
import ReviewsSummary from '@/components/ui/ReviewsSummary';

interface PerfumePageProps {
  params: { id: string };
}

const PerfumePage: React.FC<PerfumePageProps> = ({ params }) => {
  const [userRating, setUserRating] = useState({
    longevity: 3.5,
    sillage: 4.0,
    overall: 4.2
  });

  const [selectedWardrobe, setSelectedWardrobe] = useState('');
  const [reviewText, setReviewText] = useState('');

  // Enhanced mock data
  const perfume = {
    id: params.id,
    name: 'Sauvage',
    brand: 'Dior',
    year: 2015,
    perfumer: 'François Demachy',
    gender: 'Male',
    rating: 4.3,
    reviewCount: 1247,
    longevity: 4.2,
    sillage: 4.5,
    price: '$85 - $120',
    availability: 'In Stock',
    description: 'Sauvage is inspired by wide-open spaces, a white-hot desert landscape under a vast blue sky. It represents the moment when instinct prevails, the moment of an encounter with the essential.',
    concentration: 'Eau de Toilette',
    season: ['Spring', 'Summer', 'Fall'],
    occasions: ['Daily Wear', 'Office', 'Casual', 'Date Night'],
    topNotes: [{ name: 'Bergamot' }, { name: 'Pink Pepper' }, { name: 'Elemi' }],
    middleNotes: [{ name: 'Lavender' }, { name: 'Sichuan Pepper' }, { name: 'Geranium' }],
    baseNotes: [{ name: 'Vanilla' }, { name: 'Cedar' }, { name: 'Sandalwood' }, { name: 'Patchouli' }],
    accords: [
      { name: 'fresh', strength: 5 },
      { name: 'woody', strength: 4 },
      { name: 'spicy', strength: 3 },
      { name: 'citrus', strength: 4 }
    ]
  };

  const similarPerfumes = [
    { id: 2, name: 'Bleu de Chanel', brand: 'Chanel', rating: 4.4, isVerified: true },
    { id: 3, name: 'Acqua di Gio', brand: 'Giorgio Armani', rating: 4.1, addedBy: 'fragrancelover' },
  ];

  // Mock reviews summary data
  const reviewsSummary = {
    totalReviews: 1247,
    averageRating: 4.3,
    sentiment: 'positive' as const,
    keyPoints: [
      'Excellent longevity and projection for daily wear',
      'Fresh opening that develops into a warm, woody base',
      'Very versatile - works in most situations and seasons',
      'Good value for money compared to other designer fragrances',
      'Compliment magnet, especially in casual settings'
    ],
    commonWords: [
      { word: 'fresh', frequency: 89 },
      { word: 'versatile', frequency: 67 },
      { word: 'compliments', frequency: 54 },
      { word: 'woody', frequency: 48 },
      { word: 'long-lasting', frequency: 42 },
      { word: 'office-friendly', frequency: 38 }
    ],
    ratingDistribution: {
      5: 523,
      4: 456,
      3: 178,
      2: 67,
      1: 23
    },
    aiSummary: "Based on 1,247 reviews, Sauvage receives overwhelmingly positive feedback for its fresh, versatile character. Users consistently praise its excellent performance, with many noting 6-8 hours of longevity and moderate to strong projection. The fragrance is frequently described as a 'safe blind buy' and 'crowd pleaser' that works well in office environments and casual settings. The fresh bergamot opening and woody drydown create a sophisticated yet approachable scent profile that appeals to a wide demographic."
  };

  const wardrobeOptions = ['My Bottles', 'Wishlist', 'Past Bottles'];

  const reviews = [
    {
      id: 1,
      user: 'FragranceLover',
      rating: 4.5,
      longevity: 4.0,
      sillage: 4.5,
      text: 'Amazing fresh scent that lasts all day. Perfect for any occasion!',
      date: '2024-01-15',
      helpful: 23
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 space-y-5">
        
        {/* Header Section - Existing */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-48 h-64 bg-gradient-to-br from-pastel-blue to-pastel-purple rounded-2xl opacity-20 dark:opacity-30"></div>
            
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">{perfume.name}</h1>
                <p className="text-xl text-primary-600 dark:text-primary-400 font-semibold transition-colors duration-300">{perfume.brand}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="ml-1 text-lg font-semibold text-gray-900 dark:text-white">{perfume.rating}</span>
                  </div>
                  <span className="text-gray-500 dark:text-gray-400 transition-colors duration-300">({perfume.reviewCount} reviews)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500 dark:text-gray-400">Year:</span> <span className="ml-2 font-medium text-gray-900 dark:text-white">{perfume.year}</span></div>
                <div><span className="text-gray-500 dark:text-gray-400">Gender:</span> <span className="ml-2 font-medium text-gray-900 dark:text-white">{perfume.gender}</span></div>
                <div><span className="text-gray-500 dark:text-gray-400">Perfumer:</span> <span className="ml-2 font-medium text-gray-900 dark:text-white">{perfume.perfumer}</span></div>
                <div><span className="text-gray-500 dark:text-gray-400">Price:</span> <span className="ml-2 font-medium text-gray-900 dark:text-white">{perfume.price}</span></div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 bg-gradient-to-r from-primary-500 to-purple-500 text-white py-2 px-4 rounded-lg font-semibold">
                  <Plus className="w-4 h-4 inline mr-2" />
                  Add to Wardrobe
                </button>
                <button className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <Heart className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <Share className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* NEW: Perfume Info Section */}
        <PerfumeInfo perfume={perfume} />

        {/* Accords */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white transition-colors duration-300">Main Accords</h3>
          <AccordTags accords={perfume.accords} />
        </div>

        {/* UPDATED: Notes Pyramid (60% smaller + note images) */}
        <NotesPyramid
          topNotes={perfume.topNotes}
          middleNotes={perfume.middleNotes}
          baseNotes={perfume.baseNotes}
        />

        {/* NEW: Reviews Summary Section */}
        <ReviewsSummary summary={reviewsSummary} />

        {/* Performance & Rate */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Rate This Fragrance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <RatingSlider
              label="Longevity"
              value={userRating.longevity}
              onChange={(value) => setUserRating(prev => ({ ...prev, longevity: value }))}
            />
            <RatingSlider
              label="Sillage"
              value={userRating.sillage}
              onChange={(value) => setUserRating(prev => ({ ...prev, sillage: value }))}
            />
            <RatingSlider
              label="Overall"
              value={userRating.overall}
              onChange={(value) => setUserRating(prev => ({ ...prev, overall: value }))}
            />
          </div>
          
          <div className="mt-4">
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Write your review..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white transition-colors duration-300"
              rows={3}
            />
            <button className="mt-3 bg-gradient-to-r from-primary-500 to-purple-500 text-white px-6 py-2 rounded-lg font-semibold">
              Submit Review
            </button>
          </div>
        </div>

        {/* Similar Fragrances */}
        <SimilarFragrances 
          fragrances={similarPerfumes} 
          currentPerfumeId={parseInt(params.id)}
          userIsVerified={true}
        />

        {/* Reviews */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
            <MessageSquare className="w-5 h-5 inline mr-2" />
            Recent Reviews
          </h3>
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0 transition-colors duration-300">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white transition-colors duration-300">{review.user}</h4>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                      <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                      {review.rating} | L: {review.longevity} | S: {review.sillage}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">{review.date}</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm transition-colors duration-300">{review.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfumePage;