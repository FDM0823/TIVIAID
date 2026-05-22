import Link from "next/link";

const rows = [
  ["Paciente", "Camila Torres"],
  ["Tipo de sangre", "O-"],
  ["Fecha de nacimiento", "1991-04-18"],
  ["Contacto", "Sofia Ramirez - +1 (555) 018-4432"],
];

export default function EmergencyDemoPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-6 py-10 sm:px-8 lg:px-10">
      <a className="text-sm font-medium text-teal-700" href="/patient-demo">
        Back to patient demo
      </a>
      <section className="mt-8 rounded-3xl border border-red-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-700">
          Emergency profile
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
          Resumen medico de emergencia
        </h1>
        <dl className="mt-6 space-y-3">
          {rows.map(([label, value]) => (
            <div className="rounded-2xl bg-slate-50 p-4" key={label}>
              <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {label}
              </dt>
              <dd className="mt-2 font-semibold text-slate-950">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm leading-6 text-red-950">
          Alergia vital a penicilina. Asma severa y diabetes tipo 1. Porta bomba
          de insulina; verificar glucosa capilar durante triage.
        </div>
      </section>
    </main>
  );
}
