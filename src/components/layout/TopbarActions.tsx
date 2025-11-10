'use client';
import Link from 'next/link';
import MarketSwitch from '@/components/common/MarketSwitch';
import { useAuthModal } from '@/components/auth/AuthModal';
import { useSession, signOut } from 'next-auth/react';

export default function TopbarActions() {
  const { data: session, status } = useSession();
  const { open } = useAuthModal();

  const user = session?.user;

  return (
    <div className="flex items-center gap-3">
      <MarketSwitch />

      {status === 'loading' && (
        // Short-lived shimmer while session hydrates (will disappear immediately when SSR session is provided)
        <div className="h-5 w-24 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
      )}

      {status !== 'loading' && user && (
        <div className="flex items-center gap-3">
          <Link
            className="underline-offset-2 hover:underline text-sm text-gray-700 dark:text-gray-300"
            href="/profile"
          >
            @{user.username || user.email?.split('@')[0]}
          </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              Sign out
            </button>
        </div>
      )}

      {status !== 'loading' && !user && (
        <div className="flex items-center gap-3 text-sm">
          <Link
            href="/signin"
            onClick={(e) => {
              e.preventDefault();
              open({ mode: 'signin', reason: 'Sign in to continue' });
            }}
            className="underline-offset-2 hover:underline text-gray-700 dark:text-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-sm px-1"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            onClick={(e) => {
              e.preventDefault();
              open({ mode: 'signup', reason: 'Create your FragView account' });
            }}
            className="rounded-md bg-gradient-to-r from-primary-500 to-purple-500 px-3 py-1.5 text-white font-medium shadow-sm hover:shadow-md transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:focus-visible:ring-offset-gray-900"
          >
            Sign up
          </Link>
        </div>
      )}
    </div>
  );
}