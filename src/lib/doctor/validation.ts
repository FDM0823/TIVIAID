import { z } from "zod";

export const scanPatientQrSchema = z.object({
  publicCode: z.string().trim().min(1, "Enter a patient QR public code."),
});

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))
  .nullable()
  .optional();

export const doctorNoteSchema = z.object({
  chiefComplaint: optionalText,
  subjective: optionalText,
  objective: optionalText,
  assessment: optionalText,
  plan: optionalText,
  noteTitle: z.string().trim().min(1, "Note title is required."),
  noteBody: z.string().trim().min(1, "Clinical note is required."),
  conditionName: optionalText,
  medicationName: optionalText,
  medicationDosage: optionalText,
  medicationFrequency: optionalText,
  allergySubstance: optionalText,
  allergyReaction: optionalText,
});

export type ScanPatientQrInput = z.infer<typeof scanPatientQrSchema>;
export type DoctorNoteInput = z.infer<typeof doctorNoteSchema>;
