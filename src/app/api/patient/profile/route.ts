import { ZodError } from "zod";

import { parseJsonBody, secureJson } from "@/lib/api/security";
import { getCurrentUser } from "@/lib/auth/session";
import { getPatientProfile, updatePatientProfile } from "@/lib/patient/data";
import { patientProfileSchema } from "@/lib/patient/validation";

export async function GET() {
  const user = await getCurrentUser();

  if (!user || user.role !== "PATIENT") {
    return secureJson({ error: "Patient account required." }, { status: 403 });
  }

  const profile = await getPatientProfile(user.id);

  if (!profile) {
    return secureJson({ error: "Patient profile not found." }, { status: 404 });
  }

  return secureJson({ profile });
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();

  if (!user || user.role !== "PATIENT") {
    return secureJson({ error: "Patient account required." }, { status: 403 });
  }

  try {
    const body = await parseJsonBody(request);
    const payload = patientProfileSchema.parse(body);
    const profile = await updatePatientProfile(user.id, payload);

    return secureJson({ profile });
  } catch (error) {
    if (error instanceof ZodError) {
      return secureJson(
        { error: "Invalid patient profile data.", issues: error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    console.error("Patient profile update failed", error);
    return secureJson({ error: "Unable to update patient profile." }, { status: 500 });
  }
}
