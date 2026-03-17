import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.fragview.com';

export const metadata: Metadata = {
  title: 'Search Fragrances — Find Perfumes by Brand, Note & Accord | FragView',
  description:
    'Search and filter 10,000+ fragrances on FragView. Find perfumes by brand, gender, scent notes, accords, longevity, sillage, and rating. Discover your next signature scent.',
  alternates: { canonical: `${BASE_URL}/search` },
  openGraph: {
    title: 'Search Fragrances | FragView',
    description: 'Find your perfect fragrance. Search and filter 10,000+ perfumes by brand, notes, accords, and ratings on FragView.',
    url: `${BASE_URL}/search`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Search Fragrances | FragView',
    description: 'Find your perfect fragrance. Search 10,000+ perfumes by brand, notes, accords and ratings.',
  },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
