import Link from "next/link";

import { DoctorDashboard } from "@/components/doctor/doctor-dashboard";
import { getDoctorDashboardData } from "@/lib/doctor/data";

export default async function DoctorPage() {
  const dashboard = await getDoctorDashboardData();
  const profile = dashboard.doctor.user.profile;
  const displayName = profile ? `Dr. ${profile.firstName} ${profile.lastName}` : "Doctor";

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10 sm:px-8 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link className="text-sm font-medium text-teal-700 dark:text-teal-300" href="/dashboard">
            Back to dashboard
          </Link>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.25em] text-teal-700 dark:text-teal-300">
            Doctor module
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 dark:text-white">
            {displayName}
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
            Simulate scanning a patient emergency QR code, review limited medical
            context, and add clinical history notes.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="font-semibold text-slate-950 dark:text-white">
            {dashboard.doctor.specialty}
          </p>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Verification: {dashboard.doctor.verificationStatus.toLowerCase()}
          </p>
        </div>
      </div>

      <DoctorDashboard />
    </main>
  );
}
