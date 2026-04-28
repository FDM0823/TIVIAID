import { z } from "zod";

import { normalizeText } from "@/lib/security/validation";

import { AUTH_ROLES } from "./constants";

export const loginSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const registerSchema = z
  .object({
    email: z.email().trim().toLowerCase(),
    password: z.string().min(8, "Password must be at least 8 characters."),
    firstName: z.string().transform(normalizeText).pipe(z.string().min(1, "First name is required.").max(80)),
    lastName: z.string().transform(normalizeText).pipe(z.string().min(1, "Last name is required.").max(80)),
    role: z.enum(AUTH_ROLES),
    licenseNumber: z.string().transform(normalizeText).pipe(z.string().max(80)).optional(),
    licenseCountry: z.string().transform(normalizeText).pipe(z.string().max(80)).optional(),
    licenseRegion: z.string().transform(normalizeText).pipe(z.string().max(80)).optional(),
    specialty: z.string().transform(normalizeText).pipe(z.string().max(120)).optional(),
  })
  .superRefine((value, context) => {
    if (value.role !== "DOCTOR") {
      return;
    }

    if (!value.licenseNumber) {
      context.addIssue({
        code: "custom",
        message: "License number is required for doctor registration.",
        path: ["licenseNumber"],
      });
    }

    if (!value.licenseCountry) {
      context.addIssue({
        code: "custom",
        message: "License country is required for doctor registration.",
        path: ["licenseCountry"],
      });
    }

    if (!value.specialty) {
      context.addIssue({
        code: "custom",
        message: "Specialty is required for doctor registration.",
        path: ["specialty"],
      });
    }
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
