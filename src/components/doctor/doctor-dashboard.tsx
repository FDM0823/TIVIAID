"use client";

import { FormEvent, useState } from "react";

type ScannedPatient = {
  id: string;
  publicCode: string;
  name: string;
  dateOfBirth: string | null;
  sex: string | null;
  bloodType: string;
  emergencySummary: string | null;
  emergencyContacts: Array<{
    name: string;
    relationship: string;
    phone: string;
  }>;
  allergies: Array<{
    substance: string;
    reaction: string | null;
    severity: string;
  }>;
  conditions: Array<{
    name: string;
    status: string;
    notes: string | null;
  }>;
  medications: Array<{
    name: string;
    dosage: string | null;
    frequency: string | null;
  }>;
  encounters: Array<{
    id: string;
    type: string;
    status: string;
    chiefComplaint: string | null;
    assessment: string | null;
    plan: string | null;
    createdAt: string;
    doctorName: string;
  }>;
};

export function DoctorDashboard() {
  const [publicCode, setPublicCode] = useState("");
  const [patient, setPatient] = useState<ScannedPatient | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [noteError, setNoteError] = useState<string | null>(null);
  const [noteMessage, setNoteMessage] = useState<string | null>(null);
  const [prescriptionError, setPrescriptionError] = useState<string | null>(null);
  const [prescriptionMessage, setPrescriptionMessage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isSavingPrescription, setIsSavingPrescription] = useState(false);

  async function handleScan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setScanError(null);
    setNoteMessage(null);
    setIsScanning(true);

    const response = await fetch("/api/doctor/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicCode }),
    });

    const body = (await response.json().catch(() => null)) as
      | { patient?: ScannedPatient; error?: string }
      | null;

    if (!response.ok || !body?.patient) {
      setPatient(null);
      setScanError(body?.error ?? "Unable to scan patient QR.");
      setIsScanning(false);
      return;
    }

    setPatient(body.patient);
    setIsScanning(false);
  }

  async function handleNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!patient) {
      return;
    }

    setNoteError(null);
    setNoteMessage(null);
    setIsSavingNote(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch(`/api/doctor/patients/${patient.id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        noteTitle: String(formData.get("noteTitle") ?? ""),
        noteBody: String(formData.get("noteBody") ?? ""),
        chiefComplaint: String(formData.get("chiefComplaint") ?? ""),
        subjective: String(formData.get("subjective") ?? ""),
        objective: String(formData.get("objective") ?? ""),
        assessment: String(formData.get("assessment") ?? ""),
        plan: String(formData.get("plan") ?? ""),
      }),
    });

    const body = (await response.json().catch(() => null)) as
      | { patient?: ScannedPatient; error?: string }
      | null;

    if (!response.ok || !body?.patient) {
      setNoteError(body?.error ?? "Unable to save note.");
      setIsSavingNote(false);
      return;
    }

    setPatient(body.patient);
    setNoteMessage("Patient history updated.");
    setIsSavingNote(false);
    event.currentTarget.reset();
  }

  async function handlePrescription(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!patient) {
      return;
    }

    setPrescriptionError(null);
    setPrescriptionMessage(null);
    setIsSavingPrescription(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/prescriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId: patient.id,
        medicationName: String(formData.get("medicationName") ?? ""),
        dosage: String(formData.get("dosage") ?? ""),
        frequency: String(formData.get("frequency") ?? ""),
        route: String(formData.get("route") ?? ""),
        quantity: String(formData.get("quantity") ?? ""),
        refills: Number(formData.get("refills") ?? 0),
        instructions: String(formData.get("instructions") ?? ""),
        expiresAt: String(formData.get("expiresAt") ?? ""),
      }),
    });

    const body = (await response.json().catch(() => null)) as
      | { prescription?: { id: string; verifyUrl: string }; error?: string }
      | null;

    if (!response.ok || !body?.prescription) {
      setPrescriptionError(body?.error ?? "Unable to issue prescription.");
      setIsSavingPrescription(false);
      return;
    }

    setPrescriptionMessage(
      `Prescription issued. Verify: ${body.prescription.verifyUrl}`,
    );
    setIsSavingPrescription(false);
    event.currentTarget.reset();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <aside className="space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">
            Simulated QR scanner
          </p>
          <h2 className="mt-3 text-2xl font-bold text-slate-950 dark:text-white">
            Enter patient QR code
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Use the public code from a patient emergency QR URL. Example:
            <span className="font-mono"> /emergency/&lt;publicCode&gt;</span>.
          </p>
          <form className="mt-5 space-y-3" onSubmit={handleScan}>
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              onChange={(event) => setPublicCode(event.target.value)}
              placeholder="Paste QR public code"
              required
              value={publicCode}
            />
            {scanError ? (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-200">
                {scanError}
              </p>
            ) : null}
            <button
              className="w-full rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isScanning}
              type="submit"
            >
              {isScanning ? "Scanning..." : "Scan patient QR"}
            </button>
          </form>
        </section>

        {patient ? <PatientSummary patient={patient} /> : null}
      </aside>

      <section className="space-y-6">
        {patient ? (
          <>
            <NoteForm
              isSaving={isSavingNote}
              message={noteMessage}
              onSubmit={handleNote}
              error={noteError}
            />
            <PrescriptionForm
              error={prescriptionError}
              isSaving={isSavingPrescription}
              message={prescriptionMessage}
              onSubmit={handlePrescription}
            />
            <HistoryList patient={patient} />
          </>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
            <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
              Scan a patient QR to begin
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-600 dark:text-slate-300">
              After scanning, doctors can review emergency-relevant context and append
              structured encounter notes to the patient history.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function PrescriptionForm({
  error,
  isSaving,
  message,
  onSubmit,
}: {
  error: string | null;
  isSaving: boolean;
  message: string | null;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      onSubmit={onSubmit}
    >
      <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
        Issue digital prescription
      </h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        Prescriptions receive a QR verification code and PDF download endpoint.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Medication" name="medicationName" required />
        <Field label="Dosage" name="dosage" required />
        <Field label="Frequency" name="frequency" required />
        <Field label="Route" name="route" />
        <Field label="Quantity" name="quantity" />
        <Field label="Refills" name="refills" type="number" />
        <Field label="Expires at" name="expiresAt" type="date" />
      </div>
      <div className="mt-4">
        <TextArea label="Instructions" name="instructions" />
      </div>
      {message ? (
        <p className="mt-4 break-all rounded-xl bg-teal-50 px-4 py-3 text-sm text-teal-800 dark:bg-teal-950 dark:text-teal-100">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-200">
          {error}
        </p>
      ) : null}
      <button
        className="mt-5 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-70"
        disabled={isSaving}
        type="submit"
      >
        {isSaving ? "Issuing..." : "Issue prescription"}
      </button>
    </form>
  );
}

function PatientSummary({ patient }: { patient: ScannedPatient }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">
        Patient
      </p>
      <h2 className="mt-3 text-2xl font-bold text-slate-950 dark:text-white">{patient.name}</h2>
      <dl className="mt-5 space-y-3 text-sm">
        <Row label="Blood type" value={formatBloodType(patient.bloodType)} />
        <Row label="Date of birth" value={patient.dateOfBirth ?? "Not provided"} />
        <Row label="Sex" value={patient.sex ?? "Unknown"} />
      </dl>
      {patient.emergencySummary ? (
        <p className="mt-5 whitespace-pre-wrap rounded-2xl bg-teal-50 p-4 text-sm text-teal-950 dark:bg-teal-950/40 dark:text-teal-100">
          {patient.emergencySummary}
        </p>
      ) : null}
    </section>
  );
}

function NoteForm({
  error,
  isSaving,
  message,
  onSubmit,
}: {
  error: string | null;
  isSaving: boolean;
  message: string | null;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      onSubmit={onSubmit}
    >
      <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
        Add history note
      </h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Note title" name="noteTitle" required />
        <Field label="Chief complaint" name="chiefComplaint" />
      </div>
      <div className="mt-4">
        <TextArea label="Clinical note" name="noteBody" required />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <TextArea label="Subjective" name="subjective" />
        <TextArea label="Objective" name="objective" />
        <TextArea label="Assessment" name="assessment" required />
        <TextArea label="Plan" name="plan" required />
      </div>
      {message ? (
        <p className="mt-4 rounded-xl bg-teal-50 px-4 py-3 text-sm text-teal-800 dark:bg-teal-950 dark:text-teal-100">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-200">
          {error}
        </p>
      ) : null}
      <button
        className="mt-5 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
        disabled={isSaving}
        type="submit"
      >
        {isSaving ? "Saving note..." : "Save note"}
      </button>
    </form>
  );
}

function HistoryList({ patient }: { patient: ScannedPatient }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-2xl font-bold text-slate-950 dark:text-white">Patient history</h2>
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <ClinicalList
          emptyLabel="No active allergies listed."
          items={patient.allergies.map((allergy) => ({
            title: allergy.substance,
            detail: [allergy.severity, allergy.reaction].filter(Boolean).join(" - "),
          }))}
          title="Allergies"
        />
        <ClinicalList
          emptyLabel="No active medications listed."
          items={patient.medications.map((medication) => ({
            title: medication.name,
            detail: [medication.dosage, medication.frequency].filter(Boolean).join(" - "),
          }))}
          title="Medications"
        />
        <ClinicalList
          emptyLabel="No conditions listed."
          items={patient.conditions.map((condition) => ({
            title: condition.name,
            detail: [condition.status, condition.notes].filter(Boolean).join(" - "),
          }))}
          title="Conditions"
        />
      </div>

      <div className="mt-6 space-y-4">
        {patient.encounters.length > 0 ? (
          patient.encounters.map((encounter) => (
            <article
              className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800"
              key={encounter.id}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-semibold text-slate-950 dark:text-white">
                  {encounter.type.replace("_", " ")} - {encounter.status}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {new Date(encounter.createdAt).toLocaleString()} by {encounter.doctorName}
                </p>
              </div>
              {encounter.chiefComplaint ? (
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                  <span className="font-semibold">Chief complaint:</span>{" "}
                  {encounter.chiefComplaint}
                </p>
              ) : null}
              {encounter.assessment ? (
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  <span className="font-semibold">Assessment:</span> {encounter.assessment}
                </p>
              ) : null}
              {encounter.plan ? (
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  <span className="font-semibold">Plan:</span> {encounter.plan}
                </p>
              ) : null}
            </article>
          ))
        ) : (
          <p className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-300">
            No encounter notes yet.
          </p>
        )}
      </div>
    </section>
  );
}

function ClinicalList({
  emptyLabel,
  items,
  title,
}: {
  emptyLabel: string;
  items: Array<{ title: string; detail: string }>;
  title: string;
}) {
  return (
    <section className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
      <h3 className="font-semibold text-slate-950 dark:text-white">{title}</h3>
      {items.length ? (
        <ul className="mt-3 space-y-2">
          {items.map((item) => (
            <li key={`${item.title}-${item.detail}`}>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {item.title}
              </p>
              {item.detail ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.detail}</p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{emptyLabel}</p>
      )}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="font-medium text-slate-900 dark:text-slate-100">{value}</dd>
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
        className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        name={name}
        required={required}
        step={type === "number" ? "1" : undefined}
        type={type}
      />
    </label>
  );
}

function TextArea({
  label,
  name,
  required,
}: {
  label: string;
  name: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
      {label}
      <textarea
        className="mt-2 min-h-28 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        name={name}
        required={required}
      />
    </label>
  );
}

function formatBloodType(value: string) {
  return value.replace("_POSITIVE", "+").replace("_NEGATIVE", "-").replace("_", " ");
}
