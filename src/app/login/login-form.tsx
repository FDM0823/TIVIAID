"use client";

import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

import { AuthCard } from "@/components/auth/auth-card";
import { DEFAULT_DEMO_CREDENTIALS } from "@/lib/auth/demo-credentials";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
      }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as
        | { error?: string; message?: string }
        | null;
      setError(body?.error ?? body?.message ?? "Unable to sign in.");
      setIsSubmitting(false);
      return;
    }

    const nextRoute = (searchParams.get("next") ?? "/dashboard") as Route;
    router.push(nextRoute);
    router.refresh();
  }

  return (
    <AuthCard
      footerHref="/register"
      footerLabel="Create an account"
      footerText="New to TivAid?"
      subtitle="Sign in to access protected TivAid dashboards."
      title="Welcome back"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Email
          <input
            autoComplete="email"
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            name="email"
            required
            type="email"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Password
          <input
            autoComplete="current-password"
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            minLength={8}
            name="password"
            required
            type="password"
          />
        </label>
        {error ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-200">
            {error}
          </p>
        ) : null}
        <button
          className="w-full rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
        <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-center dark:border-cyan-900 dark:bg-cyan-950/40">
          <p className="text-sm font-semibold text-cyan-950 dark:text-cyan-100">
            Competition demo
          </p>
          <p className="mt-1 text-xs leading-5 text-cyan-800 dark:text-cyan-200">
            If production database access is still being configured, open the investor
            demo to show the full patient and doctor experience.
          </p>
          <a
            className="mt-3 inline-flex rounded-full bg-cyan-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-cyan-700"
            href="/demo"
          >
            Open investor demo
          </a>
        </div>
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4 dark:border-teal-900 dark:bg-teal-950/40">
          <p className="text-sm font-semibold text-teal-950 dark:text-teal-100">
            Cuentas demo funcionales
          </p>
          <p className="mt-1 text-xs leading-5 text-teal-800 dark:text-teal-200">
            Usa estas credenciales para entrar a las apps reales con datos demo.
          </p>
          <div className="mt-3 space-y-3 text-left">
            {DEFAULT_DEMO_CREDENTIALS.map((credential) => (
              <div
                className="rounded-xl border border-white/70 bg-white p-3 text-xs text-slate-700 dark:border-teal-900 dark:bg-slate-950 dark:text-slate-200"
                key={credential.email}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-slate-950 dark:text-white">
                    {credential.label}
                  </p>
                  <a
                    className="rounded-full bg-teal-600 px-3 py-1 font-semibold text-white transition hover:bg-teal-700"
                    href={credential.targetPath}
                  >
                    Abrir app
                  </a>
                </div>
                <p className="mt-2 break-all">
                  <span className="font-semibold">Email:</span> {credential.email}
                </p>
                <p className="mt-1 break-all">
                  <span className="font-semibold">Clave:</span> {credential.password}
                </p>
              </div>
            ))}
          </div>
        </div>
      </form>
    </AuthCard>
  );
}
