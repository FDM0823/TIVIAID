import { z } from "zod";

import { optionalNormalizedText, requiredNormalizedText } from "@/lib/security/validation";

export const scanPatientQrSchema = z.object({
  publicCode: requiredNormalizedText(128, "Enter a patient QR public code."),
});

export const doctorNoteSchema = z.object({
  chiefComplaint: optionalNormalizedText(500),
  subjective: optionalNormalizedText(4000),
  objective: optionalNormalizedText(4000),
  assessment: optionalNormalizedText(4000),
  plan: optionalNormalizedText(4000),
  noteTitle: requiredNormalizedText(200, "Note title is required."),
  noteBody: requiredNormalizedText(8000, "Clinical note is required."),
  conditionName: optionalNormalizedText(200),
  medicationName: optionalNormalizedText(200),
  medicationDosage: optionalNormalizedText(120),
  medicationFrequency: optionalNormalizedText(120),
  allergySubstance: optionalNormalizedText(200),
  allergyReaction: optionalNormalizedText(500),
});

export type ScanPatientQrInput = z.infer<typeof scanPatientQrSchema>;
export type DoctorNoteInput = z.infer<typeof doctorNoteSchema>;
