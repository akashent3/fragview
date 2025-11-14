'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { AuthModalProvider } from '@/components/auth/AuthModal';
import { AuthProvider } from '@/lib/auth-context'; // ✅ ADDED THIS IMPORT
import { MarketProvider } from '@/lib/market-context';

// Accept the server session passed from layout so initial client state is correct.
export default function RootProviders({
  children,
  session,
}: {
  children: React.ReactNode;
  session: any;
}) {
  return (
    <MarketProvider>
      <SessionProvider session={session}>
        <AuthProvider> {/* ✅ ADDED THIS WRAPPER */}
          <AuthModalProvider>{children}</AuthModalProvider>
        </AuthProvider> {/* ✅ ADDED THIS WRAPPER */}
      </SessionProvider>
    </MarketProvider>
  );
}