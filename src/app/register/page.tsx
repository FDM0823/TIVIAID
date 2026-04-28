"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { AuthCard } from "@/components/auth/auth-card";

type RegisterRole = "PATIENT" | "DOCTOR";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<RegisterRole>("PATIENT");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      firstName: String(formData.get("firstName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      role,
      licenseNumber: role === "DOCTOR" ? String(formData.get("licenseNumber") ?? "") : undefined,
      licenseCountry:
        role === "DOCTOR" ? String(formData.get("licenseCountry") ?? "") : undefined,
      specialty: role === "DOCTOR" ? String(formData.get("specialty") ?? "") : undefined,
    };

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? "Registration failed.");
      setIsSubmitting(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <AuthCard
      title="Create your TivAid account"
      subtitle="Register as a patient or doctor to access protected care workflows."
      footerHref="/login"
      footerLabel="Sign in"
      footerText="Already registered?"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            First name
            <input
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              name="firstName"
              required
              type="text"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Last name
            <input
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              name="lastName"
              required
              type="text"
            />
          </label>
        </div>

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
            autoComplete="new-password"
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            minLength={8}
            name="password"
            required
            type="password"
          />
        </label>

        <fieldset>
          <legend className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Account type
          </legend>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {(["PATIENT", "DOCTOR"] as const).map((option) => (
              <label
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium dark:border-slate-700"
                key={option}
              >
                <input
                  checked={role === option}
                  name="role"
                  onChange={() => setRole(option)}
                  type="radio"
                  value={option}
                />
                {option === "PATIENT" ? "Patient" : "Doctor"}
              </label>
            ))}
          </div>
        </fieldset>

        {role === "DOCTOR" ? (
          <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4 dark:border-teal-900 dark:bg-teal-950/40">
            <p className="text-sm font-semibold text-teal-900 dark:text-teal-100">
              Doctor verification details
            </p>
            <div className="mt-4 grid gap-3">
              <input
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                name="licenseNumber"
                placeholder="License number"
                required
                type="text"
              />
              <input
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                name="licenseCountry"
                placeholder="License country, e.g. US"
                required
                type="text"
              />
              <input
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                name="specialty"
                placeholder="Specialty"
                required
                type="text"
              />
            </div>
          </div>
        ) : null}

        {error ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-200">
            {error}
          </p>
        ) : null}

        <button
          className="w-full rounded-xl bg-teal-600 px-4 py-3 font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>
    </AuthCard>
  );
}
