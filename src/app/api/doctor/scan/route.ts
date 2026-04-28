import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getCurrentDoctor, scanPatientByPublicCode } from "@/lib/doctor/data";
import { scanPatientQrSchema } from "@/lib/doctor/validation";

export async function POST(request: Request) {
  try {
    const doctor = await getCurrentDoctor();

    if (!doctor) {
      return NextResponse.json({ error: "Doctor account required." }, { status: 403 });
    }

    const payload = scanPatientQrSchema.parse(await request.json());
    const patient = await scanPatientByPublicCode(doctor.id, payload.publicCode);

    if (!patient) {
      return NextResponse.json(
        { error: "No active patient emergency QR was found for that code." },
        { status: 404 },
      );
    }

    return NextResponse.json({ patient });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid QR scan payload.", issues: error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    console.error("Doctor QR scan failed", error);
    return NextResponse.json({ error: "Unable to scan patient QR." }, { status: 500 });
  }
}
