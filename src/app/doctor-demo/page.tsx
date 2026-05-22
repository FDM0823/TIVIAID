import Link from "next/link";

import { buildClinicalSignals, formatBloodType } from "@/lib/emergency/intelligence";

const demoPatient = {
  allergies: [
    {
      reaction: "Anafilaxia documentada",
      severity: "LIFE_THREATENING",
      substance: "Penicilina",
    },
    {
      reaction: "Broncoespasmo",
      severity: "SEVERE",
      substance: "Aspirina",
    },
  ],
  bloodType: "O_NEGATIVE",
  conditions: [
    {
      name: "Asma severa",
      notes: "Usa inhalador de rescate",
      status: "ACTIVE",
    },
    {
      name: "Diabetes tipo 1",
      notes: "Bomba de insulina",
      status: "ACTIVE",
    },
  ],
  dateOfBirth: "1991-04-18",
  emergencyContacts: [
    {
      name: "Sofia Ramirez",
      phone: "+1 (555) 018-4432",
      relationship: "Hermana",
    },
  ],
  emergencySummary:
    "Paciente demo con alergia vital a penicilina, asma severa y diabetes tipo 1. Porta bomba de insulina y requiere verificar glucosa capilar durante triage.",
  medications: [
    {
      dosage: "100 mcg",
      frequency: "cada 6 horas si precisa",
      name: "Salbutamol",
    },
    {
      dosage: "bomba",
      frequency: "continua",
      name: "Insulina lispro",
    },
  ],
  name: "Camila Torres",
  sex: "FEMALE",
};

const clinical = buildClinicalSignals(demoPatient);

export default function DoctorDemoPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10 sm:px-8 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link className="text-sm font-medium text-teal-700" href="/">
            Back to home
          </Link>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-700">
            App del doctor demo
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
            Scanner QR e inteligencia clinica
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Esta pantalla replica el dashboard del doctor: escaneo del QR del
            paciente, alertas, prioridades y SBAR listo para copiar.
          </p>
        </div>
        <a
          className="rounded-full bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
          href="/patient-demo"
        >
          Ver app paciente
        </a>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[380px_1fr]">
        <aside className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">
              Simulated QR scanner
            </p>
            <h2 className="mt-3 text-2xl font-bold text-slate-950">
              Patient QR scanned
            </h2>
            <p className="mt-3 rounded-xl bg-slate-950 px-4 py-3 font-mono text-xs text-white">
              /emergency-demo/camila-torres
            </p>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
              Patient
            </p>
            <h2 className="mt-3 text-2xl font-bold text-slate-950">{demoPatient.name}</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <Row label="Blood type" value={formatBloodType(demoPatient.bloodType)} />
              <Row label="Date of birth" value={demoPatient.dateOfBirth} />
              <Row label="Sex" value={demoPatient.sex} />
              <Row label="Emergency contact" value={demoPatient.emergencyContacts[0].phone} />
            </dl>
            <p className="mt-5 rounded-2xl bg-teal-50 p-4 text-sm leading-6 text-teal-950">
              {demoPatient.emergencySummary}
            </p>
          </section>
        </aside>

        <section className="space-y-6">
          <section className="rounded-3xl border border-red-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-700">
                  TivAid Sentinel
                </p>
                <h2 className="mt-3 text-2xl font-bold text-slate-950">
                  Scan intelligence and SBAR handoff
                </h2>
              </div>
              <span className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold uppercase tracking-[0.16em] text-red-800">
                Critical flags
              </span>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {clinical.signals.slice(0, 3).map((signal) => (
                <article
                  className="rounded-2xl border border-amber-200 bg-amber-50 p-4"
                  key={`${signal.label}-${signal.detail}`}
                >
                  <p className="text-sm font-semibold text-amber-950">{signal.label}</p>
                  <p className="mt-2 text-xs leading-5 text-amber-900">{signal.detail}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="font-semibold text-slate-950">Prioridades de atencion</p>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-700">
                {clinical.topPriorities.map((priority) => (
                  <li key={priority}>{priority}</li>
                ))}
              </ol>
            </div>
            <div className="rounded-3xl bg-slate-950 p-6 shadow-sm">
              <p className="font-semibold text-white">SBAR listo para copiar</p>
              <pre className="mt-3 whitespace-pre-wrap text-xs leading-5 text-slate-100">
                {clinical.handoffSummary}
              </pre>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-semibold text-slate-950">{value}</dd>
    </div>
  );
}
