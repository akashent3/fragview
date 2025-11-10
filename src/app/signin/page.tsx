'use client';
import { useEffect } from 'react';
import { useAuthModal } from '@/components/auth/AuthModal';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function SignInPage() {
  const { open } = useAuthModal();
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/');
      return;
    }
    open({ mode: 'signin', reason: 'Sign in to continue' });
  }, [status, open, router]);

  return <div className="p-6 text-sm text-gray-600 dark:text-gray-300">Opening sign in…</div>;
}