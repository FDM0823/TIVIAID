import { ZodError } from "zod";

import { parseJsonBody, secureJson } from "@/lib/api/security";
import { updateAppointmentStatus } from "@/lib/appointments/data";
import { updateAppointmentStatusSchema } from "@/lib/appointments/validation";

type AppointmentStatusContext = {
  params: Promise<{
    appointmentId: string;
  }>;
};

export async function PATCH(request: Request, context: AppointmentStatusContext) {
  try {
    const { appointmentId } = await context.params;
    const payload = updateAppointmentStatusSchema.parse(await parseJsonBody(request));
    const result = await updateAppointmentStatus(appointmentId, payload);

    if ("error" in result) {
      return secureJson({ error: result.error }, { status: result.status });
    }

    return secureJson({ appointment: result.appointment });
  } catch (error) {
    if (error instanceof ZodError) {
      return secureJson(
        { error: "Invalid appointment status data.", issues: error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    console.error("Appointment status update failed", error);
    return secureJson({ error: "Unable to update appointment." }, { status: 500 });
  }
}
