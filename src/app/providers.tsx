'use client';

import * as React from 'react';

// ⬇️ keep your existing providers
import { AuthProvider } from '@/lib/auth-context';
import { AuthModalProvider } from '@/components/auth/AuthModal';

// ⬇️ ADD THIS: wrap the app in MarketProvider so useMarket() works
import { MarketProvider } from '@/lib/market-context'; // if your file exports default, change to: import MarketProvider from '@/lib/market-context';

export default function RootProviders({ children }: { children: React.ReactNode }) {
  return (
    <MarketProvider>
      <AuthProvider>
        <AuthModalProvider>
          {children}
        </AuthModalProvider>
      </AuthProvider>
    </MarketProvider>
  );
}
