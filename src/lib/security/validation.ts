import { z } from "zod";

export function normalizeText(value: string) {
  return value.replace(/\p{C}/gu, "").replace(/\s+/g, " ").trim();
}

export function normalizeMultilineText(value: string) {
  return value
    .replace(/\p{C}/gu, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function textField(maxLength: number, message = "Invalid text.") {
  return z
    .string()
    .transform(normalizeText)
    .pipe(z.string().max(maxLength, message));
}

export function optionalTextField(maxLength: number) {
  return z
    .string()
    .transform(normalizeText)
    .pipe(z.string().max(maxLength))
    .transform((value) => (value.length > 0 ? value : null))
    .nullable()
    .optional();
}

export function optionalMultilineField(maxLength: number) {
  return z
    .string()
    .transform(normalizeMultilineText)
    .pipe(z.string().max(maxLength))
    .transform((value) => (value.length > 0 ? value : null))
    .nullable()
    .optional();
}

export const normalizeRequiredString = textField;
export const normalizeOptionalString = optionalTextField;
export const requiredNormalizedText = textField;
export const optionalNormalizedText = optionalMultilineField;
export const requiredSanitizedText = textField;
export const optionalSanitizedText = optionalMultilineField;
export const limitedText = textField;
export const limitedRequiredText = textField;
export const limitedOptionalText = optionalMultilineField;
