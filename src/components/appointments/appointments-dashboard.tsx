"use client";

import { FormEvent, useState } from "react";

type AppointmentDoctor = {
  id: string;
  name: string;
  specialty: string;
};

type AppointmentItem = {
  id: string;
  status: string;
  reason: string | null;
  notes: string | null;
  startsAt: string;
  endsAt: string;
  patientName: string;
  doctorName: string;
};

type AppointmentsDashboardProps = {
  appointments: AppointmentItem[];
  doctors: AppointmentDoctor[];
  role: string;
};

export function AppointmentsDashboard({
  appointments,
  doctors,
  role,
}: AppointmentsDashboardProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doctorId: String(formData.get("doctorId") ?? ""),
        startsAt: String(formData.get("startsAt") ?? ""),
        reason: String(formData.get("reason") ?? ""),
        notes: String(formData.get("notes") ?? ""),
      }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? "Unable to book appointment.");
      setIsSubmitting(false);
      return;
    }

    setMessage("Appointment requested.");
    setIsSubmitting(false);
    event.currentTarget.reset();
    window.location.reload();
  }

  async function updateStatus(appointmentId: string, status: string) {
    setMessage(null);
    setError(null);
    const response = await fetch(`/api/appointments/${appointmentId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? "Unable to update appointment.");
      return;
    }

    setMessage("Appointment updated.");
    window.location.reload();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      {role === "PATIENT" ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">
            Book appointment
          </p>
          <form className="mt-5 space-y-4" onSubmit={handleCreate}>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Doctor
              <select
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                name="doctorId"
                required
              >
                <option value="">Select a doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.specialty}
                  </option>
                ))}
              </select>
            </label>
            <Field label="Start time" name="startsAt" required type="datetime-local" />
            <Field label="Reason" name="reason" required />
            <TextArea label="Notes" name="notes" />
            {message ? <Notice kind="success" text={message} /> : null}
            {error ? <Notice kind="error" text={error} /> : null}
            <button
              className="w-full rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:opacity-70"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Requesting..." : "Request appointment"}
            </button>
          </form>
        </section>
      ) : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-2xl font-bold text-slate-950 dark:text-white">Appointments</h2>
        {message && role !== "PATIENT" ? <Notice kind="success" text={message} /> : null}
        {error && role !== "PATIENT" ? <Notice kind="error" text={error} /> : null}
        <div className="mt-5 space-y-4">
          {appointments.length ? (
            appointments.map((appointment) => (
              <article
                className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800"
                key={appointment.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-950 dark:text-white">
                      {role === "DOCTOR" ? appointment.patientName : appointment.doctorName}
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {new Date(appointment.startsAt).toLocaleString()} -{" "}
                      {new Date(appointment.endsAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800 dark:bg-teal-950 dark:text-teal-200">
                    {appointment.status.replace("_", " ")}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">
                  {appointment.reason}
                </p>
                {appointment.notes ? (
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {appointment.notes}
                  </p>
                ) : null}
                {role === "DOCTOR" && appointment.status === "REQUESTED" ? (
                  <div className="mt-4 flex gap-2">
                    <button
                      className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white"
                      onClick={() => updateStatus(appointment.id, "CONFIRMED")}
                      type="button"
                    >
                      Confirm
                    </button>
                    <button
                      className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
                      onClick={() => updateStatus(appointment.id, "CANCELLED")}
                      type="button"
                    >
                      Cancel
                    </button>
                  </div>
                ) : null}
              </article>
            ))
          ) : (
            <p className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-300">
              No appointments yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  name,
  required,
  type = "text",
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
      {label}
      <input
        className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        name={name}
        required={required}
        type={type}
      />
    </label>
  );
}

function TextArea({ label, name }: { label: string; name: string }) {
  return (
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
      {label}
      <textarea
        className="mt-2 min-h-24 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        name={name}
      />
    </label>
  );
}

function Notice({ kind, text }: { kind: "error" | "success"; text: string }) {
  const className =
    kind === "error"
      ? "mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-200"
      : "mt-4 rounded-xl bg-teal-50 px-4 py-3 text-sm text-teal-800 dark:bg-teal-950 dark:text-teal-100";

  return <p className={className}>{text}</p>;
}
