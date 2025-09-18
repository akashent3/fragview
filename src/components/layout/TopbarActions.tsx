'use client';
import Link from 'next/link';
import MarketSwitch from '@/components/common/MarketSwitch';
import { useAuth } from '@/lib/auth-context';
import { useAuthModal } from '@/components/auth/AuthModal';

export default function TopbarActions() {
  const { user, signOut } = useAuth();
  const { open } = useAuthModal();

  return (
    <div className="flex items-center gap-3">
      {/* Keep your original MarketSwitch and links */}
      <MarketSwitch />

      {user ? (
        <div className="flex items-center gap-2">
          {/* Keep your link style; route to your chosen profile page */}
          <Link className="underline-offset-2 hover:underline" href="/profile">
            @{user.username}
          </Link>
          <button
            onClick={() => signOut()}
            className="rounded-md border px-2 py-1 text-xs hover:bg-muted dark:border-gray-700"
          >
            Sign out
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm">
          {/* Keep links visible; intercept click to open modal (no page jump) */}
          <Link
            href="/signin"
            onClick={(e) => {
              e.preventDefault();
              open({ mode: 'signin', reason: 'Sign in to continue' });
            }}
            className="underline-offset-2 hover:underline"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            onClick={(e) => {
              e.preventDefault();
              open({ mode: 'signup', reason: 'Create your FragView account' });
            }}
            className="rounded-md bg-primary px-2 py-1 text-white"
          >
            Sign up
          </Link>
        </div>
      )}
    </div>
  );
}
