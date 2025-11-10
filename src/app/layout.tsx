import type { Metadata } from 'next';
import './globals.css';

import RootProviders from './providers';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// If you want to explicitly force dynamic behavior (ensure always fresh session):
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'FragView — Perfume Reviews & Discovery',
  description:
    'Discover, review, and explore the world of fragrances with FragView - your modern perfume review platform',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Fetch session on the server so the initial render knows if user is signed in.
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
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