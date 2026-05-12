import type { PatientEmergencyReadinessView } from "@/lib/patient/data";
import { buildEmergencyReadiness } from "@/lib/emergency/intelligence";

type EmergencyReadinessCardProps = {
  readiness: PatientEmergencyReadinessView;
};

const levelLabels = {
  critical: "Needs attention",
  "needs-work": "Almost ready",
  ready: "Responder-ready",
} satisfies Record<string, string>;

const levelStyles = {
  critical:
    "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100",
  "needs-work":
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100",
  ready:
    "border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-900 dark:bg-teal-950/40 dark:text-teal-100",
} satisfies Record<string, string>;

export function EmergencyReadinessCard({ readiness }: EmergencyReadinessCardProps) {
  const score = buildEmergencyReadiness({
    bloodType: readiness.bloodType,
    dateOfBirth: readiness.dateOfBirth,
    emergencyContact: readiness.emergencyContact,
    emergencySummary: readiness.emergencySummary,
    hasEmergencyQr: Boolean(readiness.qrCode),
    heightCm: readiness.heightCm,
    primaryLanguage: readiness.primaryLanguage,
    weightKg: readiness.weightKg,
  });
  const latestAccess = readiness.recentAccessEvents[0];

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">
            Emergency intelligence
          </p>
          <h2 className="mt-3 text-2xl font-bold text-slate-950 dark:text-white">
            QR readiness score
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {readiness.patientName}
          </p>
        </div>
        <div
          className={`rounded-2xl border px-4 py-3 text-center ${levelStyles[score.level]}`}
        >
          <p className="text-3xl font-bold">{score.score}</p>
          <p className="text-xs font-semibold uppercase tracking-[0.16em]">
            {levelLabels[score.level]}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 text-sm">
        {score.completedItems.slice(0, 3).map((item) => (
          <div
            className="rounded-2xl bg-teal-50 p-3 text-teal-900 dark:bg-teal-950/40 dark:text-teal-100"
            key={item}
          >
            {item}
          </div>
        ))}
        {score.missingItems.slice(0, 3).map((item) => (
          <div
            className="rounded-2xl bg-amber-50 p-3 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
            key={item}
          >
            Next: {item}
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
        <p className="font-semibold text-slate-950 dark:text-white">Responder-visible signals</p>
        <dl className="mt-3 grid grid-cols-3 gap-3 text-center text-sm">
          <Metric label="Allergies" value={readiness.activeAllergyCount} />
          <Metric label="Meds" value={readiness.activeMedicationCount} />
          <Metric label="Conditions" value={readiness.activeConditionCount} />
        </dl>
      </div>

      <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm dark:bg-slate-950">
        <p className="font-semibold text-slate-950 dark:text-white">Emergency access audit</p>
        {latestAccess ? (
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            Last opened {new Date(latestAccess.openedAt).toLocaleString()} as{" "}
            {latestAccess.requesterRole?.toLowerCase() ?? "emergency viewer"}.
          </p>
        ) : (
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            No emergency QR openings have been recorded yet.
          </p>
        )}
        {readiness.qrCode?.lastScannedAt ? (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            QR last scanned {new Date(readiness.qrCode.lastScannedAt).toLocaleString()}.
          </p>
        ) : null}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white p-3 dark:bg-slate-900">
      <dt className="text-xs text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="mt-1 text-xl font-bold text-slate-950 dark:text-white">{value}</dd>
    </div>
  );
}
