'use client';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { Search, X, Loader2 } from 'lucide-react';
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
      {/* Header / Filters */}
      <div className="mb-6 space-y-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Perfumes</h1>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* 🔧 CHANGED: Perfume Search with loading indicator */}
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search perfumes or brands..."
              className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-gray-400" />
            )}
          </div>

          {/* Gender Filter */}
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Genders</option>
            <option value="male">Men</option>
            <option value="female">Women</option>
            <option value="unisex">Unisex</option>
          </select>

          {/* 🔧 NEW: Brand Filter with Autocomplete */}
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
              className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {brand && (
              <button
                onClick={clearBrand}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {/* Brand Dropdown */}
            {showBrandDropdown && brandSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 z-50 max-h-60 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
                {brandSuggestions.map((brandName) => (
                  <button
                    key={brandName}
                    onClick={() => selectBrand(brandName)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                  >
                    {brandName}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="az">Name (A-Z)</option>
            <option value="za">Name (Z-A)</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>

        {/* Active Filters */}
        {(q || gender || brand) && (
          <div className="flex flex-wrap gap-2">
            {q && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm">
                Search: {q}
                <button onClick={() => setQ('')} className="hover:text-primary-900 dark:hover:text-primary-100">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {gender && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm">
                Gender: {gender}
                <button onClick={() => setGender('')} className="hover:text-primary-900 dark:hover:text-primary-100">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {brand && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm">
                Brand: {brand}
                <button onClick={clearBrand} className="hover:text-primary-900 dark:hover:text-primary-100">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Showing {sortedItems.length} of {total.toLocaleString()} perfumes
      </div>

      {/* Perfumes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        {sortedItems.map((item) => (
          <Link
            key={item._id}
            href={`/perfumes/${item.slug || item._id}`}
            className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:border-primary-500 dark:hover:border-primary-400 transition-all duration-300"
          >
            {item.image && (
              <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
                <img
                  src={item.image}
                  alt={item.variant_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                {item.variant_name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{item.brand_name}</p>
              <div className="flex items-center justify-between">
                {item.gender && (
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                    {item.gender}
                  </span>
                )}
                {item.rating && (
                  <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
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
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            No perfumes found matching your criteria.
          </p>
        </div>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => gotoPage(meta.page - 1)}
            disabled={meta.page === 1}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
            Page {meta.page} of {meta.totalPages}
          </span>
          <button
            onClick={() => gotoPage(meta.page + 1)}
            disabled={meta.page === meta.totalPages}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}