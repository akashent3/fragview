'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Search, Grid, List, Loader2, Trees, Leaf, Flower2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

type BrandItem = {
  _id: string;
  name: string;
  slug?: string;
  country?: string;
  description?: string;
  perfumes?: { name: string }[];
  perfumes_count?: number;
};

interface Props {
  initialItems: BrandItem[];
  total: number;
  meta: { page: number; totalPages: number; total: number };
  query: { q: string; sort: string; letter: string };
  pageSize: number;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function BrandsClient({ initialItems, total, meta, query, pageSize }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(query.q);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState(query.sort || 'name');
  const [selectedLetter, setSelectedLetter] = useState(query.letter || 'All');
  const [isSearching, setIsSearching] = useState(false); // 🔧 NEW: Loading state

  // Items are already server-paginated and filtered; do not re-filter by letter on client.
  const brands = initialItems;

  // Client-only resorting for some options to keep UI behavior
  const sortedBrands = useMemo(() => {
    const arr = [...brands];
    switch (sortBy) {
      case 'country':
        arr.sort((a, b) => (a.country || '').localeCompare(b.country || ''));
        break;
      case 'fragrances':
        arr.sort(
          (a, b) =>
            (b.perfumes_count ?? b.perfumes?.length ?? 0) -
            (a.perfumes_count ?? a.perfumes?.length ?? 0)
        );
        break;
      case 'founded':
        // No founded data; keep order
        break;
      case 'name':
      default:
        arr.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    return arr;
  }, [brands, sortBy]);

  // 🔧 CHANGED: Debounced search with loading state
  useEffect(() => {
    setIsSearching(true);
    const t = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      else params.delete('q');
      params.set('sort', sortBy);
      if (selectedLetter === 'All') params.delete('letter');
      else params.set('letter', selectedLetter);
      params.set('page', '1');
      router.replace(`/brands?${params.toString()}`);
      setIsSearching(false);
    }, 300);
    return () => {
      clearTimeout(t);
      setIsSearching(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, sortBy, selectedLetter]);

  function gotoPage(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.replace(`/brands?${params.toString()}`);
  }

  return (
    <div>
      {/* Floating Botanical Elements - ADDED */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-40 left-20 animate-float">
          <Trees size={24} className="text-green-300/20" />
        </div>
        <div className="absolute bottom-32 right-40 animate-float animate-delay-2">
          <Leaf size={20} className="text-orange-300/20" />
        </div>
      </div>

      {/* Header - UPDATED WITH BOTANICAL THEME */}
      <div className="glass-card rounded-2xl shadow-sm p-8 mb-8 border border-green-100/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-5">
          <Flower2 size={120} />
        </div>
        <div className="text-center mb-8 relative z-10">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-600 to-orange-500 bg-clip-text text-transparent">
            Explore Brands
          </h1>
          <p className="text-gray-600">
            Discover {total.toLocaleString()} fragrance brands from around the world
          </p>
        </div>

        {/* Alphabet Filter - UPDATED WITH BOTANICAL COLORS */}
        <div className="mb-6 relative z-10">
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setSelectedLetter('All')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                selectedLetter === 'All'
                  ? 'bg-gradient-to-r from-green-500 to-orange-500 text-white shadow-md'
                  : 'bg-white/60 text-gray-700 hover:bg-green-50'
              }`}
            >
              All
            </button>
            {ALPHABET.map((letter) => (
              <button
                key={letter}
                onClick={() => setSelectedLetter(letter)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  selectedLetter === letter
                    ? 'bg-gradient-to-r from-green-500 to-orange-500 text-white shadow-md'
                    : 'bg-white/60 text-gray-700 hover:bg-green-50'
                }`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Filters - UPDATED WITH BOTANICAL STYLING */}
        <div className="flex flex-col lg:flex-row gap-4 items-center relative z-10">
          {/* Search */}
          <div className="flex-1 w-full lg:max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/80 text-gray-800 transition-colors duration-300"
            />
            {/* 🔧 NEW: Loading indicator */}
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-green-600" />
            )}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-white/80 text-gray-800 transition-colors duration-300"
          >
            <option value="name">Name (A-Z)</option>
            <option value="fragrances">Most Fragrances</option>
            <option value="country">Country</option>
          </select>

