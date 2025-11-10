'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

function VerifyEmailInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email…');
  const once = useRef(false);

  useEffect(() => {
    if (once.current) return;
    once.current = true;
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link.');
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/api/verify-email?token=${encodeURIComponent(token)}`);
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          setStatus('success');
          setMessage(data?.message || 'Email verified! Redirecting…');
          setTimeout(() => router.push('/signin?verified=true'), 1500);
        } else {
            setStatus('error');
            setMessage(data?.error || 'Verification failed.');
        }
      } catch {
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
      }
    })();
  }, [router, token]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 pb-24 pt-10">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-sm transition-colors duration-300 dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-4 flex items-center justify-center">
          {status === 'loading' && (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </div>
          )}
          {status === 'success' && (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          )}
          {status === 'error' && (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          )}
        </div>

        <h1 className="mb-2 text-center text-xl font-semibold text-gray-800 dark:text-gray-100">
          {status === 'loading' && 'Verifying Email'}
          {status === 'success' && 'Email Verified'}
          {status === 'error' && 'Verification Failed'}
        </h1>

        <p className="mb-6 text-center text-sm text-gray-600 dark:text-gray-400">
          {message}
        </p>

        {status === 'error' && (
          <div className="space-y-3">
            <Link
              href="/signin"
              className="block w-full rounded-full bg-gradient-to-r from-primary-500 to-purple-500 px-4 py-2 text-center text-sm font-medium text-white transition-shadow hover:shadow-md"
            >
              Try Signing In
            </Link>
            <Link
              href="/signup"
              className="block w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-700 transition-colors hover:border-primary-500 hover:text-primary-600 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-primary-400 dark:hover:text-primary-400"
            >
              Register Again
            </Link>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-2 text-center text-xs text-gray-500 dark:text-gray-400">
            <p>You will be redirected shortly.</p>
            <Link
              href="/signin?verified=true"
              className="inline-block rounded-full bg-gradient-to-r from-primary-500 to-purple-500 px-4 py-2 text-xs font-medium text-white transition-shadow hover:shadow-sm"
            >
              Go Now
            </Link>
          </div>
        )}

        {status === 'loading' && (
          <div className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
            Please wait…
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </div>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">Loading…</p>
          </div>
        </div>
      }
    >
      <VerifyEmailInner />
    </Suspense>
  );
}