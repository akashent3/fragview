'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

type BrandDoc = {
  _id: string;
  name: string;
  slug?: string;
  country?: string;
  description?: string;
};

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
    const qs = new URLSearchParams(searchParams.toString());
    if (value) qs.set(key, value);
    else qs.delete(key);
    qs.set('page', '1');
    router.replace(`/brands/${brand.slug || brand.name.toLowerCase().replace(/\s+/g, '-') }?${qs.toString()}`);
  }

  function gotoPage(newPage: number) {
    const qs = new URLSearchParams(searchParams.toString());
    qs.set('page', String(newPage));
    router.replace(`/brands/${brand.slug || brand.name.toLowerCase().replace(/\s+/g, '-') }?${qs.toString()}`);
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="h-20 w-20 rounded bg-gray-100 dark:bg-gray-800 mb-3" />
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{brand.name}</h1>
        {brand.country && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{brand.country}</p>
        )}
        {brand.description && (
          <p className="mt-2 max-w-2xl text-sm text-gray-700 dark:text-gray-300">
            {brand.description}
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col sm:flex-row gap-4">
        <select
          value={filters.sort}
          onChange={(e) => updateParam('sort', e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="az">Sort A–Z</option>
          <option value="za">Sort Z–A</option>
          <option value="rating">Sort by Rating</option>
          <option value="new">Newest</option>
        </select>

        <select
          value={filters.gender}
          onChange={(e) => updateParam('gender', e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Genders</option>
          <option value="men">Men</option>
          <option value="women">Women</option>
          <option value="unisex">Unisex</option>
        </select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {perfumes.map((p) => (
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

      {/* Pagination */}
      {perfumes.length > 0 && (
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          {page > 1 && (
            <button
              onClick={() => gotoPage(page - 1)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Previous
            </button>
          )}
          <span>
            Page {page} of {meta.totalPages}
          </span>
          {page < meta.totalPages && (
            <button
              onClick={() => gotoPage(page + 1)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Next
            </button>
          )}
        </div>
      )}

      {perfumes.length === 0 && (
        <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
          No perfumes match current filters.
        </div>
      )}
    </div>
  );
}