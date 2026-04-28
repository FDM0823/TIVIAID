import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getCurrentUser } from "@/lib/auth/session";
import { getPatientProfile, updatePatientProfile } from "@/lib/patient/data";
import { patientProfileSchema } from "@/lib/patient/validation";

export async function GET() {
  const user = await getCurrentUser();

  if (!user || user.role !== "PATIENT") {
    return NextResponse.json({ error: "Patient account required." }, { status: 403 });
  }

  const profile = await getPatientProfile(user.id);

  if (!profile) {
    return NextResponse.json({ error: "Patient profile not found." }, { status: 404 });
  }

  return NextResponse.json({ profile });
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();

  if (!user || user.role !== "PATIENT") {
    return NextResponse.json({ error: "Patient account required." }, { status: 403 });
  }

  try {
    const payload = patientProfileSchema.parse(await request.json());
    const profile = await updatePatientProfile(user.id, payload);

    return NextResponse.json({ profile });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid patient profile data.", issues: error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    console.error("Patient profile update failed", error);
    return NextResponse.json({ error: "Unable to update patient profile." }, { status: 500 });
  }
}
