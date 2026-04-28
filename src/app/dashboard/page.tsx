import Link from "next/link";

import { StatusCard } from "@/components/status-card";

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

export default function DashboardPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10 sm:px-8 lg:px-10">
      <Link className="text-sm font-medium text-teal-700 dark:text-teal-300" href="/">
        Back to home
      </Link>
      <div className="mt-8">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-700 dark:text-teal-300">
          TivAid dashboard
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 dark:text-white">
          Application modules
        </h1>
        <p className="mt-4 max-w-2xl text-slate-600 dark:text-slate-300">
          This starter dashboard maps the primary product areas to the Prisma schema
          and feature folders.
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
