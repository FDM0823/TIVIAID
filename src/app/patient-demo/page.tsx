import Link from "next/link";

import { EmergencyReadinessCard } from "@/components/patient/emergency-readiness-card";
import type { PatientEmergencyReadinessView } from "@/lib/patient/data";
import { createEmergencyQrDataUrl } from "@/lib/patient/qr";

const emergencyUrl = "https://tivaid-ecru.vercel.app/emergency-demo/camila-torres";

const readiness: PatientEmergencyReadinessView = {
  activeAllergyCount: 2,
  activeConditionCount: 2,
  activeMedicationCount: 2,
  bloodType: "O_NEGATIVE",
  dateOfBirth: "1991-04-18",
  emergencyContact: {
    name: "Sofia Ramirez",
    phone: "+1 (555) 018-4432",
    relationship: "Hermana",
  },
  emergencySummary:
    "Paciente demo con alergia vital a penicilina, asma severa y diabetes tipo 1. Porta bomba de insulina y requiere verificar glucosa capilar durante triage.",
  heightCm: "168",
  patientName: "Camila Torres",
  primaryLanguage: "Spanish",
  qrCode: {
    createdAt: new Date().toISOString(),
    lastScannedAt: null,
    publicCode: "camila-torres-demo",
  },
  recentAccessEvents: [
    {
      accessReason: "Doctor demo scan",
      id: "demo-scan-1",
      openedAt: new Date().toISOString(),
      requesterRole: "DOCTOR",
      status: "VERIFIED",
    },
  ],
  weightKg: "62",
};

const profileFields = [
  ["Nombre", "Camila Torres"],
  ["Fecha de nacimiento", "1991-04-18"],
  ["Tipo de sangre", "O-"],
  ["Idioma", "Spanish"],
  ["Altura / peso", "168 cm / 62 kg"],
];

const history = [
  {
    title: "Alergias criticas",
    items: ["Penicilina - anafilaxia documentada", "Aspirina - broncoespasmo"],
  },
  {
    title: "Condiciones activas",
    items: ["Asma severa", "Diabetes tipo 1"],
  },
  {
    title: "Medicamentos",
    items: ["Salbutamol 100 mcg si precisa", "Insulina lispro bomba continua"],
  },
];

export default async function PatientDemoPage() {
  const qrImageDataUrl = await createEmergencyQrDataUrl(emergencyUrl);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10 sm:px-8 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link className="text-sm font-medium text-teal-700" href="/">
            Back to home
          </Link>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.25em] text-teal-700">
            App del paciente demo
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
            Perfil medico con QR dinamico
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Esta pantalla no depende de la base de datos: muestra la experiencia
            real del paciente con QR, readiness score e historial clinico.
          </p>
        </div>
        <a
          className="rounded-full bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
          href="/doctor-demo"
        >
          Ver app doctor
        </a>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">
            Perfil del paciente
          </p>
          <h2 className="mt-3 text-2xl font-bold text-slate-950">Datos de emergencia</h2>
          <dl className="mt-5 grid gap-3 sm:grid-cols-2">
            {profileFields.map(([label, value]) => (
              <div className="rounded-2xl bg-slate-50 p-4" key={label}>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {label}
                </dt>
                <dd className="mt-2 font-semibold text-slate-950">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 rounded-2xl bg-teal-50 p-4 text-sm leading-6 text-teal-950">
            {readiness.emergencySummary}
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {history.map((section) => (
              <article className="rounded-2xl border border-slate-200 p-4" key={section.title}>
                <h3 className="font-semibold text-slate-950">{section.title}</h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">
              Emergency QR
            </p>
            <h2 className="mt-3 text-2xl font-bold text-slate-950">
              Dynamic emergency profile
            </h2>
            <div className="mt-5 rounded-2xl bg-white p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="Emergency QR code" className="mx-auto h-56 w-56" src={qrImageDataUrl} />
            </div>
            <p className="mt-4 break-all text-xs text-slate-500">{emergencyUrl}</p>
          </section>
          <EmergencyReadinessCard readiness={readiness} />
        </aside>
      </div>
    </main>
  );
}
