'use client';
import { useEffect } from 'react';
import { useAuthModal } from '@/components/auth/AuthModal';

export default function SignUpPage() {
  const { open } = useAuthModal();
  useEffect(() => { open({ mode: 'signup', reason: 'Create your FragView account' }); }, [open]);
  return <div className="p-6 text-sm text-gray-600 dark:text-gray-300">Opening sign up…</div>;
}
