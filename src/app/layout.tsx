import type { Metadata } from 'next';
import './globals.css';
import RootProviders from './providers';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'FragView — Perfume Reviews & Discovery',
  description:
    'Discover, review, and explore the world of fragrances with FragView - your modern perfume review platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Keep your site’s light/dark look; don’t duplicate RootLayout definitions */}
      <body className="min-h-screen">
        <RootProviders>
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
