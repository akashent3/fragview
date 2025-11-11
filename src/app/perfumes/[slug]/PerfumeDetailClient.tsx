'use client';
import React, { useState, useTransition } from 'react';
import { Star, Heart, Share, Plus, MessageSquare, LogIn } from 'lucide-react';
import NotesPyramid from '@/components/ui/NotesPyramid';
import AccordTags from '@/components/ui/AccordTags';
import RatingSlider from '@/components/ui/RatingSlider';
import SimilarFragrances from '@/components/ui/SimilarFragrances';
import PerfumeInfo from '@/components/ui/PerfumeInfo';
import ReviewsSummary from '@/components/ui/ReviewsSummary';
import { useAuthModal } from '@/components/auth/AuthModal';
import { submitReview } from './actions';

interface PerfumeDoc {
  _id: string;
  brand_name: string;
  variant_name: string;
  slug?: string;
  gender?: string;
  rating?: number;
  image?: string;
  accords?: { name: string; width?: number; strength?: number }[];
  pyramids?: { top?: string[]; middle?: string[]; base?: string[] };
  perfumers?: string[];
  description?: string;
  longevity?: number;
  sillage?: number;
}

interface ReviewLite {
  rating: number;
  text?: string | null;
  createdAt: string;
}

interface Props {
  perfume: PerfumeDoc;
  rating: number;
  isSignedIn: boolean;
  canRate: boolean;
  reviews: ReviewLite[];
  reviewCount: number;
  slug: string;
}

