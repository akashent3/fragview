'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { AuthModalProvider } from '@/components/auth/AuthModal';
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
        <AuthModalProvider>{children}</AuthModalProvider>
      </SessionProvider>
    </MarketProvider>
  );
}