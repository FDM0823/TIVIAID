import Link from "next/link";

import { AppointmentsDashboard } from "@/components/appointments/appointments-dashboard";
import { getAppointmentDashboardData } from "@/lib/appointments/data";

export default async function AppointmentsPage() {
  const data = await getAppointmentDashboardData();

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10 sm:px-8 lg:px-10">
      <Link className="text-sm font-medium text-teal-700 dark:text-teal-300" href="/dashboard">
        Back to dashboard
      </Link>
      <div className="mt-8">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-700 dark:text-teal-300">
          Appointments
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 dark:text-white">
          Schedule and manage care visits
        </h1>
        <p className="mt-4 max-w-2xl text-slate-600 dark:text-slate-300">
          Patients can request appointments with doctors, and doctors can confirm,
          complete, cancel, or mark no-shows.
        </p>
      </div>
      <AppointmentsDashboard
        appointments={data.appointments}
        doctors={data.availableDoctors}
        role={data.user.role}
      />
    </main>
  );
}
