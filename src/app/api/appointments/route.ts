import { ZodError } from "zod";

import { getCurrentUser } from "@/lib/auth/session";
import { createAppointment, getAppointmentDashboardData } from "@/lib/appointments/data";
import { createAppointmentSchema } from "@/lib/appointments/validation";
import { parseJsonBody, secureJson, secureJsonError } from "@/lib/api/security";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return secureJsonError("Authentication required.", 401);
  }

  try {
    const data = await getAppointmentDashboardData();
    return secureJson({ appointments: data.appointments });
  } catch (error) {
    console.error("Appointment list failed", error);
    return secureJsonError("Unable to load appointments.", 500);
  }
}

export async function POST(request: Request) {
  try {
    const input = createAppointmentSchema.parse(await parseJsonBody(request));
    const result = await createAppointment(input);

    if ("error" in result) {
      return secureJsonError(result.error ?? "Unable to create appointment.", result.status);
    }

    return secureJson({ appointment: result.appointment }, { status: result.status });
  } catch (error) {
    if (error instanceof ZodError) {
      return secureJsonError("Invalid appointment data.", 400, error.flatten().fieldErrors);
    }

    console.error("Appointment creation failed", error);
    return secureJsonError("Unable to create appointment.", 500);
  }
}
