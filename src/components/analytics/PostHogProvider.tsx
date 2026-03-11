'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react';
import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// ─────────────────────────────────────────────────────────────
// Page-view tracker
// Must be wrapped in <Suspense> because useSearchParams()
// opts the component into client-side rendering boundaries.
// ─────────────────────────────────────────────────────────────
function PostHogPageView() {
  const pathname   = usePathname();
  const searchParams = useSearchParams();
  const ph         = usePostHog();

  useEffect(() => {
    if (!pathname || !ph) return;

    let url = window.location.origin + pathname;
    if (searchParams.toString()) {
      url += `?${searchParams.toString()}`;
    }

    ph.capture('$pageview', { $current_url: url });
  }, [pathname, searchParams, ph]);

  return null;
}

// ─────────────────────────────────────────────────────────────
// Main provider — initialises PostHog once on mount
// ─────────────────────────────────────────────────────────────
export default function PostHogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const key  = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com';

    if (!key) {
      console.warn('[PostHog] NEXT_PUBLIC_POSTHOG_KEY is not set — analytics disabled.');
      return;
    }

    posthog.init(key, {
      api_host: host,

      // We fire $pageview manually via PostHogPageView so Next.js
      // route changes are captured correctly in the App Router.
      capture_pageview: false,

      // Fires $pageleave when the user navigates away.
      capture_pageleave: true,

      // ── Session Replay ────────────────────────────────────────
      session_recording: {
        // Mask password fields; keep everything else visible.
        maskAllInputs: false,
        maskInputOptions: { password: true },
      },

      // Only log debug info in development.
      loaded: (ph) => {
        if (process.env.NODE_ENV === 'development') ph.debug(false);
      },
    });
  }, []);

  return (
    <PHProvider client={posthog}>
      {/* Suspense required so useSearchParams doesn't break SSR */}
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PHProvider>
  );
}