export default function PerfumeDetailClient({
  perfume,
  rating,
  isSignedIn,
  canRate,
  reviews,
  reviewCount,
  slug,
}: Props) {
  const { open } = useAuthModal();
  const [overall, setOverall] = useState<number>(4);
  const [longevity, setLongevity] = useState<number>(3.5);
  const [sillage, setSillage] = useState<number>(3.5);
  const [reviewText, setReviewText] = useState('');
  const [pending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const numericId = Number.isFinite(Number(perfume.slug)) ? Number(perfume.slug) : -1;

  const transformedAccords =
    perfume.accords?.map((a) => ({
      name: a.name,
      strength:
        typeof a.strength === 'number'
          ? a.strength
          : a.width
          ? Math.round(Math.min(5, Math.max(1, (a.width / 100) * 5)))
          : 3,
    })) || [];

  const topNotes = perfume.pyramids?.top?.map((n) => ({ name: n })) || [];
  const middleNotes = perfume.pyramids?.middle?.map((n) => ({ name: n })) || [];
  const baseNotes = perfume.pyramids?.base?.map((n) => ({ name: n })) || [];

  const perfumeInfo = {
    id: perfume._id,
    name: perfume.variant_name,
    brand: perfume.brand_name,
    year: undefined,
    perfumer: perfume.perfumers?.join(', ') || undefined,
    gender: perfume.gender || '—',
    rating,
    reviewCount,
    longevity: perfume.longevity || 0,
    sillage: perfume.sillage || 0,
    price: '—',
    availability: '—',
    description: perfume.description || 'No description available.',
    concentration: '—',
    season: [] as string[],
    occasions: [] as string[],
    topNotes,
    middleNotes,
    baseNotes,
    accords: transformedAccords,
  };

  const reviewsSummary = {
    totalReviews: reviewCount,
    averageRating: rating,
    sentiment: 'neutral' as const,
    keyPoints: [] as string[],
    commonWords: [] as { word: string; frequency: number }[],
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    aiSummary:
      reviewCount > 0
        ? 'User reviews will be summarized here in Phase 3.'
        : 'No reviews yet. Be the first to review!',
  };

  const similarPerfumes = [
    { id: 2, name: 'Bleu de Chanel', brand: 'Chanel', rating: 4.4, isVerified: true },
    { id: 3, name: 'Acqua di Gio', brand: 'Giorgio Armani', rating: 4.1, addedBy: 'fragrancelover' },
  ];

  async function handleSubmit(formData: FormData) {
    setErrorMessage(null);
    setSuccessMessage(null);
    startTransition(async () => {
      // Only overall persists (schema limitation)
      formData.set('rating', String(overall));
      const result = await submitReview(slug, formData);
      if (!result.ok) setErrorMessage(result.error || 'Failed to submit review.');
      else {
        setSuccessMessage('Review submitted! Page refreshed.');
        setReviewText('');
      }
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 text-gray-900 transition-colors duration-300 dark:bg-gray-900 dark:text-gray-100">
      <div className="mx-auto max-w-4xl space-y-5 px-4">
        {/* Header Card (unchanged) */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-colors duration-300 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex flex-col gap-6 md:flex-row">
            <div className="h-64 w-full rounded-2xl bg-gradient-to-br from-pastel-blue to-pastel-purple opacity-20 dark:opacity-30 md:w-48 overflow-hidden">
              {perfume.image && (
                <img
                  src={perfume.image}
                  alt={`${perfume.variant_name} by ${perfume.brand_name}`}
                  className="h-full w-full object-cover rounded-2xl"
                />
              )}
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold">{perfume.variant_name}</h1>
                <p className="text-xl font-semibold text-primary-600 dark:text-primary-400">
                  {perfume.brand_name}
                </p>
                <div className="mt-2 flex items-center space-x-4">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 fill-current text-yellow-400" />
                    <span className="ml-1 text-lg font-semibold">{rating.toFixed(2)}</span>
                  </div>
                  <span className="text-gray-500 dark:text-gray-400">
                    ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Gender:</span>{' '}
                  <span className="ml-2 font-medium">{perfume.gender || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Longevity:</span>{' '}
                  <span className="ml-2 font-medium">{(perfume.longevity ?? 0).toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Sillage:</span>{' '}
                  <span className="ml-2 font-medium">{(perfume.sillage ?? 0).toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Perfumer(s):</span>{' '}
                  <span className="ml-2 font-medium">
                    {perfume.perfumers?.join(', ') || '—'}
                  </span>
                </div>
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
          <PerfumeInfo perfume={perfumeInfo} />
        </div>

        {/* Accords */}
        {transformedAccords.length > 0 && (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-colors duration-300 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold">Main Accords</h3>
            <AccordTags accords={transformedAccords} />
          </div>
        )}

        {/* Notes Pyramid */}
        {(topNotes.length || middleNotes.length || baseNotes.length) > 0 && (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-colors duration-300 dark:border-gray-700 dark:bg-gray-800">
            <NotesPyramid topNotes={topNotes} middleNotes={middleNotes} baseNotes={baseNotes} />
          </div>
        )}

        {/* AI Reviews Summary */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-colors duration-300 dark:border-gray-700 dark:bg-gray-800">
          <ReviewsSummary summary={reviewsSummary} />
        </div>

        {/* Rate & Review */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-colors duration-300 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold">Rate This Fragrance</h3>
          {!isSignedIn ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-600 dark:border-gray-600 dark:text-gray-300">
              <p className="mb-3">Please sign in to rate and review.</p>
              <button
                onClick={() =>
                  open({ mode: 'signin', reason: 'Sign in to rate & review this perfume' })
                }
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary-500 to-purple-500 px-4 py-2 font-medium text-white"
              >
                <LogIn className="h-4 w-4" />
                Sign in to continue
              </button>
            </div>
          ) : !canRate ? (
            <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-900 dark:border-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-200">
              Your account is not allowed to rate/review yet.
            </div>
          ) : (
            <form action={(fd) => handleSubmit(fd)} className="space-y-4">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <RatingSlider label="Longevity" value={longevity} onChange={setLongevity} />
                <RatingSlider label="Sillage" value={sillage} onChange={setSillage} />
                <RatingSlider label="Overall" value={overall} onChange={setOverall} />
              </div>
              {/* Only overall persists */}
              <textarea
                name="text"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Write your review..."
                className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                rows={3}
              />
              {errorMessage && (
                <div className="text-sm text-red-600 dark:text-red-400">{errorMessage}</div>
              )}
              {successMessage && (
                <div className="text-sm text-green-600 dark:text-green-400">{successMessage}</div>
              )}
              <button
                disabled={pending}
                className="mt-2 rounded-lg bg-gradient-to-r from-primary-500 to-purple-500 px-6 py-2 font-semibold text-white disabled:opacity-60"
              >
                {pending ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}
        </div>

        {/* Similar Fragrances */}
        <SimilarFragrances
          fragrances={similarPerfumes}
          currentPerfumeId={numericId}
          userIsVerified={canRate}
        />

        {/* Reviews List */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-colors duration-300 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold">
            <MessageSquare className="mr-2 inline h-5 w-5" />
            Latest Reviews
          </h3>
          {reviews.length === 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-300">No reviews yet.</p>
          )}
          <div className="space-y-4">
            {reviews.map((r, i) => (
              <div key={i} className="border-b border-gray-200 pb-4 last:border-0 dark:border-gray-700">
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                  <Star className="h-4 w-4 fill-current text-yellow-400" />
                  {r.rating.toFixed(1)}
                </div>
                {r.text && <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{r.text}</p>}
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {new Date(r.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}