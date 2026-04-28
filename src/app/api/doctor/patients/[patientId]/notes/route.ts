import { ZodError } from "zod";

import { getCurrentDoctor, createDoctorPatientNote } from "@/lib/doctor/data";
import { doctorNoteSchema } from "@/lib/doctor/validation";
import { jsonError, jsonOk, parseJsonBody, validationError } from "@/lib/api/security";

type NotesRouteContext = {
  params: Promise<{
    patientId: string;
  }>;
};

export async function POST(request: Request, context: NotesRouteContext) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return jsonError("Expected application/json request body.", 415);
  }

  const doctor = await getCurrentDoctor();
  const { patientId } = await context.params;

  if (!doctor) {
    return jsonError("Doctor account required.", 403);
  }

  try {
    const body = await parseJsonBody(request);
    const payload = doctorNoteSchema.parse(body);
    const result = await createDoctorPatientNote({
      doctorId: doctor.id,
      doctorUserId: doctor.userId,
      patientId,
      input: payload,
    });

    if (!result) {
      return jsonError("Patient not found.", 404);
    }

    return jsonOk({ encounter: result }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError(error);
    }

    console.error("Doctor note creation failed", error);
    return jsonError("Unable to save note.", 500);
  }
}
