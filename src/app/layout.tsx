import type { Metadata, Viewport } from 'next';
import { Averia_Serif_Libre, Hedvig_Letters_Serif, Inter } from 'next/font/google';
import './globals.css';

import RootProviders from './providers';
import Navbar from '@/components/layout/Navbar';
import NewFooter from '@/components/layout/NewFooter';
// Old Footer commented out, using NewFooter with Pre-Footer section
// import Footer from '@/components/layout/Footer';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// 2. REMOVE THIS LINE: export const dynamic = 'force-dynamic'; 
// Why? This line prevents Vercel from caching your site. By removing it, 
// your site can serve instant copies of pages.

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const hedvig = Hedvig_Letters_Serif({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-hedvig',
});

const averia = Averia_Serif_Libre({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  display: 'swap',
  variable: '--font-averia',
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.fragview.com';

export const metadata: Metadata = {
  // ── Core ──────────────────────────────────────────────────────────────────
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'FragView — Perfume Reviews & Discovery',
    template: '%s | FragView',
  },
  description:
    'Discover, review, and explore the world of fragrances with FragView — your modern perfume review and discovery platform with 10,000+ fragrances, honest reviews, and a personal scent wardrobe.',

  // ── Keywords (helps AI + older search engines) ────────────────────────────
  keywords: [
    'perfume reviews', 'fragrance discovery', 'cologne reviews',
    'best perfumes', 'fragrance notes', 'perfume ratings',
    'niche fragrances', 'fragrance wardrobe', 'scent recommendations',
    'perfume database', 'fragview',
  ],

  // ── Authorship & Publisher ─────────────────────────────────────────────────
  authors: [{ name: 'FragView', url: BASE_URL }],
  creator: 'FragView',
  publisher: 'FragView',

  // ── Canonical & Alternates ────────────────────────────────────────────────
  alternates: { canonical: BASE_URL },

  // ── Robots ────────────────────────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' },
  },

  // ── OpenGraph ─────────────────────────────────────────────────────────────
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BASE_URL,
    siteName: 'FragView',
    title: 'FragView — Perfume Reviews & Discovery',
    description:
      'Discover, review, and explore the world of fragrances with FragView — 10,000+ perfumes, honest community reviews, and a personal scent wardrobe.',
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'FragView — Perfume Reviews & Discovery',
      },
    ],
  },

  // ── Twitter / X Card ──────────────────────────────────────────────────────
  twitter: {
    card: 'summary_large_image',
    title: 'FragView — Perfume Reviews & Discovery',
    description:
      'Discover, review, and explore the world of fragrances — 10,000+ perfumes and honest reviews on FragView.',
    images: [`${BASE_URL}/og-image.png`],
    site: '@fragview',
  },

  // ── Verification (add your actual tokens here) ────────────────────────────
  verification: {
     google: 'HLYv4HF9j1U9e9ka0yLepbCpoFCLiXoY_LyhOAoXdto',
     yandex: '159266d085aa7447',
   },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className={`${inter.variable} ${hedvig.variable} ${averia.variable}`}> 
      <head>
        {/* ✅ PERF: Preconnect to Google Fonts origins so the font
            DNS lookup + TLS handshake finishes before the browser
            even sees the font URL — saves 100-150 ms on LCP */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-16x16.png" sizes="16x16" type="image/png" />
        <link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.webp" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* ── SEO: Organization schema (tells Google who runs this site) ── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'FragView',
              url: BASE_URL,
              logo: `${BASE_URL}/logo.svg`,
              sameAs: [
                // Add your social profiles here
                // 'https://twitter.com/fragview',
                // 'https://instagram.com/fragview',
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'customer support',
                url: `${BASE_URL}/contact`,
              },
            }),
          }}
        />

        {/* ── SEO: WebSite schema with SearchAction (enables Google Sitelinks Searchbox) ── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'FragView',
              url: BASE_URL,
              description: 'Discover, review, and explore the world of fragrances — 10,000+ perfumes and honest reviews.',
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
                },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </head>
      <body className="min-h-screen">
        <RootProviders session={session}>
          <div className="min-h-screen bg-gradient-to-br from-pastel-blue/10 to-pastel-purple/10 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
            <Navbar />
            <main className="pt-[108px] lg:pt-[119px]">{children}</main>
            <NewFooter />
          </div>
        </RootProviders>
      </body>
    </html>
  );
}