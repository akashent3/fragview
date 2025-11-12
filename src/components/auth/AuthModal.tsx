'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import { signIn } from 'next-auth/react';
import { X, Eye, EyeOff } from 'lucide-react';
import { registerSchema, loginSchema } from '@/lib/validations';

type OpenArgs = { mode?: 'signin' | 'signup'; reason?: string; onSuccess?: () => void };
type ModalCtx = { open: (args?: OpenArgs) => void; close: () => void };

const Ctx = createContext<ModalCtx | undefined>(undefined);

export function useAuthModal() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuthModal must be used within <AuthModalProvider>');
  return ctx;
}

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [reason, setReason] = useState<string | undefined>();
  const [onSuccess, setOnSuccess] = useState<(() => void) | undefined>();

  const open = useCallback((args?: OpenArgs) => {
    setMode(args?.mode ?? 'signin');
    setReason(args?.reason);
    setOnSuccess(() => args?.onSuccess);
    setVisible(true);
  }, []);
  const close = useCallback(() => setVisible(false), []);

  return (
    <Ctx.Provider value={{ open, close }}>
      {children}
      {visible && <AuthModalUI mode={mode} reason={reason} onClose={close} onSuccess={onSuccess} />}
    </Ctx.Provider>
  );
}

function AuthModalUI({
  mode: initialMode,
  reason,
  onClose,
  onSuccess,
}: {
  mode: 'signin' | 'signup';
  reason?: string;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);

  async function doRegister() {
    const v = registerSchema.safeParse({ email, username: name || email.split('@')[0], password: pw });
    if (!v.success) throw new Error(v.error.issues[0]?.message ?? 'Invalid input');
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username: name || email.split('@')[0], password: pw }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || 'Registration failed');
    return data;
  }

  async function doSignIn() {
    const v = loginSchema.safeParse({ email, password: pw });
    if (!v.success) throw new Error(v.error.issues[0]?.message ?? 'Invalid input');
    const res = await signIn('credentials', { email, password: pw, redirect: false });
    if (res?.error) {
      if (res.error.toLowerCase().includes('verify')) throw new Error('Please verify your email first.');
      throw new Error('Invalid email or password.');
    }
    return res;
  }

  async function run<T>(fn: () => Promise<T>) {
    setLoading(true);
    setError(null);
    try {
      await fn();
      onClose();
      onSuccess?.();
      // Force refresh so session-aware UI updates
      window.location.href = '/';
    } catch (e: any) {
      setError(e?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {mode === 'signin' ? 'Sign in' : 'Create your account'}
            </h2>
            {reason && <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">{reason}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {mode === 'signup' && (
          <div className="mb-3">
            <label className="mb-1 block text-sm text-gray-700 dark:text-gray-300">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
        )}

        <div className="mb-3">
          <label className="mb-1 block text-sm text-gray-700 dark:text-gray-300">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>

        {/* Password with eye toggle (UI preserved, only enhancement added) */}
        <div className="mb-4">
          <label className="mb-1 block text-sm text-gray-700 dark:text-gray-300">Password</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 pr-10 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
            <button
              type="button"
              aria-label={showPw ? 'Hide password' : 'Show password'}
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-3 rounded-lg border border-red-300 bg-red-50 p-2 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-200">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between">
          <button
            disabled={loading}
            onClick={() => run(mode === 'signin' ? doSignIn : doRegister)}
            className="rounded-lg bg-gradient-to-r from-primary-500 to-purple-500 px-4 py-2 font-medium text-white disabled:opacity-60"
          >
            {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
          <button
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setError(null);
            }}
            className="text-sm text-gray-600 underline-offset-2 hover:underline dark:text-gray-300"
          >
            {mode === 'signin' ? "Don't have an account? Sign up" : 'Have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}