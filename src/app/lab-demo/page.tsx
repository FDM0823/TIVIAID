import Link from "next/link";

const labMetrics = [
  { label: "Ordenes activas", value: "18" },
  { label: "Muestras en proceso", value: "7" },
  { label: "Resultados liberados", value: "92%" },
];

const labOrder = {
  accession: "LAB-2026-0418",
  doctor: "Dra. Valeria Cruz",
  patient: "Mateo Hernandez",
  priority: "Urgente",
  requestedAt: "Hoy 08:15",
  tests: ["Biometria hematica", "Quimica sanguinea", "PCR cuantitativa"],
};

const workflowSteps = [
  {
    title: "1. Doctor solicita estudios",
    description:
      "El doctor selecciona al paciente, agrega sospecha clinica y manda una orden digital al laboratorio.",
    owner: "Doctor",
    status: "Orden enviada",
  },
  {
    title: "2. Clinica agenda muestra",
    description:
      "Recepcion confirma datos, prioridad y horario para toma de sangre u otra muestra.",
    owner: "Clinica",
    status: "Cita confirmada",
  },
  {
    title: "3. Laboratorio procesa",
    description:
      "El tecnico escanea el codigo de la muestra, actualiza estado y registra observaciones.",
    owner: "Laboratorio",
    status: "Procesando",
  },
  {
    title: "4. Resultado validado",
    description:
      "El responsable revisa valores criticos, adjunta PDF y firma digitalmente el resultado.",
    owner: "Bioquimico",
    status: "Validado",
  },
  {
    title: "5. Paciente y doctor reciben aviso",
    description:
      "TivAid libera el resultado al doctor y al paciente con permisos, auditoria y trazabilidad.",
    owner: "TivAid",
    status: "Entregado",
  },
];

const resultRows = [
  { flag: "Normal", name: "Hemoglobina", range: "12.0 - 15.5 g/dL", value: "13.8 g/dL" },
  { flag: "Alerta", name: "Leucocitos", range: "4.5 - 11.0 x10^3/uL", value: "14.2 x10^3/uL" },
  { flag: "Revisar", name: "PCR", range: "< 5 mg/L", value: "18 mg/L" },
];

const operations = [
  "Cola por prioridad y area de laboratorio",
  "Codigo de muestra para evitar errores",
  "Estados visibles para doctor, paciente y clinica",
  "Resultado PDF y resumen estructurado",
  "Auditoria de cada vista y descarga",
  "Alertas para valores criticos",
];

