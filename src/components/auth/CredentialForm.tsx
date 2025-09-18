"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const signUpSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

type SignInValues = z.infer<typeof signInSchema>;
type SignUpValues = z.infer<typeof signUpSchema>;

export function SignInForm() {
  const { signInWithCredentials } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignInValues>({ resolver: zodResolver(signInSchema) });

  const onSubmit = async (values: SignInValues) => {
    setError(null);
    try { await signInWithCredentials(values.email, values.password); }
    catch (e: any) { setError(e?.message ?? "Sign in failed"); }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <input className="w-full rounded-lg border px-3 py-2" placeholder="Email" {...register("email")} />
      {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
      <input type="password" className="w-full rounded-lg border px-3 py-2" placeholder="Password" {...register("password")} />
      {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button disabled={isSubmitting} className="w-full rounded-lg bg-primary px-4 py-2 text-white disabled:opacity-50">Sign in</button>
    </form>
  );
}

export function SignUpForm() {
  const { signUpWithCredentials } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignUpValues>({ resolver: zodResolver(signUpSchema) });

  const onSubmit = async (values: SignUpValues) => {
    setError(null);
    try { await signUpWithCredentials(values.name, values.email, values.password); }
    catch (e: any) { setError(e?.message ?? "Sign up failed"); }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <input className="w-full rounded-lg border px-3 py-2" placeholder="Full name" {...register("name")} />
      {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
      <input className="w-full rounded-lg border px-3 py-2" placeholder="Email" {...register("email")} />
      {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
      <input type="password" className="w-full rounded-lg border px-3 py-2" placeholder="Password" {...register("password")} />
      {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button disabled={isSubmitting} className="w-full rounded-lg bg-primary px-4 py-2 text-white disabled:opacity-50">Create account</button>
    </form>
  );
}