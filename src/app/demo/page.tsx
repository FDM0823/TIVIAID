import Link from "next/link";

import {
  buildClinicalSignals,
  buildEmergencyReadiness,
  formatBloodType,
} from "@/lib/emergency/intelligence";

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
    "Paciente con alergia vital a penicilina, asma severa y diabetes tipo 1. Porta bomba de insulina y requiere verificar glucosa capilar durante triage.",
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
  primaryLanguage: "Spanish",
  sex: "FEMALE",
};

const readiness = buildEmergencyReadiness({
  bloodType: demoPatient.bloodType,
  dateOfBirth: demoPatient.dateOfBirth,
  emergencyContact: demoPatient.emergencyContacts[0],
  emergencySummary: demoPatient.emergencySummary,
  hasEmergencyQr: true,
  heightCm: "168",
  primaryLanguage: demoPatient.primaryLanguage,
  weightKg: "62",
});

const clinical = buildClinicalSignals(demoPatient);

export default function InvestorDemoPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-white sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <nav className="flex flex-wrap items-center justify-between gap-4 rounded-full border border-white/10 bg-white/10 px-5 py-3 backdrop-blur">
          <Link className="flex items-center gap-3" href="/">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-500 font-bold text-white">
              T
            </span>
            <span>
              <span className="block text-sm font-semibold uppercase tracking-[0.25em] text-teal-200">
                TivAid
              </span>
              <span className="block text-xs text-slate-300">Prueba de inversores</span>
            </span>
          </Link>
          <div className="flex flex-wrap gap-2">
            <Link
              className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              href="/lab-demo"
            >
              MVP laboratorio
            </Link>
            <Link
              className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              href="/login"
            >
              Acceso real
            </Link>
            <Link
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
              href="/register"
            >
              Registrar cuenta
            </Link>
          </div>
        </nav>

        <section className="grid items-center gap-8 py-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="inline-flex rounded-full border border-teal-400/40 bg-teal-400/10 px-4 py-2 text-sm font-semibold text-teal-100">
              Demo sin base de datos para competencia
            </p>
            <h1 className="mt-5 text-5xl font-bold tracking-tight sm:text-6xl">
              TivAid Sentinel: de QR de emergencia a accion clinica.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Esta prueba muestra el flujo completo que impresiona a jueces:
              preparacion del paciente, escaneo del doctor, alertas de riesgo y
              resumen SBAR listo para transferir la atencion.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <Metric label="Readiness" value={`${readiness.score}%`} />
              <Metric label="Riesgo detectado" value="Critico" />
              <Metric label="Handoff" value="SBAR" />
            </div>
          </div>

          <section className="rounded-[2rem] border border-white/10 bg-white p-6 text-slate-950 shadow-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-700">
              App del paciente
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold">QR readiness score</h2>
                <p className="mt-1 text-sm text-slate-500">{demoPatient.name}</p>
              </div>
              <div className="rounded-2xl border border-teal-200 bg-teal-50 px-5 py-4 text-center text-teal-900">
                <p className="text-4xl font-bold">{readiness.score}</p>
                <p className="text-xs font-semibold uppercase tracking-[0.18em]">
                  Responder-ready
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {readiness.completedItems.slice(0, 4).map((item) => (
                <div className="rounded-2xl bg-teal-50 p-4 text-sm text-teal-950" key={item}>
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-5 grid gap-3 rounded-2xl bg-slate-950 p-4 text-white sm:grid-cols-3">
              <Metric label="Alergias" value={demoPatient.allergies.length.toString()} />
              <Metric label="Medicamentos" value={demoPatient.medications.length.toString()} />
              <Metric label="Condiciones" value={demoPatient.conditions.length.toString()} />
            </div>
          </section>
        </section>

        <section className="grid gap-6 pb-12 lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-200">
              QR escaneado
            </p>
            <h2 className="mt-3 text-3xl font-bold">{demoPatient.name}</h2>
            <dl className="mt-6 space-y-3 text-sm">
              <Row label="Tipo de sangre" value={formatBloodType(demoPatient.bloodType)} />
              <Row label="Fecha de nacimiento" value={demoPatient.dateOfBirth} />
              <Row label="Contacto" value={demoPatient.emergencyContacts[0].phone ?? ""} />
            </dl>
            <p className="mt-6 rounded-2xl bg-teal-400/10 p-4 text-sm leading-6 text-teal-50">
              {demoPatient.emergencySummary}
            </p>
          </aside>

          <section className="rounded-[2rem] border border-cyan-300/20 bg-white p-6 text-slate-950 shadow-2xl">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-700">
                  TivAid Sentinel
                </p>
                <h2 className="mt-3 text-3xl font-bold">Scan intelligence and SBAR handoff</h2>
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

            <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-2xl bg-slate-100 p-4">
                <p className="font-semibold">Prioridades de atencion</p>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-700">
                  {clinical.topPriorities.map((priority) => (
                    <li key={priority}>{priority}</li>
                  ))}
                </ol>
              </div>
              <div className="rounded-2xl bg-slate-950 p-4">
                <p className="font-semibold text-white">SBAR listo para copiar</p>
                <pre className="mt-3 whitespace-pre-wrap text-xs leading-5 text-slate-100">
                  {clinical.handoffSummary}
                </pre>
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <p className="text-3xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-300">{label}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-300">{label}</dt>
      <dd className="font-semibold text-white">{value}</dd>
    </div>
  );
}
