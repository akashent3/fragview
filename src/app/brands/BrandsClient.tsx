'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Search, Grid, List } from 'lucide-react';
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

  // Push query params to URL on changes (server refetch, page reset to 1)
  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      else params.delete('q');
      params.set('sort', sortBy);
      if (selectedLetter === 'All') params.delete('letter');
      else params.set('letter', selectedLetter);
      params.set('page', '1');
      router.replace(`/brands?${params.toString()}`);
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, sortBy, selectedLetter]);

  function gotoPage(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.replace(`/brands?${params.toString()}`);
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 mb-8 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
            Brand Directory
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto transition-colors duration-300">
            Explore fragrance houses from around the world and discover their iconic scents
          </p>
        </div>

        {/* Search / Sort / View */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search brands or countries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white transition-colors duration-300"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white transition-colors duration-300"
            >
              <option value="name">Sort by Name</option>
              <option value="country">Sort by Country</option>
              <option value="founded">Sort by Founded</option>
              <option value="fragrances">Sort by Fragrances</option>
            </select>

            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 transition-colors duration-300 ${
                  viewMode === 'grid'
                    ? 'bg-primary-500 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
                aria-label="Grid view"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 transition-colors duration-300 ${
                  viewMode === 'list'
                    ? 'bg-primary-500 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* A–Z Filter: make ALL letters clickable; server handles filtering */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 transition-colors duration-300">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 transition-colors duration-300">
            Browse by Letter:
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedLetter('All')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ${
                selectedLetter === 'All'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              All
            </button>
            {ALPHABET.map((letter) => (
              <button
                key={letter}
                onClick={() => setSelectedLetter(letter)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ${
                  selectedLetter === letter
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
          Showing {sortedBrands.length} of {total} brands
          {selectedLetter !== 'All' && ` starting with "${selectedLetter}"`}
        </p>
      </div>

      {/* Grid / List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedBrands.map((brand) => {
            const slug = brand.slug || brand.name.toLowerCase().replace(/\s+/g, '-');
            return (
              <Link key={brand._id} href={`/brands/${slug}`}>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group border border-gray-100 dark:border-gray-700">
                  <div className="h-48 bg-gradient-to-br from-pastel-blue to-pastel-purple opacity-20 dark:opacity-30" />
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {brand.name}
                      </h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded transition-colors duration-300">
                        {brand.country || '—'}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 transition-colors duration-300">
                      {brand.description || 'No description available.'}
                    </p>
                    <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                      <span>Perfumes: {brand.perfumes_count ?? brand.perfumes?.length ?? 0}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedBrands.map((brand) => {
            const slug = brand.slug || brand.name.toLowerCase().replace(/\s+/g, '-');
            return (
              <Link key={brand._id} href={`/brands/${slug}`}>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 group border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center space-x-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-pastel-blue to-pastel-purple rounded-lg opacity-20 dark:opacity-30" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {brand.name}
                        </h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded transition-colors duration-300">
                          {brand.country || '—'}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-3 transition-colors duration-300">
                        {brand.description || 'No description available.'}
                      </p>
                      <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                        <span>Perfumes: {brand.perfumes_count ?? brand.perfumes?.length ?? 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {sortedBrands.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg transition-colors duration-300">
            No brands found matching your criteria.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedLetter('All');
              setSortBy('name');
              router.replace('/brands');
            }}
            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium mt-2 transition-colors duration-300"
          >
            Clear filters and try again
          </button>
        </div>
      )}

      {/* Pagination */}
      {sortedBrands.length > 0 && (
        <div className="mt-10 flex justify-center gap-4 text-sm text-gray-600 dark:text-gray-300">
          {meta.page > 1 && (
            <button
              onClick={() => gotoPage(meta.page - 1)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Previous
            </button>
          )}
          <span className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
            Page {meta.page} of {meta.totalPages}
          </span>
          {meta.page < meta.totalPages && (
            <button
              onClick={() => gotoPage(meta.page + 1)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Next
            </button>
          )}
        </div>
      )}
    </div>
  );
}