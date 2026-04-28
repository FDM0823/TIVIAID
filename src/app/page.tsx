const metrics = [
  { label: "Emergency QR access", value: "24/7" },
  { label: "Core care modules", value: "8" },
  { label: "Audit coverage", value: "100%" },
];

const modules = [
  "Patient profiles",
  "Doctor verification",
  "Medical history",
  "QR emergency summary",
  "Consent sharing",
  "Appointments",
  "Prescriptions",
  "Audit logs",
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 sm:px-8 lg:px-10">
      <nav className="flex items-center justify-between rounded-full border border-white/10 bg-white/70 px-5 py-3 shadow-sm backdrop-blur dark:bg-slate-950/70">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-600 font-bold text-white">
            T
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-700 dark:text-teal-300">
              TivAid
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Connected healthcare platform
            </p>
          </div>
        </div>
        <a
          className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          href="/api/health"
        >
          API health
        </a>
      </nav>

      <section className="grid flex-1 items-center gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="mb-4 inline-flex rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-800 dark:border-teal-900 dark:bg-teal-950 dark:text-teal-200">
            MVP foundation initialized with Next.js, Tailwind, and Prisma.
          </p>
          <h1 className="text-5xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-6xl">
            Healthcare records, doctor workflows, and emergency access in one secure app.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            TivAid helps patients manage longitudinal medical history, lets verified doctors
            coordinate care, and gives responders QR-based access to critical emergency
            information.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              className="rounded-full bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
              href="/dashboard"
            >
              View dashboard
            </a>
            <a
              className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-800 transition hover:border-teal-400 hover:text-teal-700 dark:border-slate-700 dark:text-slate-100"
              href="https://github.com/FDM0823/TIVIAID/blob/main/docs/architecture.md"
            >
              Architecture docs
            </a>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/15 bg-slate-950 p-6 text-white shadow-2xl">
          <div className="rounded-[1.5rem] bg-gradient-to-br from-teal-500 to-cyan-500 p-5">
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-teal-950/70">
              Emergency card
            </p>
            <h2 className="mt-6 text-3xl font-bold">Patient QR Summary</h2>
            <p className="mt-3 text-sm leading-6 text-teal-950/80">
              Opaque QR tokens resolve server-side to limited, audited emergency
              information only.
            </p>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-2xl bg-white/10 p-4">
                <p className="text-2xl font-bold">{metric.value}</p>
                <p className="mt-1 text-xs text-slate-300">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-3 pb-12 sm:grid-cols-2 lg:grid-cols-4">
        {modules.map((module) => (
          <div
            key={module}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <p className="font-semibold text-slate-950 dark:text-white">{module}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
