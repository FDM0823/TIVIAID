import { ZodError } from "zod";

import { getCurrentDoctor } from "@/lib/doctor/data";
import { methodNotAllowed, parseJsonBody, secureJson, validationErrorJson } from "@/lib/api/security";
import { createDigitalPrescription, getPrescriptionsForCurrentUser } from "@/lib/prescriptions/data";
import { prescriptionSchema } from "@/lib/prescriptions/validation";

export async function GET() {
  const prescriptions = await getPrescriptionsForCurrentUser();

  return secureJson({ prescriptions });
}

export async function POST(request: Request) {
  const doctor = await getCurrentDoctor();

  if (!doctor) {
    return secureJson({ error: "Doctor account required." }, { status: 403 });
  }

  try {
    const payload = prescriptionSchema.parse(await parseJsonBody(request));
    const prescription = await createDigitalPrescription({
      doctorId: doctor.id,
      input: payload,
    });

    if (!prescription) {
      return secureJson({ error: "Patient relationship not found." }, { status: 404 });
    }

    return secureJson({ prescription }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorJson("Invalid prescription data.", error);
    }

    console.error("Prescription creation failed", error);
    return secureJson({ error: "Unable to create prescription." }, { status: 500 });
  }
}

export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
