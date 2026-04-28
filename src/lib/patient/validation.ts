import { BloodType } from "@prisma/client";
import { z } from "zod";

const optionalString = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))
  .nullable()
  .optional();

const optionalDecimalString = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))
  .nullable()
  .optional()
  .refine((value) => value === null || value === undefined || !Number.isNaN(Number(value)), {
    message: "Must be a valid number.",
  });

export const patientProfileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required."),
  lastName: z.string().trim().min(1, "Last name is required."),
  dateOfBirth: optionalString,
  sex: z.enum(["MALE", "FEMALE", "INTERSEX", "UNKNOWN"]).nullable().optional(),
  bloodType: z.enum(BloodType).default(BloodType.UNKNOWN),
  heightCm: optionalDecimalString,
  weightKg: optionalDecimalString,
  organDonor: z.boolean().default(false),
  primaryLanguage: optionalString,
  emergencySummary: optionalString,
  emergencyContactName: optionalString,
  emergencyContactRelationship: optionalString,
  emergencyContactPhone: optionalString,
  emergencyContactEmail: optionalString,
});

export type PatientProfileInput = z.infer<typeof patientProfileSchema>;
