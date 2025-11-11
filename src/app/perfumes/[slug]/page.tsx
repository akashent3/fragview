import { loadPerfumeDetail } from './loaders';
import PerfumeDetailClient from './PerfumeDetailClient';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const data = await loadPerfumeDetail(params.slug);
  if (!data) return {};
  const { perfume, rating, reviewCount } = data;
  const title = `${perfume.variant_name} by ${perfume.brand_name} | FragView`;
  const description =
    perfume.description?.slice(0, 160) ||
    `${perfume.variant_name} by ${perfume.brand_name} – fragrance details, accords, notes, ratings, and reviews on FragView.`;
  const url = `https://fragviewvercel.vercel.app/perfumes/${params.slug}`;
  const jsonLd: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: perfume.variant_name,
    brand: perfume.brand_name,
    description,
    image: perfume.image || perfume.perfume_image || undefined,
    url,
  };
  if (reviewCount > 0) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: rating.toFixed(2),
      ratingCount: reviewCount,
    };
  }
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      images: perfume.image ? [perfume.image] : undefined,
    },
  };
}

export default async function PerfumeDetailPage({ params }: { params: { slug: string } }) {
  const data = await loadPerfumeDetail(params.slug);
  if (!data) return notFound();

  const session = await getServerSession(authOptions);
  const isSignedIn = !!session?.user;
  const canRate = isSignedIn; // current business rule

  // JSON-LD injection (metadata API does not automatically add custom script tags)
  const { perfume, rating, reviewCount } = data;
  const url = `https://fragviewvercel.vercel.app/perfumes/${params.slug}`;
  const jsonLd: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: perfume.variant_name,
    brand: perfume.brand_name,
    description:
      perfume.description ||
      `${perfume.variant_name} by ${perfume.brand_name} fragrance profile on FragView.`,
    image: perfume.image || perfume.perfume_image || undefined,
    url,
  };
  if (reviewCount > 0) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: rating.toFixed(2),
      ratingCount: reviewCount,
    };
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PerfumeDetailClient
        perfume={data.perfume}
        rating={data.rating}
        isSignedIn={isSignedIn}
        canRate={canRate}
        reviews={data.reviews}
        reviewCount={data.reviewCount}
        slug={params.slug}
      />
    </>
  );
}