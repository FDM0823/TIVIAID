import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))
  .nullable()
  .optional();

export const prescriptionSchema = z.object({
  patientId: z.string().trim().min(1, "Patient is required."),
  medicationName: z.string().trim().min(1, "Medication name is required."),
  dosage: z.string().trim().min(1, "Dosage is required."),
  frequency: z.string().trim().min(1, "Frequency is required."),
  route: optionalText,
  quantity: optionalText,
  refills: z.coerce.number().int().min(0).max(12).default(0),
  instructions: optionalText,
  expiresAt: optionalText,
});

export type PrescriptionInput = z.infer<typeof prescriptionSchema>;
