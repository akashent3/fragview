'use client';
import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { useAuthModal } from '@/components/auth/AuthModal';
import { Leaf } from 'lucide-react';

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
    <div className="rounded-xl border-2 border-dashed border-green-200 bg-green-50/30 p-6 text-center relative overflow-hidden">
      <div className="absolute top-0 right-0 opacity-10">
        <Leaf size={80} style={{ transform: 'rotate(-30deg)' }} />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900 relative z-10">You need an account</h3>
      <p className="mb-4 text-sm text-gray-600 relative z-10">
        {reason}
      </p>
      <div className="flex justify-center gap-2 relative z-10">
        <button
          onClick={() => open({ mode: 'signin', reason, onSuccess })}
          className="rounded-lg bg-gradient-to-r from-green-500 to-orange-500 px-4 py-2 text-sm font-medium text-white hover:shadow-lg transition-all"
        >
          Sign in
        </button>
        <button
          onClick={() => open({ mode: 'signup', reason, onSuccess })}
          className="rounded-lg border border-green-200 px-4 py-2 text-sm hover:bg-green-50 text-gray-700 transition-colors"
        >
          Create account
        </button>
      </div>
    </div>
  );
}