'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import { signIn } from 'next-auth/react';
import { X, Eye, EyeOff, Leaf, Flower2, Sparkles } from 'lucide-react';
import { registerSchema, loginSchema } from '@/lib/validations';
import Link from 'next/link';

type OpenArgs = { mode?: 'signin' | 'signup'; reason?: string; onSuccess?: () => void; callbackUrl?: string };
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
  const [callbackUrl, setCallbackUrl] = useState<string | undefined>();

  const open = useCallback((args?: OpenArgs) => {
    setMode(args?.mode ?? 'signin');
    setReason(args?.reason);
    setOnSuccess(() => args?.onSuccess);
    // 🔧 NEW: Store callbackUrl to redirect after sign in
    setCallbackUrl(args?.callbackUrl || window.location.href);
    setVisible(true);
  }, []);
  const close = useCallback(() => setVisible(false), []);

  return (
    <Ctx.Provider value={{ open, close }}>
      {children}
      {visible && <AuthModalUI mode={mode} reason={reason} callbackUrl={callbackUrl} onClose={close} onSuccess={onSuccess} />}
    </Ctx.Provider>
  );
}

function AuthModalUI({
  mode: initialMode,
  reason,
  callbackUrl,
  onClose,
  onSuccess,
}: {
  mode: 'signin' | 'signup';
  reason?: string;
  callbackUrl?: string;
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
    // 🔧 CHANGED: Pass callbackUrl to NextAuth
    const res = await signIn('credentials', { 
      email, 
      password: pw, 
      redirect: false,
      callbackUrl: callbackUrl || '/',
    });
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
      // 🔧 CHANGED: Redirect to callbackUrl after successful sign in
      window.location.href = callbackUrl || '/';
    } catch (e: any) {
      setError(e?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      {/* BOTANICAL THEMED MODAL */}
      <div className="w-full max-w-md rounded-2xl shadow-2xl relative overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 opacity-10">
            <Flower2 size={120} />
          </div>
          <div className="absolute bottom-0 left-0 opacity-10">
            <Leaf size={100} style={{ transform: 'rotate(-30deg)' }} />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 p-6">
          {/* Header with Botanical Icon */}
          <div className="mb-6 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-orange-500 bg-clip-text text-transparent">
                  {mode === 'signin' ? 'Welcome Back' : 'Join FragView'}
                </h2>
              </div>
              {reason && <p className="text-sm text-gray-600">{reason}</p>}
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="rounded-full p-2 text-gray-500 hover:bg-green-50 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form Fields */}
          {mode === 'signup' && (
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full rounded-lg border border-green-200 bg-white/80 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
              />
            </div>
          )}

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-green-200 bg-white/80 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
            />
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-lg border border-green-200 bg-white/80 px-4 py-3 pr-12 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
              />
              <button
                type="button"
                aria-label={showPw ? 'Hide password' : 'Show password'}
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 transition-colors"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* 🔧 NEW: Forgot Password Link */}
          {mode === 'signin' && (
            <div className="mb-4 text-right">
              <Link
                href="/forgot-password"
                onClick={onClose}
                className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 mb-4">
            <button
              disabled={loading}
              onClick={() => run(mode === 'signin' ? doSignIn : doRegister)}
              className="w-full rounded-lg bg-gradient-to-r from-green-500 to-orange-500 px-4 py-3 font-semibold text-white disabled:opacity-60 hover:shadow-lg transition-all disabled:hover:shadow-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Please wait…
                </span>
              ) : (
                mode === 'signin' ? 'Sign in' : 'Create account'
              )}
            </button>
            
            <button
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setError(null);
              }}
              className="w-full text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              {mode === 'signin' ? "Don't have an account? Sign up" : 'Have an account? Sign in'}
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-green-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Sign In Button - BOTANICAL STYLED */}
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              // 🔧 CHANGED: Pass callbackUrl to Google OAuth
              signIn('google', { callbackUrl: callbackUrl || '/' });
            }}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 rounded-lg border-2 border-green-200 bg-white px-4 py-3 font-medium text-gray-700 hover:bg-green-50 disabled:opacity-60 transition-all hover:border-green-300 hover:shadow-md"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Terms text */}
          <p className="mt-4 text-center text-xs text-gray-500">
            By continuing, you agree to FragView's Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}