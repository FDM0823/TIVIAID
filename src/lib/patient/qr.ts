import crypto from "node:crypto";

import { ConsentScope, QrCodeStatus, QrCodeType } from "@prisma/client";
import QRCode from "qrcode";

import { prisma } from "@/lib/prisma";

export function hashQrToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function createQrToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export function getEmergencyQrUrl(publicCode: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return new URL(`/emergency/${publicCode}`, baseUrl).toString();
}

export async function getOrCreateEmergencyQrCode(patientId: string) {
  const existingQrCode = await prisma.qrCode.findFirst({
    where: {
      patientId,
      status: QrCodeStatus.ACTIVE,
      type: QrCodeType.PATIENT_EMERGENCY,
    },
    orderBy: { createdAt: "desc" },
  });

  if (existingQrCode) {
    return existingQrCode;
  }

  const token = createQrToken();

  return prisma.qrCode.create({
    data: {
      patientId,
      type: QrCodeType.PATIENT_EMERGENCY,
      status: QrCodeStatus.ACTIVE,
      tokenHash: hashQrToken(token),
      publicCode: crypto.randomUUID(),
      label: "Emergency medical profile",
      allowedScopes: [ConsentScope.EMERGENCY_SUMMARY],
    },
  });
}

export async function createEmergencyQrImage(publicCode: string) {
  return QRCode.toDataURL(getEmergencyQrUrl(publicCode), {
    errorCorrectionLevel: "M",
    margin: 2,
    scale: 8,
    color: {
      dark: "#0f766e",
      light: "#ffffff",
    },
  });
}

export async function createEmergencyQrDataUrl(emergencyUrl: string) {
  return QRCode.toDataURL(emergencyUrl, {
    errorCorrectionLevel: "M",
    margin: 2,
    scale: 8,
    color: {
      dark: "#0f766e",
      light: "#ffffff",
    },
  });
}

export async function ensureEmergencyQrCode(patientId: string) {
  return getOrCreateEmergencyQrCode(patientId);
}
