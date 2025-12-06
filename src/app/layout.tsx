import type { Metadata } from 'next';
import './globals.css';

import RootProviders from './providers';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'FragView — Perfume Reviews & Discovery',
  description:
    'Discover, review, and explore the world of fragrances with FragView - your modern perfume review platform',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <head>
        {/* 🚀 Performance Optimizations */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://lh3.googleusercontent.com" />
        
        {/* Favicons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-16x16.png" sizes="16x16" type="image/png" />
        <link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
  
        {/* 🚀 Optimized Font Loading */}
        <link 
          rel="preload" 
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap" 
          as="style"
        />
        <link 
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap" 
          rel="stylesheet"
        />
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