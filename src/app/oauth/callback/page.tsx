"use client";
import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function OAuthCallback() {
  const params = useSearchParams();
  const router = useRouter();
  const { signInWithOAuth } = useAuth();

  useEffect(() => {
    const provider = (params.get("provider") as "google" | "apple") || "google";
    // This is a mock. Replace with real handler when backend is ready.
    signInWithOAuth(provider).then(() => router.replace("/"));
  }, [params, router, signInWithOAuth]);

  return (
    <div className="mx-auto max-w-md p-6">
      <p>Signing you in…</p>
    </div>
  );
}