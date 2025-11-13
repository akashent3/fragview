'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, Loader2 } from 'lucide-react';

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
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && hasResults && setIsOpen(true)}
          className="w-full rounded-full border border-gray-300 bg-white px-10 py-2 text-gray-900 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && hasResults && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          {/* Brands Section */}
          {results.brands.length > 0 && (
            <div>
              <div className="border-b border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold uppercase text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
                Brands ({results.brands.length})
              </div>
              {results.brands.map((brand) => (
                <Link
                  key={brand._id}
                  href={`/brands/${brand.slug || brand._id}`}
                  onClick={() => handleSelect(brand, 'brand')}
                  className="block border-b border-gray-100 px-4 py-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                >
                  <div className="font-medium text-gray-900 dark:text-white">{brand.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
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
              <div className="border-b border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold uppercase text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
                Perfumes ({results.perfumes.length})
              </div>
              {results.perfumes.map((perfume) => (
                <Link
                  key={perfume._id}
                  href={`/perfumes/${perfume.slug || perfume._id}`}
                  onClick={() => handleSelect(perfume, 'perfume')}
                  className="block border-b border-gray-100 px-4 py-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                >
                  <div className="font-medium text-gray-900 dark:text-white">
                    {perfume.variant_name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {perfume.brand_name}
                    {perfume.gender && ` • ${perfume.gender}`}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* No Results */}
      {isOpen && !loading && query.length >= 2 && !hasResults && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-lg border border-gray-200 bg-white p-4 text-center text-sm text-gray-500 shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
          No results found for "{query}"
        </div>
      )}
    </div>
  );
}