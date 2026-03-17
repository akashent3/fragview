import { loadPerfumeDetail } from './loaders';
import PerfumeDetailClient from './PerfumeDetailClient';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { cookies } from 'next/headers';
import { getPerfumeBySlug } from '@/lib/data/perfumes';
import { sanitizeSingleDoc } from '@/lib/sanitize';

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const { connectMongoDB } = await import('@/lib/mongodb');
    const { db } = await connectMongoDB();
    
    // ✅ PERF: Pre-build top 100 perfume pages at deploy time.
    //    Any slug not in this list still works via ISR (revalidate=3600),
    //    but the first visitor pays the generation cost instead of seeing
    //    a cached response instantly. More pre-built = faster for users.
    const perfumes = await db
      .collection('perfumes')
      .find({}, { projection: { slug: 1 } })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    return perfumes.map((p) => ({
      slug: p.slug,
    }));
  } catch (error) {
    console.error('Failed to generate static params:', error);
    return [];
  }
}

// 🚀 FIXED: params is now Promise
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  try {
    const { slug } = await params; // 🚀 AWAIT params
    
    const perfumeRaw = await getPerfumeBySlug(slug);
    if (! perfumeRaw) return {};
    
    const perfume = sanitizeSingleDoc(perfumeRaw);
    const rating = (perfume as any).rating || 0;
    const reviewCount = (perfume as any).votes || 0;
    
    const title = `${(perfume as any).variant_name} by ${(perfume as any).brand_name} | FragView`;
    const description =
      (perfume as any).description?.slice(0, 160) ||
      `${(perfume as any).variant_name} by ${(perfume as any).brand_name} – fragrance details, accords, notes, ratings, and reviews on FragView. `;
    const url = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.fragview.com'}/perfumes/${slug}`;
    
    const jsonLd: any = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: (perfume as any).variant_name,
      brand: (perfume as any).brand_name,
      description,
      image: (perfume as any).image || (perfume as any).perfume_image || undefined,
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
        images: (perfume as any).image
          ? [{ url: (perfume as any).image, width: 800, height: 800, alt: (perfume as any).variant_name }]
          : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: (perfume as any).image ? [(perfume as any).image] : [],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {};
  }
}

// 🚀 FIXED: params is now Promise
export default async function PerfumeDetailPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params; // 🚀 AWAIT params
  
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('next-auth.session-token') || 
                        cookieStore.get('__Secure-next-auth.session-token');
  
  let session = null;
  let currentUserId: string | undefined;
  
  if (sessionToken) {
    session = await getServerSession(authOptions);
    currentUserId = session?.user?.id;
  }
  
  const data = await loadPerfumeDetail(slug, currentUserId);
  if (!data) return notFound();

  const isSignedIn = !!session?.user;
  const canRate = isSignedIn;

  const { perfume, rating, reviewCount, reviews, isFollowingThread, userReview } = data;
  const url = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.fragview.com'}/perfumes/${slug}`;
  
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.fragview.com';

  // ── Product JSON-LD (enhanced) ───────────────────────────────────────────
  const jsonLd: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: perfume.variant_name,
    brand: {
      '@type': 'Brand',
      name: perfume.brand_name,
      url: perfume.brand_slug ? `${BASE_URL}/brands/${perfume.brand_slug}` : undefined,
    },
    description:
      perfume.description ||
      `${perfume.variant_name} by ${perfume.brand_name} fragrance profile on FragView.`,
    image: perfume.image || perfume.perfume_image || undefined,
    url,
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      priceCurrency: 'USD',
      url,
    },
  };

  if (reviewCount > 0) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: rating.toFixed(2),
      ratingCount: reviewCount,
      bestRating: '5',
      worstRating: '1',
    };
  }

  // ── BreadcrumbList JSON-LD (helps Google show breadcrumbs in search results) ──
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',     item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Perfumes', item: `${BASE_URL}/perfumes` },
      { '@type': 'ListItem', position: 3, name: perfume.brand_name, item: perfume.brand_slug ? `${BASE_URL}/brands/${perfume.brand_slug}` : `${BASE_URL}/brands` },
      { '@type': 'ListItem', position: 4, name: perfume.variant_name, item: url },
    ],
  };

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <PerfumeDetailClient
        perfume={data.perfume}
        rating={data.rating}
        isSignedIn={isSignedIn}
        canRate={canRate}
        reviews={data.reviews}
        reviewCount={data.reviewCount}
        slug={slug}
        initialIsFollowing={isFollowingThread}
        userReview={userReview}
      />
    </div>
  );
}