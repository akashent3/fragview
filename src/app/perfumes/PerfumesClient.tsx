'use client';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { Search, X, Loader2, Sparkles, Leaf, Flower2, Droplets } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

type PerfumeDoc = {
  _id: string;
  brand_name: string;
  variant_name: string;
  slug?: string;
  image?: string;
  gender?: string;
  rating?: number;
};

interface Props {
  initialItems: PerfumeDoc[];
  total: number;
  meta: { page: number; totalPages: number; total: number };
  query: { q: string; gender: string; brand: string; sort: string };
  pageSize: number;
}

export default function PerfumesClient({ initialItems, total, meta, query, pageSize }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(query.q);
  const [gender, setGender] = useState(query.gender);
  const [brand, setBrand] = useState(query.brand);
  const [sort, setSort] = useState(query.sort || 'az');
  
  // 🔧 NEW: Brand filter autocomplete states
  const [brandSearch, setBrandSearch] = useState(query.brand || '');
  const [brandSuggestions, setBrandSuggestions] = useState<string[]>([]);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const brandInputRef = useRef<HTMLInputElement>(null);

  const items = initialItems;

  const sortedItems = useMemo(() => {
    const arr = [...items];
    if (sort === 'rating') {
      arr.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    } else if (sort === 'az') {
      arr.sort((a, b) => a.variant_name.localeCompare(b.variant_name));
    } else if (sort === 'za') {
      arr.sort((a, b) => b.variant_name.localeCompare(a.variant_name));
    }
    return arr;
  }, [items, sort]);

  // 🔧 NEW: Extract unique brands from current results
  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    items.forEach((item) => {
      if (item.brand_name) brands.add(item.brand_name);
    });
    return Array.from(brands).sort();
  }, [items]);

  // 🔧 NEW: Filter brand suggestions based on search
  useEffect(() => {
    if (!brandSearch.trim()) {
      setBrandSuggestions(availableBrands.slice(0, 5));
      return;
    }
    const filtered = availableBrands
      .filter((b) => b.toLowerCase().includes(brandSearch.toLowerCase()))
      .slice(0, 5);
    setBrandSuggestions(filtered);
  }, [brandSearch, availableBrands]);

  // 🔧 NEW: Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (brandInputRef.current && !brandInputRef.current.contains(event.target as Node)) {
        setShowBrandDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Main search/filter effect
  useEffect(() => {
    setIsSearching(true);
    const t = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (q.trim()) params.set('q', q.trim());
      else params.delete('q');
      if (gender) params.set('gender', gender);
      else params.delete('gender');
      if (brand) params.set('brand', brand);
      else params.delete('brand');
      params.set('sort', sort);
      params.set('page', '1');
      router.replace(`/perfumes?${params.toString()}`);
      setIsSearching(false);
    }, 300);
    return () => {
      clearTimeout(t);
      setIsSearching(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, gender, brand, sort]);

  function gotoPage(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.replace(`/perfumes?${params.toString()}`);
  }

  // 🔧 NEW: Handle brand selection
  function selectBrand(brandName: string) {
    setBrand(brandName);
    setBrandSearch(brandName);
    setShowBrandDropdown(false);
  }

  // 🔧 NEW: Clear brand filter
  function clearBrand() {
    setBrand('');
    setBrandSearch('');
    setBrandSuggestions(availableBrands.slice(0, 5));
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

      {/* Header / Filters - UPDATED WITH BOTANICAL THEME */}
      <div className="mb-6 space-y-4">
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-5">
            <Droplets size={100} />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-orange-500 bg-clip-text text-transparent mb-4 relative z-10">
            Explore Perfumes
          </h1>

          <div className="flex flex-col lg:flex-row gap-4 relative z-10">
            {/* 🔧 CHANGED: Perfume Search with loading indicator - BOTANICAL STYLING */}
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search perfumes or brands..."
                className="w-full pl-10 pr-10 py-2 rounded-lg border border-green-200 bg-white/80 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-green-600" />
              )}
            </div>

            {/* Gender Filter - BOTANICAL STYLING */}
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="px-4 py-2 rounded-lg border border-green-200 bg-white/80 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <option value="">All Genders</option>
              <option value="male">Men</option>
              <option value="female">Women</option>
              <option value="unisex">Unisex</option>
            </select>

            {/* 🔧 NEW: Brand Filter with Autocomplete - BOTANICAL STYLING */}
            <div className="relative flex-1 max-w-xs" ref={brandInputRef}>
              <input
                type="text"
                value={brandSearch}
                onChange={(e) => {
                  setBrandSearch(e.target.value);
                  setShowBrandDropdown(true);
                }}
                onFocus={() => setShowBrandDropdown(true)}
                placeholder="Filter by brand..."
                className="w-full px-4 py-2 pr-10 rounded-lg border border-green-200 bg-white/80 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              {brand && (
                <button
                  onClick={clearBrand}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {/* Brand Dropdown - BOTANICAL STYLING */}
              {showBrandDropdown && brandSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 z-50 max-h-60 overflow-y-auto rounded-lg border border-green-200 bg-white/95 backdrop-blur-sm shadow-lg">
                  {brandSuggestions.map((brandName) => (
                    <button
                      key={brandName}
                      onClick={() => selectBrand(brandName)}
                      className="w-full text-left px-4 py-2 hover:bg-green-50 text-gray-800 border-b border-green-100 last:border-b-0 transition-colors"
                    >
                      {brandName}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort - BOTANICAL STYLING */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-4 py-2 rounded-lg border border-green-200 bg-white/80 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <option value="az">Name (A-Z)</option>
              <option value="za">Name (Z-A)</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          {/* Active Filters - BOTANICAL COLORS */}
          {(q || gender || brand) && (
            <div className="flex flex-wrap gap-2 mt-4 relative z-10">
              {q && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">
                  Search: {q}
                  <button onClick={() => setQ('')} className="hover:text-red-500">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {gender && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm">
                  Gender: {gender}
                  <button onClick={() => setGender('')} className="hover:text-red-500">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {brand && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">
                  Brand: {brand}
                  <button onClick={clearBrand} className="hover:text-red-500">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {sortedItems.length} of {total.toLocaleString()} perfumes
      </div>

      {/* Perfumes Grid - UPDATED WITH GLASS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        {sortedItems.map((item) => (
          <Link
            key={item._id}
            href={`/perfumes/${item.slug || item._id}`}
            className="group glass-card rounded-2xl overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
          >
            <div className="aspect-square overflow-hidden bg-gradient-to-br from-green-50/50 to-orange-50/50 relative">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.variant_name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Sparkles className="w-16 h-16 text-green-300" />
                </div>
              )}
              {/* Corner decoration */}
              <div className="absolute top-2 right-2 opacity-30">
                <Leaf size={24} className="text-green-500" />
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-green-600 transition-colors line-clamp-2">
                {item.variant_name}
              </h3>
              <p className="text-sm text-gray-600 mb-2">{item.brand_name}</p>
              <div className="flex items-center justify-between">
                {item.gender && (
                  <span className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-green-100 to-orange-100 text-gray-700">
                    {item.gender}
                  </span>
                )}
                {item.rating && (
                  <span className="text-sm font-medium text-orange-600">
                    ⭐ {item.rating.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* No Results */}
      {sortedItems.length === 0 && !isSearching && (
        <div className="text-center py-12">
          <div className="glass-card rounded-xl p-8 inline-block">
            <Flower2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 text-lg">
              No perfumes found matching your criteria.
            </p>
          </div>
        </div>
      )}

      {/* Pagination - BOTANICAL COLORS */}
      {meta.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => gotoPage(meta.page - 1)}
            disabled={meta.page === 1}
            className="px-4 py-2 rounded-lg border border-green-200 bg-white/80 text-gray-700 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-700 font-medium">
            Page {meta.page} of {meta.totalPages}
          </span>
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