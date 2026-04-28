import { notFound } from "next/navigation";

import { getPrescriptionVerificationView } from "@/lib/prescriptions/data";

type VerifyPrescriptionPageProps = {
  params: Promise<{
    publicCode: string;
  }>;
};

export default async function VerifyPrescriptionPage({ params }: VerifyPrescriptionPageProps) {
  const { publicCode } = await params;
  const prescription = await getPrescriptionVerificationView(publicCode);

  if (!prescription) {
    notFound();
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-6 py-10 sm:px-8">
      <section className="rounded-3xl border border-teal-200 bg-teal-50 p-6 dark:border-teal-900 dark:bg-teal-950/30">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-700 dark:text-teal-200">
          TivAid prescription verification
        </p>
        <h1 className="mt-3 text-4xl font-bold text-slate-950 dark:text-white">
          Valid digital prescription
        </h1>
        <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">
          This page verifies that the prescription QR code resolves to an active TivAid
          prescription record.
        </p>
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Detail label="Patient" value={prescription.patientName} />
          <Detail label="Doctor" value={prescription.doctorName} />
          <Detail label="Medication" value={prescription.medicationName} />
          <Detail label="Dosage" value={prescription.dosage} />
          <Detail label="Frequency" value={prescription.frequency} />
          <Detail label="Status" value={prescription.status} />
          <Detail label="Prescribed" value={new Date(prescription.prescribedAt).toLocaleDateString()} />
          <Detail
            label="Expires"
            value={
              prescription.expiresAt
                ? new Date(prescription.expiresAt).toLocaleDateString()
                : "Not set"
            }
          />
        </dl>
        {prescription.instructions ? (
          <div className="mt-6 rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
            <p className="text-sm font-semibold text-slate-950 dark:text-white">Instructions</p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">
              {prescription.instructions}
            </p>
          </div>
        ) : null}
      </section>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="mt-1 font-semibold text-slate-950 dark:text-white">{value}</dd>
    </div>
  );
}
