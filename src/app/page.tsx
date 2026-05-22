const metrics = [
  { label: "Acceso QR de emergencia", value: "24/7" },
  { label: "Modulos de atencion", value: "9" },
  { label: "Cobertura de auditoria", value: "100%" },
];

const modules = [
  "Perfiles de pacientes",
  "Verificacion medica",
  "Historial medico",
  "Resumen QR de emergencia",
  "Consentimiento",
  "Citas",
  "Recetas",
  "Laboratorio clinico",
  "Auditoria",
];

const sentinelFeatures = [
  {
    title: "Score del paciente",
    description:
      "El paciente ve si su perfil QR esta listo antes de una emergencia.",
  },
  {
    title: "Inteligencia para doctores",
    description:
      "El doctor convierte un escaneo QR en alertas, prioridades y contexto clinico.",
  },
  {
    title: "Resumen SBAR copiable",
    description:
      "Un resumen estructurado acelera el traspaso clinico con informacion critica.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 sm:px-8 lg:px-10">
      <nav className="flex items-center justify-between rounded-full border border-slate-200 bg-white/85 px-5 py-3 shadow-sm backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-600 font-bold text-white">
            T
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-700">
              TivAid
            </p>
            <p className="text-xs text-slate-500">
              Plataforma de atencion medica conectada
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            className="hidden rounded-full bg-cyan-100 px-4 py-2 text-sm font-semibold text-cyan-900 transition hover:bg-cyan-200 sm:inline-flex"
            href="/demo"
          >
            Prueba de inversores
          </a>
          <a
            className="hidden rounded-full bg-teal-100 px-4 py-2 text-sm font-semibold text-teal-900 transition hover:bg-teal-200 lg:inline-flex"
            href="/lab-demo"
          >
            MVP laboratorio
          </a>
          <a
            className="hidden rounded-full border border-teal-300 px-4 py-2 text-sm font-semibold text-teal-800 transition hover:border-teal-500 xl:inline-flex"
            href="/patient"
          >
            App paciente
          </a>
          <a
            className="hidden rounded-full border border-cyan-300 px-4 py-2 text-sm font-semibold text-cyan-800 transition hover:border-cyan-500 xl:inline-flex"
            href="/doctor"
          >
            App doctor
          </a>
          <a
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-teal-400 hover:text-teal-700"
            href="/login"
          >
            Acceso
          </a>
          <a
            className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            href="/register"
          >
            Registro
          </a>
        </div>
      </nav>

      <section className="grid flex-1 items-center gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="mb-4 inline-flex rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-800">
            Plataforma MVP inicializada con Next.js, Tailwind y Prisma.
          </p>
          <h1 className="text-5xl font-bold tracking-tight text-slate-950 sm:text-6xl">
            Historiales medicos, flujos de doctores y acceso a emergencias en una app segura.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
            TivAid ayuda a pacientes a gestionar su historial clinico, permite que
            doctores verificados coordinen atencion y da acceso QR a informacion
            critica durante emergencias.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              className="rounded-full bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
              href="/dashboard"
            >
              Ver panel de control
            </a>
            <a
              className="rounded-full border border-teal-300 px-6 py-3 text-sm font-semibold text-teal-800 transition hover:border-teal-500 hover:text-teal-700"
              href="/patient"
            >
              App paciente
            </a>
            <a
              className="rounded-full border border-cyan-300 px-6 py-3 text-sm font-semibold text-cyan-800 transition hover:border-cyan-500 hover:text-cyan-700"
              href="/doctor"
            >
              App doctor
            </a>
            <a
              className="rounded-full bg-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-700"
              href="/demo"
            >
              Prueba de inversores
            </a>
            <a
              className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              href="/lab-demo"
            >
              MVP laboratorio
            </a>
            <a
              className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-800 transition hover:border-teal-400 hover:text-teal-700"
              href="https://github.com/FDM0823/TIVIAID/blob/main/docs/architecture.md"
            >
              Documentos de arquitectura
            </a>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/15 bg-slate-950 p-6 text-white shadow-2xl">
          <div className="rounded-[1.5rem] bg-gradient-to-br from-teal-500 to-cyan-500 p-5">
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-teal-950/70">
              Tarjeta de emergencia
            </p>
            <h2 className="mt-6 text-3xl font-bold">Resumen del codigo QR del paciente</h2>
            <p className="mt-3 text-sm leading-6 text-teal-950/80">
              Los codigos QR opacos se resuelven en el servidor y solo muestran
              informacion limitada, auditada y relevante para emergencias.
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
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="font-semibold text-slate-950">{module}</p>
          </div>
        ))}
      </section>

      <section className="mb-12 grid gap-4 lg:grid-cols-2">
        <article className="rounded-[2rem] border border-teal-200 bg-teal-50 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-800">
            App del paciente
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            Perfil, QR de emergencia y citas siguen activos.
          </h2>
          <p className="mt-4 text-sm leading-6 text-slate-700">
            Entra como paciente para actualizar datos medicos, generar el QR y
            revisar el historial conectado.
          </p>
          <a
            className="mt-5 inline-flex rounded-full bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
            href="/patient"
          >
            Abrir app paciente
          </a>
        </article>
        <article className="rounded-[2rem] border border-cyan-200 bg-cyan-50 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-800">
            App del doctor
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            Escaneo QR, pacientes y notas siguen activos.
          </h2>
          <p className="mt-4 text-sm leading-6 text-slate-700">
            Entra como doctor para simular el escaneo del paciente, ver alertas
            clinicas y agregar notas al historial.
          </p>
          <a
            className="mt-5 inline-flex rounded-full bg-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-700"
            href="/doctor"
          >
            Abrir app doctor
          </a>
        </article>
      </section>

      <section className="mb-12 rounded-[2rem] border border-cyan-200 bg-cyan-50 p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-800">
          Nuevo para atencion de emergencia
        </p>
        <div className="mt-4 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950">
              TivAid Sentinel convierte un escaneo QR en accion.
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-700">
              La app del paciente ahora calcula preparacion de emergencia, mientras
              la app del doctor destaca senales clinicas y prepara un resumen SBAR
              desde el mismo flujo QR con privacidad limitada.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {sentinelFeatures.map((feature) => (
              <article
                className="rounded-2xl border border-white/70 bg-white p-4"
                key={feature.title}
              >
                <h3 className="font-semibold text-slate-950">{feature.title}</h3>
                <p className="mt-2 text-xs leading-5 text-slate-700">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-12 rounded-[2rem] border border-teal-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-800">
          Nuevo MVP para clinica de laboratorio
        </p>
        <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950">
              LabFlow muestra ordenes, muestras y resultados en una demo separada.
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-700">
              Presenta el flujo paso a paso para inversores: el doctor solicita
              estudios, la clinica agenda la muestra, el laboratorio valida
              resultados y el paciente recibe el reporte.
            </p>
          </div>
          <a
            className="inline-flex rounded-full bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
            href="/lab-demo"
          >
            Abrir MVP laboratorio
          </a>
        </div>
      </section>
    </main>
  );
}
