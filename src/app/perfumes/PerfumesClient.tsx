'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
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

  useEffect(() => {
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
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, gender, brand, sort]);

  function gotoPage(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.replace(`/perfumes?${params.toString()}`);
  }

  return (
    <div>
      {/* Header / Filters */}
      <div className="mb-6 space-y-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Perfumes</h1>

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search perfumes or brands..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white transition-colors"
            />
          </div>

          <input
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="Filter by brand..."
            className="flex-1 max-w-xs px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white transition-colors"
          />

          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white transition-colors"
          >
            <option value="">All Genders</option>
            <option value="men">Men</option>
            <option value="women">Women</option>
            <option value="unisex">Unisex</option>
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white transition-colors"
          >
            <option value="az">A–Z</option>
            <option value="za">Z–A</option>
            <option value="new">Newest</option>
            <option value="rating">Highest Rating</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {sortedItems.map((p) => (
          <Link
            key={String(p._id)}
            href={`/perfumes/${p.slug}`}
            className="group block rounded-xl border border-gray-200 dark:border-gray-800 p-3 hover:shadow-sm transition"
          >
            <div className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
              {p.image ? (
                <img
                  src={p.image}
                  alt={`${p.variant_name} by ${p.brand_name}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full" />
              )}
            </div>
            <div className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              {p.variant_name}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{p.brand_name}</div>
            {typeof p.rating === 'number' && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Rating: {p.rating.toFixed(2)}
              </div>
            )}
          </Link>
        ))}
      </div>

      {sortedItems.length === 0 && (
        <div className="py-16 text-center text-sm text-gray-500 dark:text-gray-400">
          No perfumes match your filters.
        </div>
      )}

      {/* Pagination */}
      {sortedItems.length > 0 && (
        <div className="mt-8 flex justify-center gap-4 text-sm text-gray-600 dark:text-gray-300">
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