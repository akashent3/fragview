'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { AuthModalProvider } from '@/components/auth/AuthModal';
import { AuthProvider } from '@/lib/auth-context';
import { MarketProvider } from '@/lib/market-context';
import PostHogProvider from '@/components/analytics/PostHogProvider';

// Accept the server session passed from layout so initial client state is correct.
export default function RootProviders({
  children,
  session,
}: {
  children: React.ReactNode;
  session: any;
}) {
  return (
    <PostHogProvider>
      <MarketProvider>
        <SessionProvider session={session}>
          <AuthProvider>
            <AuthModalProvider>{children}</AuthModalProvider>
          </AuthProvider>
        </SessionProvider>
      </MarketProvider>
    </PostHogProvider>
  );
}