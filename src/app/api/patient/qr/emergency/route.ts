import { NextResponse } from "next/server";

import { getCurrentPatient } from "@/lib/patient/data";
import { getOrCreateEmergencyQrCode } from "@/lib/patient/qr";

export async function POST(request: Request) {
  const patient = await getCurrentPatient();

  if (!patient) {
    return NextResponse.json({ error: "Patient account required." }, { status: 403 });
  }

  await getOrCreateEmergencyQrCode(patient.id);

  const redirectUrl = new URL("/patient", request.url);
  return NextResponse.redirect(redirectUrl, { status: 303 });
}