export default function LabInvestorDemoPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-white sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <nav className="flex flex-wrap items-center justify-between gap-4 rounded-full border border-white/10 bg-white/10 px-5 py-3 backdrop-blur">
          <Link className="flex items-center gap-3" href="/">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500 font-bold text-white">
              T
            </span>
            <span>
              <span className="block text-sm font-semibold uppercase tracking-[0.25em] text-cyan-200">
                TivAid LabFlow
              </span>
              <span className="block text-xs text-slate-300">
                MVP laboratorio para inversores
              </span>
            </span>
          </Link>
          <div className="flex flex-wrap gap-2">
            <Link
              className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              href="/demo"
            >
              Demo emergencia
            </Link>
            <Link
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
              href="/login"
            >
              Acceso real
            </Link>
          </div>
        </nav>

        <section className="grid items-center gap-8 py-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="inline-flex rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100">
              Demo separada sin base de datos
            </p>
            <h1 className="mt-5 text-5xl font-bold tracking-tight sm:text-6xl">
              Clinica y laboratorio conectados en un flujo paso a paso.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Este MVP muestra como TivAid puede recibir ordenes medicas,
              controlar muestras, validar resultados y liberar reportes al
              doctor y al paciente desde una sola plataforma.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {labMetrics.map((metric) => (
                <Metric key={metric.label} label={metric.label} value={metric.value} />
              ))}
            </div>
          </div>

          <section className="rounded-[2rem] border border-white/10 bg-white p-6 text-slate-950 shadow-2xl">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-700">
                  Orden digital
                </p>
                <h2 className="mt-3 text-3xl font-bold">{labOrder.accession}</h2>
                <p className="mt-1 text-sm text-slate-500">{labOrder.requestedAt}</p>
              </div>
              <span className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold uppercase tracking-[0.16em] text-red-800">
                {labOrder.priority}
              </span>
            </div>
            <dl className="mt-6 grid gap-3 sm:grid-cols-2">
              <Info label="Paciente" value={labOrder.patient} />
              <Info label="Solicita" value={labOrder.doctor} />
            </dl>
            <div className="mt-5 rounded-2xl bg-slate-950 p-4 text-white">
              <p className="text-sm font-semibold text-cyan-100">Estudios solicitados</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {labOrder.tests.map((test) => (
                  <span
                    className="rounded-full bg-cyan-500/20 px-3 py-2 text-xs font-semibold text-cyan-100"
                    key={test}
                  >
                    {test}
                  </span>
                ))}
              </div>
            </div>
          </section>
        </section>

        <section className="pb-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-200">
                Paso a paso del MVP
              </p>
              <h2 className="mt-3 text-3xl font-bold">Del pedido medico al resultado final</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-300">
              Cada paso se puede vender como una pantalla clara en demo: doctor,
              recepcion, laboratorio, validacion y entrega al paciente.
            </p>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-5">
            {workflowSteps.map((step) => (
              <article
                className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5 backdrop-blur"
                key={step.title}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
                  {step.owner}
                </p>
                <h3 className="mt-3 text-lg font-bold">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">{step.description}</p>
                <p className="mt-4 rounded-full bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-100">
                  {step.status}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 pb-12 lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-200">
              Operacion de laboratorio
            </p>
            <h2 className="mt-3 text-3xl font-bold">Panel para recepcion y tecnico</h2>
            <div className="mt-6 grid gap-3">
              {operations.map((item) => (
                <div className="rounded-2xl bg-white/10 p-4 text-sm text-slate-100" key={item}>
                  {item}
                </div>
              ))}
            </div>
          </aside>

          <section className="rounded-[2rem] border border-cyan-300/20 bg-white p-6 text-slate-950 shadow-2xl">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-700">
                  Resultado liberado
                </p>
                <h2 className="mt-3 text-3xl font-bold">Resumen clinico para doctor</h2>
              </div>
              <span className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold uppercase tracking-[0.16em] text-amber-800">
                Requiere revision
              </span>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              {resultRows.map((row) => (
                <ResultRow key={row.name} {...row} />
              ))}
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-2xl bg-cyan-50 p-4">
                <p className="font-semibold text-cyan-950">Siguiente accion sugerida</p>
                <p className="mt-2 text-sm leading-6 text-cyan-900">
                  Notificar al doctor por leucocitos y PCR elevados, adjuntar PDF
                  firmado y pedir correlacion con sintomas del paciente.
                </p>
              </div>
              <div className="rounded-2xl bg-slate-950 p-4">
                <p className="font-semibold text-white">Mensaje para paciente</p>
                <p className="mt-2 text-sm leading-6 text-slate-100">
                  Tus resultados ya estan disponibles. Un medico debe revisar los
                  valores marcados antes de tomar decisiones de tratamiento.
                </p>
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

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </dt>
      <dd className="mt-2 font-semibold text-slate-950">{value}</dd>
    </div>
  );
}

function ResultRow({
  flag,
  name,
  range,
  value,
}: {
  flag: string;
  name: string;
  range: string;
  value: string;
}) {
  const flagClass =
    flag === "Alerta"
      ? "bg-red-50 text-red-800"
      : flag === "Revisar"
        ? "bg-amber-50 text-amber-800"
        : "bg-emerald-50 text-emerald-800";

  return (
    <div className="grid gap-3 border-b border-slate-200 p-4 last:border-b-0 sm:grid-cols-[1fr_1fr_1fr_auto]">
      <div>
        <p className="text-sm font-semibold">{name}</p>
        <p className="mt-1 text-xs text-slate-500">Rango: {range}</p>
      </div>
      <p className="text-sm font-bold text-slate-950">{value}</p>
      <p className="text-sm text-slate-600">Validado por laboratorio</p>
      <span className={`rounded-full px-3 py-2 text-xs font-semibold ${flagClass}`}>
        {flag}
      </span>
    </div>
  );
}
