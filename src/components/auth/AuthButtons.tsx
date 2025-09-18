"use client";
import { useAuth } from "@/lib/auth-context";

export default function AuthButtons() {
  const { signInWithOAuth } = useAuth();
  return (
    <div className="flex flex-col gap-2">
      <button onClick={() => signInWithOAuth("google")} className="w-full rounded-lg border px-4 py-2 hover:bg-muted">Continue with Google</button>
      <button onClick={() => signInWithOAuth("apple")} className="w-full rounded-lg border px-4 py-2 hover:bg-muted">Continue with Apple</button>
    </div>
  );
}