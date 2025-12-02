'use client';

import { useState, useEffect, useRef } from 'react';
import { ThumbsUp, ThumbsDown, Plus, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useAuthModal } from '@/components/auth/AuthModal';

interface SimilarFragrance {
  perfumeId: string;
  name: string;
  brand: string;
  image: string | null;
  slug: string;
  upvotes: number;
  downvotes: number;
  userVote: string | null;
  similarityScore: number;
}

interface SearchResult {
  _id: string;
  variant_name: string;
  brand_name: string;
  image: string;
  slug: string;
}

interface Props {
  currentPerfumeId: string;
}

export default function SimilarFragrances({ currentPerfumeId }: Props) {
  const { data: session } = useSession();
  const { open } = useAuthModal();
  
  const [fragrances, setFragrances] = useState<SimilarFragrance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    fetchSimilarFragrances();
  }, [currentPerfumeId]);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      searchPerfumes();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (! container) return;

    const checkScroll = () => {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
      );
    };

    checkScroll();
    container.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);

    return () => {
      container.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [fragrances]);

  const fetchSimilarFragrances = async () => {
    try {
      const response = await fetch(`/api/similar-fragrances?perfumeId=${currentPerfumeId}`);
      const data = await response.json();
      setFragrances(data.fragrances || []);
    } catch (error) {
      console.error('Error fetching similar fragrances:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchPerfumes = async () => {
    setSearching(true);
    try {
      const response = await fetch(
        `/api/perfumes/search-similar?q=${encodeURIComponent(searchQuery)}&exclude=${currentPerfumeId}`
      );
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Error searching perfumes:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleVote = async (perfumeId: string, voteType: 'UP' | 'DOWN') => {
    if (!session) {
      open({ mode: 'signin', reason: 'Sign in to vote on similar fragrances' });
      return;
    }

    try {
      const response = await fetch('/api/similar-fragrances/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourcePerfumeId: currentPerfumeId,
          similarPerfumeId: perfumeId,
          voteType,
        }),
      });

      if (response.ok) {
        fetchSimilarFragrances();
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleAddSimilar = async (perfumeId: string) => {
    if (!session) {
      open({ mode: 'signin', reason: 'Sign in to suggest similar fragrances' });
      return;
    }

    try {
      const response = await fetch('/api/similar-fragrances/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourcePerfumeId: currentPerfumeId,
          targetPerfumeId: perfumeId,
        }),
      });

      if (response.ok) {
        setShowAddModal(false);
        setSearchQuery('');
        setSearchResults([]);
        fetchSimilarFragrances();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to add similar fragrance');
      }
    } catch (error) {
      console.error('Error adding similar fragrance:', error);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 250;
    const newScrollLeft = direction === 'left' 
      ? container.scrollLeft - scrollAmount 
      : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth',
    });
  };

  const getStrengthColor = (score: number): string => {
    if (score >= 70) return 'from-green-500 to-emerald-500';
    if (score >= 40) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-rose-500';
  };

  if (loading) {
    return (
      <div className="glass-card rounded-xl p-4 shadow-sm">
        <div className="animate-pulse">
          <div className="h-5 bg-white/20 rounded w-1/4 mb-3"></div>
          <div className="flex gap-3 overflow-hidden">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="min-w-[140px] h-48 bg-white/20 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="glass-card rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">Similar Fragrances</h3>
          <button
            onClick={() => {
              if (! session) {
                open({ mode: 'signin', reason: 'Sign in to suggest similar fragrances' });
                return;
              }
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Similar</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>

        {fragrances.length === 0 ? (
          <div className="text-center py-8 bg-white/40 rounded-xl border-2 border-dashed border-green-200">
            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm text-gray-600 font-medium mb-1">No similar fragrances yet</p>
            <p className="text-xs text-gray-500">Be the first to suggest one!</p>
          </div>
        ) : (
          <div className="relative">
            {/* Left Arrow */}
            {canScrollLeft && (
              <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow-md flex items-center justify-center transition-all"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
            )}

            {/* Horizontal Scroll Container */}
            <div
              ref={scrollContainerRef}
              className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {fragrances.map((frag) => (
                <div
                  key={frag.perfumeId}
                  className="flex-shrink-0 w-[140px] bg-white/60 backdrop-blur-sm rounded-lg p-2.5 border border-white/40 hover:shadow-md transition-all"
                >
                  {/* Perfume Image - FIXED SIZE */}
                  <a href={`/perfumes/${frag.slug}`} className="block mb-2">
                    <div className="w-full h-[140px] rounded-md overflow-hidden bg-gradient-to-br from-green-50 to-orange-50 border border-green-100 relative">
                      {frag.image ?  (
                        <Image
                          src={frag.image}
                          alt={frag.name}
                          fill
                          sizes="140px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl text-gray-400">
                          ✨
                        </div>
                      )}
                    </div>
                  </a>

                  {/* Perfume Info - COMPACT */}
                  <div className="space-y-1.5">
                    <a
                      href={`/perfumes/${frag.slug}`}
                      className="font-semibold text-gray-800 hover:text-green-600 transition-colors text-xs leading-tight line-clamp-2 block"
                    >
                      {frag.name}
                    </a>
                    <p className="text-[10px] text-gray-600 truncate">{frag.brand}</p>

                    {/* Similarity Strength - MINIMAL */}
                    <div>
                      <div className="h-1 bg-gray-200 rounded-full overflow-hidden mb-1">
                        <div
                          className={`h-full bg-gradient-to-r ${getStrengthColor(frag.similarityScore)} transition-all`}
                          style={{ width: `${frag.similarityScore}%` }}
                        />
                      </div>
                      <div className="text-[9px] font-bold text-gray-700 text-center">
                        {frag.similarityScore}%
                      </div>
                    </div>

                    {/* Vote Buttons - COMPACT */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        onClick={() => handleVote(frag.perfumeId, 'UP')}
                        disabled={! session}
                        className={`flex-1 flex items-center justify-center gap-0.5 px-1.5 py-1 rounded text-[10px] font-semibold transition-all ${
                          frag.userVote === 'UP'
                            ? 'bg-green-500 text-white'
                            : 'bg-white/80 text-gray-700 hover:bg-green-100 border border-green-200'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <ThumbsUp className="w-2.5 h-2.5" />
                        <span>{frag.upvotes}</span>
                      </button>

                      <button
                        onClick={() => handleVote(frag.perfumeId, 'DOWN')}
                        disabled={!session}
                        className={`flex-1 flex items-center justify-center gap-0.5 px-1.5 py-1 rounded text-[10px] font-semibold transition-all ${
                          frag.userVote === 'DOWN'
                            ? 'bg-red-500 text-white'
                            : 'bg-white/80 text-gray-700 hover:bg-red-100 border border-red-200'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <ThumbsDown className="w-2.5 h-2.5" />
                        <span>{frag.downvotes}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Arrow */}
            {canScrollRight && (
              <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow-md flex items-center justify-center transition-all"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add Similar Modal - UNCHANGED */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-green-50/95 to-orange-50/95 backdrop-blur-xl rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl border border-white/40">
            <div className="p-6 border-b border-green-100 bg-white/40">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Plus className="w-6 h-6 text-green-600" />
                  Add Similar Fragrance
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="p-2 hover:bg-white/60 rounded-lg transition-all"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for a perfume..."
                  className="w-full pl-12 pr-4 py-3 bg-white/80 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  autoFocus
                />
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[400px]">
              {searching && (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 font-medium">Searching...</p>
                </div>
              )}

              {! searching && searchQuery.length >= 2 && searchResults.length === 0 && (
                <div className="text-center py-12 bg-white/40 rounded-xl">
                  <p className="text-gray-600 font-medium">No perfumes found</p>
                  <p className="text-sm text-gray-500 mt-1">Try a different search term</p>
                </div>
              )}

              {! searching && searchResults.length > 0 && (
                <div className="space-y-2">
                  {searchResults.map((result) => (
                    <button
                      key={result._id}
                      onClick={() => handleAddSimilar(result._id)}
                      className="w-full flex items-center gap-4 p-4 bg-white/60 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-orange-50 transition-all text-left border border-transparent hover:border-green-200"
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-green-50 to-orange-50 shrink-0 border border-green-100 relative">
                        {result.image ? (
                          <Image
                            src={result.image}
                            alt={result.variant_name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl text-gray-400">
                            ✨
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate">
                          {result.variant_name}
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                          {result.brand_name}
                        </p>
                      </div>
                      <Plus className="w-5 h-5 text-green-600 shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {! searching && searchQuery.length < 2 && (
                <div className="text-center py-12 bg-white/40 rounded-xl">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">Start typing to search</p>
                  <p className="text-sm text-gray-500 mt-1">Enter at least 2 characters</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
}