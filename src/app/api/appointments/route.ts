import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getCurrentUser } from "@/lib/auth/session";
import { createAppointment, getAppointmentDashboardData } from "@/lib/appointments/data";
import { createAppointmentSchema } from "@/lib/appointments/validation";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const data = await getAppointmentDashboardData();
    return NextResponse.json({ appointments: data.appointments });
  } catch (error) {
    console.error("Appointment list failed", error);
    return NextResponse.json({ error: "Unable to load appointments." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const input = createAppointmentSchema.parse(await request.json());
    const result = await createAppointment(input);

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ appointment: result.appointment }, { status: result.status });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid appointment data.", issues: error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    console.error("Appointment creation failed", error);
    return NextResponse.json({ error: "Unable to create appointment." }, { status: 500 });
  }
}
