import { loadPerfumeDetail } from './loaders';
import PerfumeDetailClient from './PerfumeDetailClient';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { cookies } from 'next/headers';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  const data = await loadPerfumeDetail(params.slug, session?.user?.id);
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
  // ✅ OPTIMIZATION: Only check session if cookie exists (saves 150-250ms for non-logged-in users)
  const cookieStore = cookies();
  const sessionToken = cookieStore.get('next-auth.session-token') || cookieStore.get('__Secure-next-auth.session-token');
  
  let session = null;
  let currentUserId: string | undefined;
  
  if (sessionToken) {
    // Only call getServerSession if user has a session cookie
    session = await getServerSession(authOptions);
    currentUserId = session?.user?.id;
  }
  
  const data = await loadPerfumeDetail(params.slug, currentUserId);
  if (!data) return notFound();

  const isSignedIn = !!session?.user;
  const canRate = isSignedIn;

  const { perfume, rating, reviewCount, reviews, isFollowingThread } = data;
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
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#FAFFF5' }}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-green-200/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-200/10 rounded-full blur-3xl animate-pulse animate-delay-2" />
      </div>
      
      <div className="relative z-10">
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
          initialIsFollowing={isFollowingThread}
        />
      </div>
    </div>
  );
}