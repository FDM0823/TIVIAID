import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getCurrentDoctor } from "@/lib/doctor/data";
import { createDigitalPrescription, getPrescriptionsForCurrentUser } from "@/lib/prescriptions/data";
import { prescriptionSchema } from "@/lib/prescriptions/validation";

export async function GET() {
  const prescriptions = await getPrescriptionsForCurrentUser();

  return NextResponse.json({ prescriptions });
}

export async function POST(request: Request) {
  const doctor = await getCurrentDoctor();

  if (!doctor) {
    return NextResponse.json({ error: "Doctor account required." }, { status: 403 });
  }

  try {
    const payload = prescriptionSchema.parse(await request.json());
    const prescription = await createDigitalPrescription({
      doctorId: doctor.id,
      input: payload,
    });

    if (!prescription) {
      return NextResponse.json({ error: "Patient relationship not found." }, { status: 404 });
    }

    return NextResponse.json({ prescription }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid prescription data.", issues: error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    console.error("Prescription creation failed", error);
    return NextResponse.json({ error: "Unable to create prescription." }, { status: 500 });
  }
}
