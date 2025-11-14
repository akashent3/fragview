'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Star, Leaf, Flower2, Sparkles } from 'lucide-react';
import type { BrandDoc, PerfumeDoc } from './loaders';

interface Props {
  brand: BrandDoc;
  perfumes: PerfumeDoc[];
  meta: { page: number; totalPages: number; total: number };
  filters: { gender: string; sort: string };
  pageSize: number;
}

export default function BrandDetailClient({ brand, perfumes, meta, filters, pageSize }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = meta.page;

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.set('page', '1');
    router.replace(`?${params.toString()}`);
  }

  function gotoPage(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.replace(`?${params.toString()}`);
  }

  return (
    <div>
      {/* Floating Botanical Elements - ADDED */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-32 right-20 animate-float">
          <Leaf size={20} className="text-green-300/20" />
        </div>
        <div className="absolute bottom-40 left-32 animate-float animate-delay-3">
          <Flower2 size={18} className="text-orange-300/20" />
        </div>
      </div>

      {/* Header - UPDATED WITH BOTANICAL THEME */}
      <div className="mb-8 glass-card rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-5">
          <Sparkles size={100} />
        </div>
        <div className="flex items-start gap-6 relative z-10">
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-orange-400 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg">
            {brand.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-orange-500 bg-clip-text text-transparent mb-2">
              {brand.name}
            </h1>
            {brand.country && (
              <p className="text-sm text-gray-600 mb-2">📍 {brand.country}</p>
            )}
            {brand.description && (
              <p className="max-w-3xl text-gray-700 leading-relaxed">
                {brand.description}
              </p>
            )}
            <div className="mt-4 flex items-center gap-4">
              <span className="px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                {meta.total} Fragrances
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters - UPDATED WITH BOTANICAL STYLING */}
      <div className="mb-6 flex flex-wrap gap-4 items-center glass-card rounded-xl p-4">
        <select
          value={filters.gender}
          onChange={(e) => updateParam('gender', e.target.value)}
          className="px-4 py-2 rounded-lg border border-green-200 bg-white/80 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors"
        >
          <option value="">All Genders</option>
          <option value="men">Men</option>
          <option value="women">Women</option>
          <option value="unisex">Unisex</option>
        </select>

        <select
          value={filters.sort}
          onChange={(e) => updateParam('sort', e.target.value)}
          className="px-4 py-2 rounded-lg border border-green-200 bg-white/80 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors"
        >
          <option value="az">A–Z</option>
          <option value="za">Z–A</option>
          <option value="rating">Rating</option>
          <option value="new">New</option>
        </select>

        <span className="ml-auto text-sm text-gray-600">
          Showing {perfumes.length} of {meta.total} perfumes
        </span>
      </div>

      {/* Perfumes Grid - UPDATED WITH GLASS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-5">
        {perfumes.map((p) => (
          <Link
            key={p._id}
            href={`/perfumes/${p.slug || p._id}`}
            className="group"
          >
            <div className="glass-card rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
              <div className="aspect-[3/4] w-full overflow-hidden bg-gradient-to-br from-green-50/50 to-orange-50/50 relative">
                {p.image ? (
                  <img
                    src={p.image}
                    alt={`${p.variant_name} by ${p.brand_name}`}
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Sparkles className="w-12 h-12 text-green-300" />
                  </div>
                )}
                {/* Corner decoration */}
                <div className="absolute top-2 right-2 opacity-30">
                  <Leaf size={20} className="text-green-500" />
                </div>
              </div>
              <div className="p-3">
                <div className="text-sm font-semibold text-gray-900 group-hover:text-green-600 transition-colors truncate">
                  {p.variant_name}
                </div>
                <div className="text-xs text-gray-600 truncate">{p.brand_name}</div>
                {typeof p.rating === 'number' && (
                  <div className="flex items-center mt-2">
                    <Star className="w-3 h-3 text-orange-400 fill-current" />
                    <span className="ml-1 text-xs text-gray-700">
                      {p.rating.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination - UPDATED WITH BOTANICAL COLORS */}
      {perfumes.length > 0 && (
        <div className="mt-8 flex items-center justify-center gap-2 text-sm">
          {page > 1 && (
            <button
              onClick={() => gotoPage(page - 1)}
              className="px-4 py-2 rounded-lg border border-green-200 bg-white/80 text-gray-700 hover:bg-green-50 transition-colors"
            >
              Previous
            </button>
          )}
          <span className="px-4 py-2 text-gray-700 font-medium">
            Page {page} of {meta.totalPages}
          </span>
          {page < meta.totalPages && (
            <button
              onClick={() => gotoPage(page + 1)}
              className="px-4 py-2 rounded-lg border border-green-200 bg-white/80 text-gray-700 hover:bg-green-50 transition-colors"
            >
              Next
            </button>
          )}
        </div>
      )}

      {perfumes.length === 0 && (
        <div className="py-12 text-center">
          <div className="glass-card rounded-xl p-8 inline-block">
            <Flower2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No perfumes match current filters.</p>
          </div>
        </div>
      )}
    </div>
  );
}