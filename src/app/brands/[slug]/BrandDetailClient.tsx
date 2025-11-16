'use client';
import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Star, Leaf, Flower2, Sparkles, MapPin, Globe, Package, ChevronDown, ChevronUp } from 'lucide-react';
import type { BrandDoc, PerfumeDoc } from './loaders';

interface Props {
  brand: BrandDoc;
  perfumes: PerfumeDoc[];
  meta: { page: number; totalPages: number; total: number };
  filters: { gender: string; collection: string; sort: string };
  pageSize: number;
}

export default function BrandDetailClient({ brand, perfumes: initialPerfumes, meta, filters: initialFilters, pageSize }: Props) {
  const [selectedGender, setSelectedGender] = useState(initialFilters.gender);
  const [selectedCollection, setSelectedCollection] = useState(initialFilters.collection);
  const [selectedSort, setSelectedSort] = useState(initialFilters.sort);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const collections = useMemo(() => {
    if (brand.collections_info && Array.isArray(brand.collections_info)) {
      return brand.collections_info;
    }
    return [];
  }, [brand.collections_info]);

  // CLIENT-SIDE FILTERING & SORTING
  const filteredAndSortedPerfumes = useMemo(() => {
    let result = [...initialPerfumes];

    // Filter by gender - Now uses brands.perfumes.gender values
    if (selectedGender) {
      result = result.filter(p => p.gender?.toLowerCase() === selectedGender.toLowerCase());
    }

    // Filter by collection
    if (selectedCollection) {
      result = result.filter(p => {
        if (!p.collection) return false;
        return p.collection.toLowerCase().includes(selectedCollection.toLowerCase());
      });
    }

    // Sort
    switch (selectedSort) {
      case 'az':
        result.sort((a, b) => (a.variant_name || '').localeCompare(b.variant_name || ''));
        break;
      case 'za':
        result.sort((a, b) => (b.variant_name || '').localeCompare(a.variant_name || ''));
        break;
      case 'new':
        result.sort((a, b) => (b.release_year || 0) - (a.release_year || 0));
        break;
      case 'old':
        result.sort((a, b) => (a.release_year || 0) - (b.release_year || 0));
        break;
    }

    return result;
  }, [initialPerfumes, selectedGender, selectedCollection, selectedSort]);

  const shortDescription = brand.description?.slice(0, 400) + '...' || '';
  const shouldShowViewMore = (brand.description?.length || 0) > 400;

  return (
    <div>
      {/* Floating Botanical Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-32 right-20 animate-float">
          <Leaf size={20} className="text-green-300/20" />
        </div>
        <div className="absolute bottom-40 left-32 animate-float animate-delay-3">
          <Flower2 size={18} className="text-orange-300/20" />
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* LEFT: Brand Header */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-5">
            <Sparkles size={120} />
          </div>
          
          <div className="flex items-start gap-6 relative z-10">
            <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-orange-400 rounded-2xl flex items-center justify-center text-white font-bold text-5xl shadow-lg flex-shrink-0">
              {brand.name.charAt(0).toUpperCase()}
            </div>
            
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {brand.name}
              </h1>
              
              {brand.country && (
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{brand.country}</span>
                </div>
              )}
              
              {brand.description && (
                <div>
                  <p className="text-gray-700 leading-relaxed">
                    {showFullDescription ? brand.description : shortDescription}
                  </p>
                  {shouldShowViewMore && (
                    <button
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="mt-2 inline-flex items-center gap-1 text-green-600 hover:text-green-700 font-medium text-sm transition-colors"
                    >
                      {showFullDescription ? (
                        <>View Less <ChevronUp className="w-4 h-4" /></>
                      ) : (
                        <>View More <ChevronDown className="w-4 h-4" /></>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Brand Information Sidebar */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-green-100 pb-2">
            Brand Information
          </h3>
          
          <div className="space-y-4">
            {brand.country && (
              <div>
                <div className="text-sm text-gray-600 mb-1">Headquarters</div>
                <div className="text-gray-900 font-medium">{brand.country}</div>
              </div>
            )}
            
            {brand.official_website && (
              <div>
                <div className="text-sm text-gray-600 mb-1">Website</div>
                <a 
                  href={brand.official_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700 font-medium inline-flex items-center gap-1 transition-colors break-all"
                >
                  <Globe className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">
                    {brand.official_website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                  </span>
                </a>
              </div>
            )}
            
            <div>
              <div className="text-sm text-gray-600 mb-1">Total Fragrances</div>
              <div className="text-gray-900 font-medium flex items-center gap-2">
                <Package className="w-4 h-4 text-green-600" />
                {meta.total}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* All Fragrances Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">All Fragrances</h2>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center glass-card rounded-xl p-4">
          {/* Gender Filter - FIXED: Only Men/Female/Unisex */}
          <select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors"
          >
            <option value="">All Genders</option>
            <option value="male">Men</option>
            <option value="female">Female</option>
            <option value="unisex">Unisex</option>
          </select>

          {/* Collections Filter */}
          <select
            value={selectedCollection}
            onChange={(e) => setSelectedCollection(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors"
          >
            <option value="">All Collections</option>
            {collections.map((col: any) => (
              <option key={col.name} value={col.name}>
                {col.name} {col.perfume_count ? `(${col.perfume_count})` : ''}
              </option>
            ))}
          </select>

          {/* Sort Filter */}
          <select
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors"
          >
            <option value="az">Name (A-Z)</option>
            <option value="za">Name (Z-A)</option>
            <option value="new">Year (Newest)</option>
            <option value="old">Year (Oldest)</option>
          </select>

          <span className="ml-auto text-sm text-gray-600">
            {filteredAndSortedPerfumes.length} of {initialPerfumes.length} fragrances
          </span>
        </div>
      </div>

      {/* Perfume Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredAndSortedPerfumes.map((p) => (
          <div
            key={p._id}
            className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
          >
            <Link href={`/perfumes/${p.slug || p._id}`}>
              <div className="aspect-[3/4] w-full overflow-hidden bg-gray-50 relative">
                {p.image || p.perfume_image ? (
                  <img
                    src={p.image || p.perfume_image}
                    alt={`${p.variant_name} by ${p.brand_name}`}
                    className="h-full w-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Sparkles className="w-12 h-12 text-gray-300" />
                  </div>
                )}
              </div>
            </Link>
            
            <div className="p-3">
              <Link href={`/perfumes/${p.slug || p._id}`}>
                <h3 className="text-sm font-semibold text-gray-900 hover:text-green-600 transition-colors truncate mb-1">
                  {p.variant_name}
                </h3>
              </Link>
              
              <p className="text-xs text-gray-600 truncate mb-1">{p.brand_name}</p>
              
              {p.release_year && (
                <p className="text-xs text-gray-500 mb-2">{p.release_year}</p>
              )}
              
              {typeof p.rating === 'number' && p.rating > 0 && (
                <div className="flex items-center gap-1 mb-3">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3 h-3 ${
                          star <= Math.round(p.rating!)
                            ? 'text-orange-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-700 font-medium">
                    {p.rating.toFixed(1)}
                  </span>
                </div>
              )}
              
              <Link href={`/perfumes/${p.slug || p._id}`}>
                <button className="w-full py-2 text-xs font-medium text-green-600 border border-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-colors">
                  View Details
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredAndSortedPerfumes.length === 0 && (
        <div className="py-12 text-center">
          <div className="glass-card rounded-xl p-8 inline-block">
            <Flower2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-2">No perfumes match current filters.</p>
            <p className="text-sm text-gray-500 mb-4">
              This brand has {initialPerfumes.length} perfumes total.
            </p>
            <button
              onClick={() => {
                setSelectedGender('');
                setSelectedCollection('');
                setSelectedSort('az');
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}