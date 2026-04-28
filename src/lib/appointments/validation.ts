import { AppointmentStatus } from "@prisma/client";
import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))
  .nullable()
  .optional();

export const createAppointmentSchema = z.object({
  doctorId: z.string().trim().min(1, "Doctor is required."),
  startsAt: z.string().trim().min(1, "Choose a valid start date and time."),
  durationMinutes: z.number().int().min(15).max(240).default(30),
  reason: optionalText,
  notes: optionalText,
});

export const updateAppointmentStatusSchema = z.object({
  status: z.enum([
    AppointmentStatus.CONFIRMED,
    AppointmentStatus.CANCELLED,
    AppointmentStatus.CHECKED_IN,
    AppointmentStatus.COMPLETED,
    AppointmentStatus.NO_SHOW,
  ]),
  cancellationReason: optionalText,
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentStatusInput = z.infer<typeof updateAppointmentStatusSchema>;
