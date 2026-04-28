import { ZodError } from "zod";

import { secureJson } from "@/lib/api/security";
import { getCurrentDoctor, scanPatientByPublicCode } from "@/lib/doctor/data";
import { scanPatientQrSchema } from "@/lib/doctor/validation";

export async function POST(request: Request) {
  try {
    const doctor = await getCurrentDoctor();

    if (!doctor) {
      return secureJson({ error: "Doctor account required." }, { status: 403 });
    }

    const payload = scanPatientQrSchema.parse(await request.json());
    const patient = await scanPatientByPublicCode(doctor.id, payload.publicCode);

    if (!patient) {
      return secureJson(
        { error: "No active patient emergency QR was found for that code." },
        { status: 404 },
      );
    }

    return secureJson({ patient });
  } catch (error) {
    if (error instanceof ZodError) {
      return secureJson(
        { error: "Invalid QR scan payload.", issues: error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    console.error("Doctor QR scan failed", error);
    return secureJson({ error: "Unable to scan patient QR." }, { status: 500 });
  }
}
