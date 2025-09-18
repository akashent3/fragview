'use client';
import React, { useState } from 'react';
import { Star, Heart, Share, Plus, MessageSquare, LogIn } from 'lucide-react';
import NotesPyramid from '@/components/ui/NotesPyramid';
import AccordTags from '@/components/ui/AccordTags';
import RatingSlider from '@/components/ui/RatingSlider';
import SimilarFragrances from '@/components/ui/SimilarFragrances';
import PerfumeInfo from '@/components/ui/PerfumeInfo';
import ReviewsSummary from '@/components/ui/ReviewsSummary';
import { useAuth } from '@/lib/auth-context';
import { useAuthModal } from '@/components/auth/AuthModal';

interface PerfumePageProps {
  params: { slug: string };
}

const PerfumePage: React.FC<PerfumePageProps> = ({ params }) => {
  const { user } = useAuth();
  const { open } = useAuthModal();

  const [userRating, setUserRating] = useState({ longevity: 3.5, sillage: 4.0, overall: 4.2 });
  const [reviewText, setReviewText] = useState('');

  // If your slugs are numeric IDs, this keeps SimilarFragrances happy
  const numericId = Number.isFinite(Number(params.slug)) ? Number(params.slug) : -1;

  // Mock data (unchanged, except id uses slug consistently)
  const perfume = {
    id: params.slug,
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
    description:
      'Sauvage is inspired by wide-open spaces, a white-hot desert landscape under a vast blue sky. It represents the moment when instinct prevails, the moment of an encounter with the essential.',
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
      { name: 'citrus', strength: 4 },
    ],
  };

  const similarPerfumes = [
    { id: 2, name: 'Bleu de Chanel', brand: 'Chanel', rating: 4.4, isVerified: true },
    { id: 3, name: 'Acqua di Gio', brand: 'Giorgio Armani', rating: 4.1, addedBy: 'fragrancelover' },
  ];

  const reviewsSummary = {
    totalReviews: 1247,
    averageRating: 4.3,
    sentiment: 'positive' as const,
    keyPoints: [
      'Excellent longevity and projection for daily wear',
      'Fresh opening that develops into a warm, woody base',
      'Very versatile - works in most situations and seasons',
      'Good value for money compared to other designer fragrances',
      'Compliment magnet, especially in casual settings',
    ],
    commonWords: [
      { word: 'fresh', frequency: 89 },
      { word: 'versatile', frequency: 67 },
      { word: 'compliments', frequency: 54 },
      { word: 'woody', frequency: 48 },
      { word: 'long-lasting', frequency: 42 },
      { word: 'office-friendly', frequency: 38 },
    ],
    ratingDistribution: { 5: 523, 4: 456, 3: 178, 2: 67, 1: 23 },
    aiSummary:
      "Based on 1,247 reviews, Sauvage receives overwhelmingly positive feedback for its fresh, versatile character. Users consistently praise its excellent performance, with many noting 6-8 hours of longevity and moderate to strong projection. The fragrance is frequently described as a 'safe blind buy' and 'crowd pleaser' that works well in office environments and casual settings. The fresh bergamot opening and woody drydown create a sophisticated yet approachable scent profile that appeals to a wide demographic.",
  };

  const reviews = [
    { id: 1, user: 'FragranceLover', rating: 4.5, longevity: 4.0, sillage: 4.5, text: 'Amazing fresh scent that lasts all day. Perfect for any occasion!', date: '2024-01-15', helpful: 23 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-4 text-gray-900 transition-colors duration-300 dark:bg-gray-900 dark:text-gray-100">
      <div className="mx-auto max-w-4xl space-y-5 px-4">
        {/* Header Card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-colors duration-300 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex flex-col gap-6 md:flex-row">
            <div className="h-64 w-full rounded-2xl bg-gradient-to-br from-pastel-blue to-pastel-purple opacity-20 dark:opacity-30 md:w-48" />
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold">{perfume.name}</h1>
                <p className="text-xl font-semibold text-primary-600 dark:text-primary-400">{perfume.brand}</p>
                <div className="mt-2 flex items-center space-x-4">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 fill-current text-yellow-400" />
                    <span className="ml-1 text-lg font-semibold">{perfume.rating}</span>
                  </div>
                  <span className="text-gray-500 dark:text-gray-400">({perfume.reviewCount} reviews)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500 dark:text-gray-400">Year:</span> <span className="ml-2 font-medium">{perfume.year}</span></div>
                <div><span className="text-gray-500 dark:text-gray-400">Gender:</span> <span className="ml-2 font-medium">{perfume.gender}</span></div>
                <div><span className="text-gray-500 dark:text-gray-400">Perfumer:</span> <span className="ml-2 font-medium">{perfume.perfumer}</span></div>
                <div><span className="text-gray-500 dark:text-gray-400">Price:</span> <span className="ml-2 font-medium">{perfume.price}</span></div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 rounded-lg bg-gradient-to-r from-primary-500 to-purple-500 px-4 py-2 font-semibold text-white">
                  <Plus className="mr-2 inline h-4 w-4" />
                  Add to Wardrobe
                </button>
                <button className="rounded-lg border border-gray-300 p-2 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">
                  <Heart className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </button>
                <button className="rounded-lg border border-gray-300 p-2 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">
                  <Share className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Perfume Info */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-colors duration-300 dark:border-gray-700 dark:bg-gray-800">
          <PerfumeInfo perfume={perfume} />
        </div>

        {/* Accords */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-colors duration-300 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold">Main Accords</h3>
          <AccordTags accords={perfume.accords} />
        </div>

        {/* Notes Pyramid */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-colors duration-300 dark:border-gray-700 dark:bg-gray-800">
          <NotesPyramid
            topNotes={perfume.topNotes}
            middleNotes={perfume.middleNotes}
            baseNotes={perfume.baseNotes}
          />
        </div>

        {/* AI Reviews Summary */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-colors duration-300 dark:border-gray-700 dark:bg-gray-800">
          <ReviewsSummary summary={reviewsSummary} />
        </div>

        {/* Rate & Review — SIGN-IN GATED */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-colors duration-300 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold">Rate This Fragrance</h3>

          {user ? (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <RatingSlider
                  label="Longevity"
                  value={userRating.longevity}
                  onChange={(v) => setUserRating((p) => ({ ...p, longevity: v }))}
                />
                <RatingSlider
                  label="Sillage"
                  value={userRating.sillage}
                  onChange={(v) => setUserRating((p) => ({ ...p, sillage: v }))}
                />
                <RatingSlider
                  label="Overall"
                  value={userRating.overall}
                  onChange={(v) => setUserRating((p) => ({ ...p, overall: v }))}
                />
              </div>

              <div className="mt-4">
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Write your review..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  rows={3}
                />
                <button className="mt-3 rounded-lg bg-gradient-to-r from-primary-500 to-purple-500 px-6 py-2 font-semibold text-white">
                  Submit Review
                </button>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-600 dark:border-gray-600 dark:text-gray-300">
              <p className="mb-3">
                Please sign in to rate longevity, sillage, and write your review.
              </p>
              <button
                onClick={() =>
                  open({
                    mode: 'signin',
                    reason: 'Sign in to rate & review this perfume',
                  })
                }
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary-500 to-purple-500 px-4 py-2 font-medium text-white"
              >
                <LogIn className="h-4 w-4" />
                Sign in to continue
              </button>
            </div>
          )}
        </div>

        {/* Similar Fragrances */}
        <SimilarFragrances
          fragrances={similarPerfumes}
          currentPerfumeId={numericId}
          userIsVerified={!!user}
        />

        {/* Reviews */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-colors duration-300 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold">
            <MessageSquare className="mr-2 inline h-5 w-5" />
            Recent Reviews
          </h3>
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="border-b border-gray-200 pb-4 last:border-b-0 transition-colors duration-300 dark:border-gray-700"
              >
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">{review.user}</h4>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <Star className="mr-1 h-3 w-3 fill-current text-yellow-400" />
                      {review.rating} | L: {review.longevity} | S: {review.sillage}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{review.date}</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{review.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfumePage;