          {/* View Mode - UPDATED WITH BOTANICAL COLORS */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-gradient-to-r from-green-500 to-orange-500 text-white'
                  : 'bg-white/60 text-gray-700 hover:bg-green-50'
              }`}
              aria-label="Grid view"
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-gradient-to-r from-green-500 to-orange-500 text-white'
                  : 'bg-white/60 text-gray-700 hover:bg-green-50'
              }`}
              aria-label="List view"
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {sortedBrands.length} of {total.toLocaleString()} brands
        {searchQuery && ` for "${searchQuery}"`}
        {selectedLetter !== 'All' && ` starting with "${selectedLetter}"`}
      </div>

      {/* Brands Grid/List - UPDATED WITH GLASS CARDS AND BOTANICAL THEME */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {sortedBrands.map((brand) => (
            <Link
              key={brand._id}
              href={`/brands/${brand.slug || brand._id}`}
              className="glass-card rounded-2xl border border-green-100/50 p-6 hover:shadow-lg hover:border-green-300 transition-all duration-300 group hover:scale-[1.02]"
            >
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-orange-400 rounded-full flex items-center justify-center mr-3 group-hover:rotate-12 transition-transform duration-300">
                  <span className="text-white font-bold text-lg">
                    {brand.name.charAt(0)}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                  {brand.name}
                </h3>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                {brand.country && <span>📍 {brand.country}</span>}
                <span>🧴 {brand.perfumes_count ?? brand.perfumes?.length ?? 0} fragrances</span>
              </div>
              {brand.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {brand.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="space-y-4 mb-8">
          {sortedBrands.map((brand) => (
            <Link
              key={brand._id}
              href={`/brands/${brand.slug || brand._id}`}
              className="glass-card rounded-xl border border-green-100/50 p-6 hover:shadow-lg hover:border-green-300 transition-all duration-300 group flex items-center"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-orange-400 rounded-full flex items-center justify-center mr-4 group-hover:rotate-12 transition-transform duration-300 flex-shrink-0">
                <span className="text-white font-bold text-lg">
                  {brand.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                  {brand.name}
                </h3>
                {brand.description && (
                  <p className="text-sm text-gray-600 line-clamp-1 mb-2">
                    {brand.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {brand.country && <span>📍 {brand.country}</span>}
                  <span>🧴 {brand.perfumes_count ?? brand.perfumes?.length ?? 0} fragrances</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* No Results */}
      {sortedBrands.length === 0 && !isSearching && (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">
            No brands found matching your criteria.
          </p>
        </div>
      )}

      {/* Pagination - UPDATED WITH BOTANICAL COLORS */}
      {meta.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => gotoPage(meta.page - 1)}
            disabled={meta.page === 1}
            className="px-4 py-2 rounded-lg border border-green-200 bg-white/80 text-gray-700 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
              let pageNum: number;
              if (meta.totalPages <= 5) {
                pageNum = i + 1;
              } else if (meta.page <= 3) {
                pageNum = i + 1;
              } else if (meta.page >= meta.totalPages - 2) {
                pageNum = meta.totalPages - 4 + i;
              } else {
                pageNum = meta.page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => gotoPage(pageNum)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    meta.page === pageNum
                      ? 'bg-gradient-to-r from-green-500 to-orange-500 text-white'
                      : 'border border-green-200 bg-white/80 text-gray-700 hover:bg-green-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => gotoPage(meta.page + 1)}
            disabled={meta.page === meta.totalPages}
            className="px-4 py-2 rounded-lg border border-green-200 bg-white/80 text-gray-700 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}