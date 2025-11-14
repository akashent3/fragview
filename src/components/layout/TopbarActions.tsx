'use client';
import Link from 'next/link';
import { useAuthModal } from '@/components/auth/AuthModal';
import { useSession, signOut } from 'next-auth/react';

export default function TopbarActions() {
  const { data: session, status } = useSession();
  const { open } = useAuthModal();

  const user = session?.user;

  return (
    <div className="flex items-center gap-3">
      {status === 'loading' && (
        <div className="h-5 w-24 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
      )}

      {status !== 'loading' && user && (
        <div className="flex items-center gap-3">
          <Link
            className="underline-offset-2 hover:underline text-sm text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
            href="/profile"
          >
            @{user.username || user.email?.split('@')[0]}
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="rounded-md border border-green-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 transition-all hover:bg-green-50 dark:hover:bg-gray-800 hover:border-green-300"
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
            className="underline-offset-2 hover:underline text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded-sm px-1 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            onClick={(e) => {
              e.preventDefault();
              open({ mode: 'signup', reason: 'Create your FragView account' });
            }}
            className="rounded-md bg-gradient-to-r from-green-500 to-orange-500 px-3 py-1.5 text-white font-medium shadow-sm hover:shadow-md transition-all hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
          >
            Sign up
          </Link>
        </div>
      )}
    </div>
  );
}