'use client';
import { useEffect } from 'react';
import { useAuthModal } from '@/components/auth/AuthModal';

export default function SignInPage() {
  const { open } = useAuthModal();
  useEffect(() => { open({ mode: 'signin', reason: 'Sign in to continue' }); }, [open]);
  return <div className="p-6 text-sm text-gray-600 dark:text-gray-300">Opening sign in…</div>;
}
