import Link from "next/link";

import { EmergencyQrCard } from "@/components/patient/emergency-qr-card";
import { PatientProfileForm } from "@/components/patient/patient-profile-form";
import { getPatientProfile, requirePatientUser } from "@/lib/patient/data";
import { createEmergencyQrImage, getEmergencyQrUrl, getOrCreateEmergencyQrCode } from "@/lib/patient/qr";

export default async function PatientProfilePage() {
  const { patient, user } = await requirePatientUser();
  const profile = await getPatientProfile(user.id);
  const qrCode = await getOrCreateEmergencyQrCode(patient.id);
  const emergencyUrl = getEmergencyQrUrl(qrCode.publicCode);
  const qrImageDataUrl = await createEmergencyQrImage(qrCode.publicCode);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10 sm:px-8 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link className="text-sm font-medium text-teal-700 dark:text-teal-300" href="/dashboard">
            Back to dashboard
          </Link>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 dark:text-white">
            Patient medical profile
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
            Maintain emergency-ready medical data and manage a dynamic QR code that
            exposes only the limited emergency summary.
          </p>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_360px]">
        {profile ? <PatientProfileForm profile={profile} /> : null}
        <EmergencyQrCard
          emergencyUrl={emergencyUrl}
          qrImageDataUrl={qrImageDataUrl}
        />
      </div>
    </main>
  );
}
