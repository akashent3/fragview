'use client';
import React, { useState, useTransition } from 'react';
import { Star, Heart, Share, Plus, MessageSquare, LogIn, Leaf, Flower2, Droplets, Wind, Sparkles } from 'lucide-react';
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
    year: 0,
    perfumer: perfume.perfumers?.join(', ') || '',
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
    sentiment: 'mixed' as const,
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
    <div className="py-4 text-gray-900">
      {/* Floating Botanical Elements - ADDED */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-32 right-20 animate-float">
          <Leaf size={20} className="text-green-300/20" />
        </div>
        <div className="absolute bottom-40 left-32 animate-float animate-delay-3">
          <Flower2 size={18} className="text-orange-300/20" />
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-5 px-4 relative z-10">
        {/* Header Card - BOTANICAL THEME */}
        <div className="glass-card rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-5">
            <Droplets size={150} />
          </div>
          <div className="flex flex-col gap-6 md:flex-row relative z-10">
            {/* Image container */}
            <div className="h-64 w-full rounded-2xl overflow-hidden md:w-48 relative bg-gradient-to-br from-green-50/50 to-orange-50/50">
              {perfume.image ? (
                <img
                  src={perfume.image}
                  alt={`${perfume.variant_name} by ${perfume.brand_name}`}
                  className="h-full w-full object-cover rounded-2xl"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <Sparkles className="w-16 h-16 text-green-300" />
                </div>
              )}
              <div className="absolute top-2 right-2 opacity-30">
                <Leaf size={30} className="text-green-500" />
              </div>
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-orange-500 bg-clip-text text-transparent">
                  {perfume.variant_name}
                </h1>
                <p className="text-xl font-semibold text-gray-700">
                  {perfume.brand_name}
                </p>
                <div className="mt-2 flex items-center space-x-4">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 fill-current text-orange-400" />
                    <span className="ml-1 text-lg font-semibold text-gray-800">{rating.toFixed(2)}</span>
                  </div>
                  <span className="text-gray-600">
                    ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Gender:</span>{' '}
                  <span className="ml-2 font-medium text-gray-800">{perfume.gender || '—'}</span>
                </div>
                <div className="flex items-center">
                  <Wind className="w-4 h-4 mr-1 text-green-600" />
                  <span className="text-gray-600">Longevity:</span>{' '}
                  <span className="ml-2 font-medium text-gray-800">{(perfume.longevity ?? 0).toFixed(2)}</span>
                </div>
                <div className="flex items-center">
                  <Droplets className="w-4 h-4 mr-1 text-orange-600" />
                  <span className="text-gray-600">Sillage:</span>{' '}
                  <span className="ml-2 font-medium text-gray-800">{(perfume.sillage ?? 0).toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Perfumer(s):</span>{' '}
                  <span className="ml-2 font-medium text-gray-800">
                    {perfume.perfumers?.join(', ') || '—'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 rounded-lg bg-gradient-to-r from-green-500 to-orange-500 px-4 py-2 font-semibold text-white hover:shadow-lg transition-all">
                  <Plus className="mr-2 inline h-4 w-4" />
                  Add to Wardrobe
                </button>
                <button className="rounded-lg border border-green-200 p-2 transition-all hover:bg-green-50">
                  <Heart className="h-5 w-5 text-gray-600" />
                </button>
                <button className="rounded-lg border border-green-200 p-2 transition-all hover:bg-green-50">
                  <Share className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Perfume Info - BOTANICAL THEME */}
        <div className="glass-card rounded-2xl p-6 shadow-sm">
          <PerfumeInfo perfume={perfumeInfo} />
        </div>

        {/* Accords - BOTANICAL THEME */}
        {transformedAccords.length > 0 && (
          <div className="glass-card rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-5">
              <Flower2 size={80} />
            </div>
            <h3 className="mb-4 text-lg font-semibold text-gray-800 relative z-10">Main Accords</h3>
            <div className="relative z-10">
              <AccordTags accords={transformedAccords} />
            </div>
          </div>
        )}

        {/* Notes Pyramid - BOTANICAL THEME */}
        {(topNotes.length || middleNotes.length || baseNotes.length) > 0 && (
          <div className="glass-card rounded-2xl p-6 shadow-sm">
            <NotesPyramid topNotes={topNotes} middleNotes={middleNotes} baseNotes={baseNotes} />
          </div>
        )}

        {/* AI Reviews Summary - BOTANICAL THEME */}
        <div className="glass-card rounded-2xl p-6 shadow-sm">
          <ReviewsSummary summary={reviewsSummary} />
        </div>

        {/* Rate & Review - BOTANICAL THEME */}
        <div className="glass-card rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 opacity-5">
            <Leaf size={100} style={{ transform: 'rotate(-30deg)' }} />
          </div>
          <h3 className="mb-4 text-lg font-semibold text-gray-800 relative z-10">Rate This Fragrance</h3>
          {!isSignedIn ? (
            <div className="rounded-xl border-2 border-dashed border-green-300 bg-green-50/50 p-4 text-sm text-gray-700 relative z-10">
              <p className="mb-3">Please sign in to rate and review.</p>
              <button
                onClick={() =>
                  open({ mode: 'signin', reason: 'Sign in to rate & review this perfume', callbackUrl: `/perfumes/${slug}` })
                }
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-orange-500 px-4 py-2 font-medium text-white hover:shadow-lg transition-all"
              >
                <LogIn className="h-4 w-4" />
                Sign in to continue
              </button>
            </div>
          ) : !canRate ? (
            <div className="rounded-xl border border-orange-300 bg-orange-50 p-4 text-sm text-orange-900 relative z-10">
              Your account is not allowed to rate/review yet.
            </div>
          ) : (
            <form action={(fd) => handleSubmit(fd)} className="space-y-4 relative z-10">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <RatingSlider label="Longevity" value={longevity} onChange={setLongevity} />
                <RatingSlider label="Sillage" value={sillage} onChange={setSillage} />
                <RatingSlider label="Overall" value={overall} onChange={setOverall} />
              </div>
              <textarea
                name="text"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Write your review..."
                className="w-full rounded-lg border border-green-200 px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/80 text-gray-800"
                rows={3}
              />
              {errorMessage && (
                <div className="text-sm text-red-600">{errorMessage}</div>
              )}
              {successMessage && (
                <div className="text-sm text-green-600">{successMessage}</div>
              )}
              <button
                disabled={pending}
                className="mt-2 rounded-lg bg-gradient-to-r from-green-500 to-orange-500 px-6 py-2 font-semibold text-white disabled:opacity-60 hover:shadow-lg transition-all"
              >
                {pending ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}
        </div>

        {/* Similar Fragrances - BOTANICAL THEME */}
        <SimilarFragrances
          fragrances={similarPerfumes}
          currentPerfumeId={numericId}
          userIsVerified={canRate}
        />

        {/* Reviews List - BOTANICAL THEME */}
        <div className="glass-card rounded-2xl p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">
            <MessageSquare className="mr-2 inline h-5 w-5 text-green-600" />
            Latest Reviews
          </h3>
          {reviews.length === 0 && (
            <p className="text-sm text-gray-600">No reviews yet.</p>
          )}
          <div className="space-y-4">
            {reviews.map((r, i) => (
              <div key={i} className="border-b border-green-100 pb-4 last:border-0">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Star className="h-4 w-4 fill-current text-orange-400" />
                  {r.rating.toFixed(1)}
                </div>
                {r.text && <p className="mt-1 text-sm text-gray-700">{r.text}</p>}
                <div className="mt-1 text-xs text-gray-500">
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