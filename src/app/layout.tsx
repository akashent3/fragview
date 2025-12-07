import type { Metadata } from 'next';
import { Playfair_Display } from 'next/font/google'; // 1. Import the font tool
import './globals.css';

import RootProviders from './providers';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// 2. REMOVE THIS LINE: export const dynamic = 'force-dynamic'; 
// Why? This line prevents Vercel from caching your site. By removing it, 
// your site can serve instant copies of pages.

// 3. Configure the font here instead of in the <head>
const playfair = Playfair_Display({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair', // Optional: if you use Tailwind variables
});

export const metadata: Metadata = {
  title: 'FragView — Perfume Reviews & Discovery',
  description:
    'Discover, review, and explore the world of fragrances with FragView - your modern perfume review platform',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className={playfair.className}> 
      <head>
        {/* 4. Removed the manual Google Font links here. 
           Next.js handles it automatically now with the code above. */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-16x16.png" sizes="16x16" type="image/png" />
        <link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className="min-h-screen">
        <RootProviders session={session}>
          <div className="min-h-screen bg-gradient-to-br from-pastel-blue/10 to-pastel-purple/10 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
            <Navbar />
            <main className="pt-16">{children}</main>
            <Footer />
          </div>
        </RootProviders>
      </body>
    </html>
  );
}