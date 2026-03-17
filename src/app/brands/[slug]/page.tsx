import { loadBrandDetail } from './loaders';
import BrandDetailClient from './BrandDetailClient';
import { notFound } from 'next/navigation';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.fragview.com';
  const url = `${BASE_URL}/brands/${slug}`;

  // Load brand data for richer metadata
  let brandName = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  let perfumeCount = 0;
  let brandDescription = '';

  try {
    const { getMongoDb } = await import('@/lib/mongodb');
    const db = await getMongoDb();
    const brand = await db.collection('brands').findOne(
      { slug },
      { projection: { name: 1, perfumes_count: 1, description: 1 } }
    );
    if (brand) {
      brandName = brand.name || brandName;
      perfumeCount = brand.perfumes_count || 0;
      brandDescription = brand.description || '';
    }
  } catch { /* non-blocking — fallback to slug-derived name */ }

  const title = `${brandName} Perfumes — Fragrance Collection | FragView`;
  const description = brandDescription
    ? `${brandDescription.slice(0, 140)} | FragView`
    : `Explore all ${perfumeCount > 0 ? `${perfumeCount}+ ` : ''}${brandName} fragrances on FragView — detailed reviews, notes, accords, and ratings for every ${brandName} perfume.`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function BrandDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const data = await loadBrandDetail(slug, resolvedSearchParams);
  if (!data) return notFound();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF9EF' }}>
      <BrandDetailClient
        brand={data.brand}
        perfumes={data.perfumes}
        meta={data.meta}
        filters={data.filters}
        pageSize={data.pageSize}
      />
    </div>
  );
}
