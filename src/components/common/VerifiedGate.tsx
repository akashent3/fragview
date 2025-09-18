'use client';
import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { useAuthModal } from '@/components/auth/AuthModal';

export default function VerifiedGate({
  children,
  onSuccess,
  reason = 'Sign in to continue',
}: {
  children: React.ReactNode;
  onSuccess?: () => void;
  reason?: string;
}) {
  const { user } = useAuth() as any;
  const { open } = useAuthModal();

  if (user) return <>{children}</>;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-900">
      <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">You need an account</h3>
      <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
        {reason}
      </p>
      <div className="flex justify-center gap-2">
        <button
          onClick={() => open({ mode: 'signin', reason, onSuccess })}
          className="rounded-md bg-primary px-3 py-1.5 text-sm text-white hover:opacity-90"
        >
          Sign in
        </button>
        <button
          onClick={() => open({ mode: 'signup', reason, onSuccess })}
          className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
        >
          Create account
        </button>
      </div>
    </div>
  );
}
