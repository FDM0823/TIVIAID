import { NextResponse } from "next/server";
import { ZodError } from "zod";

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
    const payload = updateAppointmentStatusSchema.parse(await request.json());
    const result = await updateAppointmentStatus(appointmentId, payload);

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ appointment: result.appointment });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid appointment status data.", issues: error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    console.error("Appointment status update failed", error);
    return NextResponse.json({ error: "Unable to update appointment." }, { status: 500 });
  }
}
