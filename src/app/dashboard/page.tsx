import Link from "next/link";

import { StatusCard } from "@/components/status-card";
import { getCurrentUser } from "@/lib/auth/session";

const sections = [
  {
    title: "Patients",
    description: "Profiles, emergency contacts, allergies, medications, and QR cards.",
  },
  {
    title: "Doctors",
    description: "Verification, clinic membership, appointments, and encounters.",
  },
  {
    title: "Medical records",
    description: "Longitudinal timeline for conditions, labs, documents, and prescriptions.",
  },
  {
    title: "Consent and audit",
    description: "Scoped sharing, emergency access events, and immutable audit logs.",
  },
];

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const displayName = user?.profile
    ? `${user.profile.firstName} ${user.profile.lastName}`
    : "TivAid user";

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10 sm:px-8 lg:px-10">
      <div className="flex items-center justify-between gap-4">
        <Link className="text-sm font-medium text-teal-700 dark:text-teal-300" href="/">
          Back to home
        </Link>
        <form action="/api/auth/logout" method="post">
          <button
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-500 hover:text-teal-700 dark:border-slate-700 dark:text-slate-200"
            type="submit"
          >
            Sign out
          </button>
        </form>
      </div>
      <div className="mt-8">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-700 dark:text-teal-300">
          TivAid {user?.role.toLowerCase()} dashboard
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 dark:text-white">
          Welcome, {displayName}
        </h1>
        <p className="mt-4 max-w-2xl text-slate-600 dark:text-slate-300">
          This starter dashboard maps the primary product areas to the Prisma schema
          and feature folders. Your account is authenticated with a signed JWT cookie.
        </p>
      </div>

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        {sections.map((section) => (
          <StatusCard
            key={section.title}
            title={section.title}
            description={section.description}
          />
        ))}
      </section>
    </main>
  );
}
