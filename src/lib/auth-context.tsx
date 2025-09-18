'use client';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type User = {
  id: string;
  email: string;
  username: string;
  displayName: string;
  verified?: boolean;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signInWithCredentials: (email: string, password: string) => Promise<User>;
  signUpWithCredentials: (name: string, email: string, password: string) => Promise<User>;
  signInWithGoogle: () => Promise<User>;
  signInWithApple: () => Promise<User>;
  updateProfile: (patch: Partial<User>) => Promise<User>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_KEY = 'fragview_users';
const SESSION_KEY = 'fragview_auth_user';

function readUsers(): Record<string, { email: string; name: string; password: string; verified?: boolean }> {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
  } catch {
    return {};
  }
}
function writeUsers(users: Record<string, any>) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
function toUser(email: string, name?: string): User {
  const username = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
  return {
    id: email,
    email,
    username,
    displayName: name || username,
    verified: true, // mock-verified so VerifiedGate paths work during dev
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // bootstrap session from localStorage (mock auth)
  useEffect(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(SESSION_KEY) : null;
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {}
    }
    setLoading(false);
  }, []);

  const api = useMemo<AuthContextType>(
    () => ({
      user,
      loading,

      async signUpWithCredentials(name, email, password) {
        const users = readUsers();
        if (users[email]) throw new Error('Account already exists. Please sign in.');
        users[email] = { email, name, password, verified: true };
        writeUsers(users);
        const u = toUser(email, name);
        localStorage.setItem(SESSION_KEY, JSON.stringify(u));
        setUser(u);
        return u;
      },

      async signInWithCredentials(email, password) {
        const users = readUsers();
        const rec = users[email];
        if (!rec || rec.password !== password) throw new Error('Invalid email or password.');
        const u = toUser(email, rec.name);
        localStorage.setItem(SESSION_KEY, JSON.stringify(u));
        setUser(u);
        return u;
      },

      async signInWithGoogle() {
        // mock OAuth success
        const email = 'google_user@example.com';
        const users = readUsers();
        if (!users[email]) {
          users[email] = { email, name: 'Google User', password: 'oauth', verified: true };
          writeUsers(users);
        }
        const u = toUser(email, users[email].name);
        localStorage.setItem(SESSION_KEY, JSON.stringify(u));
        setUser(u);
        return u;
      },

      async signInWithApple() {
        // mock OAuth success
        const email = 'apple_user@example.com';
        const users = readUsers();
        if (!users[email]) {
          users[email] = { email, name: 'Apple User', password: 'oauth', verified: true };
          writeUsers(users);
        }
        const u = toUser(email, users[email].name);
        localStorage.setItem(SESSION_KEY, JSON.stringify(u));
        setUser(u);
        return u;
      },

      async updateProfile(patch) {
        if (!user) throw new Error('Not signed in');
        const next = { ...user, ...patch };
        localStorage.setItem(SESSION_KEY, JSON.stringify(next));
        setUser(next);
        return next;
      },

      async signOut() {
        localStorage.removeItem(SESSION_KEY);
        setUser(null);
      },
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
