import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getCurrentDoctor, createDoctorPatientNote } from "@/lib/doctor/data";
import { doctorNoteSchema } from "@/lib/doctor/validation";

type NotesRouteContext = {
  params: Promise<{
    patientId: string;
  }>;
};

export async function POST(request: Request, context: NotesRouteContext) {
  const doctor = await getCurrentDoctor();
  const { patientId } = await context.params;

  if (!doctor) {
    return NextResponse.json({ error: "Doctor account required." }, { status: 403 });
  }

  try {
    const payload = doctorNoteSchema.parse(await request.json());
    const result = await createDoctorPatientNote({
      doctorId: doctor.id,
      doctorUserId: doctor.userId,
      patientId,
      input: payload,
    });

    if (!result) {
      return NextResponse.json({ error: "Patient not found." }, { status: 404 });
    }

    return NextResponse.json({ encounter: result }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid note data.", issues: error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    console.error("Doctor note creation failed", error);
    return NextResponse.json({ error: "Unable to save note." }, { status: 500 });
  }
}
