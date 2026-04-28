import { z } from "zod";

import { limitedOptionalText, limitedRequiredText } from "@/lib/security/validation";

export const prescriptionSchema = z.object({
  patientId: z.string().trim().min(1, "Patient is required."),
  medicationName: limitedRequiredText(160),
  dosage: limitedRequiredText(120),
  frequency: limitedRequiredText(160),
  route: limitedOptionalText(120),
  quantity: limitedOptionalText(120),
  refills: z.coerce.number().int().min(0).max(12).default(0),
  instructions: limitedOptionalText(2000),
  expiresAt: limitedOptionalText(40),
});

export type PrescriptionInput = z.infer<typeof prescriptionSchema>;
