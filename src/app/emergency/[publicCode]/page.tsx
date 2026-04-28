import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

type EmergencyPageProps = {
  params: Promise<{
    publicCode: string;
  }>;
};

function formatBloodType(value: string) {
  return value.replace("_POSITIVE", "+").replace("_NEGATIVE", "-").replace("_", " ");
}

export default async function EmergencyProfilePage({ params }: EmergencyPageProps) {
  const { publicCode } = await params;

  const qrCode = await prisma.qrCode
    .findUnique({
      where: { publicCode },
      include: {
        patient: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
            emergencyContacts: {
              orderBy: { priority: "asc" },
              take: 3,
            },
            allergies: {
              orderBy: { severity: "desc" },
              take: 10,
            },
            conditions: {
              where: { status: { in: ["ACTIVE", "REMISSION"] } },
              orderBy: { createdAt: "desc" },
              take: 10,
            },
            medications: {
              where: { active: true },
              orderBy: { createdAt: "desc" },
              take: 10,
            },
          },
        },
      },
    })
    .catch(() => null);

  if (
    !qrCode ||
    qrCode.status !== "ACTIVE" ||
    qrCode.type !== "PATIENT_EMERGENCY" ||
    !qrCode.patient ||
    (qrCode.expiresAt && qrCode.expiresAt < new Date())
  ) {
    notFound();
  }

  await prisma
    .$transaction([
      prisma.qrCode.update({
        where: { id: qrCode.id },
        data: { lastScannedAt: new Date() },
      }),
      prisma.emergencyAccessEvent.create({
        data: {
          patientId: qrCode.patient.id,
          qrCodeId: qrCode.id,
          status: "OPENED",
          accessReason: "Emergency QR page opened",
        },
      }),
    ])
    .catch(() => undefined);

  const patient = qrCode.patient;
  const profile = patient.user.profile;
  const patientName = profile ? `${profile.firstName} ${profile.lastName}` : "TivAid patient";

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-10 sm:px-8">
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/30">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-red-700 dark:text-red-200">
          Emergency profile
        </p>
        <h1 className="mt-3 text-4xl font-bold text-slate-950 dark:text-white">{patientName}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-700 dark:text-slate-300">
          This view is intentionally limited to emergency-relevant information. Full
          medical history, documents, appointments, and insurance details are not exposed.
        </p>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">Blood type</p>
          <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
            {formatBloodType(patient.bloodType)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">Organ donor</p>
          <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
            {patient.organDonor ? "Yes" : "No"}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">Primary language</p>
          <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
            {patient.primaryLanguage ?? "Not provided"}
          </p>
        </div>
      </section>

      {patient.emergencySummary ? (
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">Emergency summary</h2>
          <p className="mt-3 whitespace-pre-wrap text-slate-700 dark:text-slate-300">
            {patient.emergencySummary}
          </p>
        </section>
      ) : null}

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <EmergencyList
          emptyLabel="No allergies listed."
          items={patient.allergies.map((allergy) => ({
            title: allergy.substance,
            detail: [allergy.severity, allergy.reaction].filter(Boolean).join(" - "),
          }))}
          title="Allergies"
        />
        <EmergencyList
          emptyLabel="No active medications listed."
          items={patient.medications.map((medication) => ({
            title: medication.name,
            detail: [medication.dosage, medication.frequency, medication.route]
              .filter(Boolean)
              .join(" - "),
          }))}
          title="Current medications"
        />
        <EmergencyList
          emptyLabel="No active conditions listed."
          items={patient.conditions.map((condition) => ({
            title: condition.name,
            detail: condition.status,
          }))}
          title="Active conditions"
        />
        <EmergencyList
          emptyLabel="No emergency contacts listed."
          items={patient.emergencyContacts.map((contact) => ({
            title: contact.name,
            detail: `${contact.relationship} - ${contact.phone}`,
          }))}
          title="Emergency contacts"
        />
      </section>
    </main>
  );
}

function EmergencyList({
  emptyLabel,
  items,
  title,
}: {
  emptyLabel: string;
  items: Array<{ title: string; detail: string }>;
  title: string;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-xl font-bold text-slate-950 dark:text-white">{title}</h2>
      {items.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {items.map((item) => (
            <li className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950" key={`${item.title}-${item.detail}`}>
              <p className="font-semibold text-slate-950 dark:text-white">{item.title}</p>
              {item.detail ? (
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{item.detail}</p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{emptyLabel}</p>
      )}
    </section>
  );
}
