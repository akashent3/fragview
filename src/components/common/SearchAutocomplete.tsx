'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, Loader2, Sparkles } from 'lucide-react';

interface AutocompleteProps {
  placeholder?: string;
  onSelect?: (item: any) => void;
  className?: string;
}

export default function SearchAutocomplete({
  placeholder = 'Search fragrances, brands...',
  onSelect,
  className = '',
}: AutocompleteProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ brands: any[]; perfumes: any[] }>({
    brands: [],
    perfumes: [],
  });
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults({ brands: [], perfumes: [] });
      setIsOpen(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/autocomplete?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
        setIsOpen(true);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (item: any, type: 'brand' | 'perfume') => {
    if (onSelect) {
      onSelect({ ...item, type });
    }
    setQuery('');
    setIsOpen(false);
  };

  const hasResults = results.brands.length > 0 || results.perfumes.length > 0;

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && hasResults && setIsOpen(true)}
          className="w-full rounded-full border border-green-200 bg-white/80 px-10 py-2 text-gray-900 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-400 placeholder:text-gray-400"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-green-600" />
        )}
      </div>

      {/* Autocomplete Dropdown - BOTANICAL THEME */}
      {isOpen && hasResults && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 max-h-96 overflow-y-auto rounded-lg border border-green-200 bg-white/95 backdrop-blur-sm shadow-lg">
          {/* Brands Section */}
          {results.brands.length > 0 && (
            <div>
              <div className="border-b border-green-100 bg-green-50/50 px-3 py-2 text-xs font-semibold uppercase text-green-700 flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                Brands ({results.brands.length})
              </div>
              {results.brands.map((brand) => (
                <Link
                  key={brand._id}
                  href={`/brands/${brand.slug || brand._id}`}
                  onClick={() => handleSelect(brand, 'brand')}
                  className="block border-b border-green-50 px-4 py-3 transition-colors hover:bg-green-50"
                >
                  <div className="font-medium text-gray-900">{brand.name}</div>
                  <div className="text-xs text-gray-600">
                    {brand.country && `${brand.country} • `}
                    {brand.perfumes_count || 0} fragrances
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Perfumes Section */}
          {results.perfumes.length > 0 && (
            <div>
              <div className="border-b border-green-100 bg-orange-50/50 px-3 py-2 text-xs font-semibold uppercase text-orange-700 flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                Perfumes ({results.perfumes.length})
              </div>
              {results.perfumes.map((perfume) => (
                <Link
                  key={perfume._id}
                  href={`/perfumes/${perfume.slug || perfume._id}`}
                  onClick={() => handleSelect(perfume, 'perfume')}
                  className="block border-b border-green-50 px-4 py-3 transition-colors hover:bg-green-50"
                >
                  <div className="font-medium text-gray-900">
                    {perfume.variant_name}
                  </div>
                  <div className="text-xs text-gray-600">
                    {perfume.brand_name}
                    {perfume.gender && ` • ${perfume.gender}`}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* No Results - BOTANICAL THEME */}
      {isOpen && !loading && query.length >= 2 && !hasResults && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-lg border border-green-200 bg-white/95 backdrop-blur-sm p-4 text-center text-sm text-gray-600 shadow-lg">
          No results found for "{query}"
        </div>
      )}
    </div>
  );
}