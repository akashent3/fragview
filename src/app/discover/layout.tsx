import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.fragview.com';

export const metadata: Metadata = {
  title: 'Discover Fragrances — Trending & Curated Picks | FragView',
  description:
    'Discover trending, top-rated, and seasonal fragrances on FragView. Explore curated perfume recommendations tailored to mood, occasion, and style.',
  alternates: { canonical: `${BASE_URL}/discover` },
  openGraph: {
    title: 'Discover Fragrances — Trending & Curated Picks | FragView',
    description: 'Explore trending and curated fragrance recommendations — find your next favourite scent on FragView.',
    url: `${BASE_URL}/discover`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Discover Fragrances | FragView',
    description: 'Trending and curated fragrance picks. Discover your next favourite scent on FragView.',
  },
};

export default function DiscoverLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
