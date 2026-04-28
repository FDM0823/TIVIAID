import crypto from "node:crypto";

import { Prisma, PrescriptionStatus, QrCodeStatus, QrCodeType, RelationshipStatus } from "@prisma/client";
import QRCode from "qrcode";

import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import type { PrescriptionInput } from "@/lib/prescriptions/validation";
import { decryptNullable, encryptNullable } from "@/lib/security/encryption";

export async function getCurrentPrescriptionActor() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const [patient, doctor] = await Promise.all([
    prisma.patient.findUnique({ where: { userId: user.id }, select: { id: true } }),
    prisma.doctor.findUnique({ where: { userId: user.id }, select: { id: true } }),
  ]);

  return { user, patient, doctor };
}

export async function createPrescriptionForDoctor({
  doctorId,
  input,
}: {
  doctorId: string;
  input: PrescriptionInput;
}) {
  const relationship = await prisma.patientDoctor.findUnique({
    where: {
      patientId_doctorId: {
        patientId: input.patientId,
        doctorId,
      },
    },
    select: { status: true },
  });

  if (!relationship || relationship.status !== RelationshipStatus.ACTIVE) {
    return null;
  }

  const publicCode = crypto.randomUUID();
  const tokenHash = crypto.createHash("sha256").update(publicCode).digest("hex");

  return prisma.$transaction(async (tx) => {
    const qrCode = await tx.qrCode.create({
      data: {
        type: QrCodeType.PRESCRIPTION_VERIFY,
        status: QrCodeStatus.ACTIVE,
        tokenHash,
        publicCode,
        label: `Prescription verification for ${input.medicationName}`,
      },
    });

    const prescription = await tx.prescription.create({
      data: {
        patientId: input.patientId,
        doctorId,
        status: PrescriptionStatus.ACTIVE,
        medicationName: input.medicationName,
        dosage: input.dosage,
        frequency: input.frequency,
        route: input.route,
        quantity: input.quantity,
        refills: input.refills,
        instructions: encryptNullable(input.instructions),
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
        verificationQrCodeId: qrCode.id,
      },
      include: prescriptionInclude,
    });

    return prescription;
  });
}

export async function getVisiblePrescriptions() {
  const actor = await getCurrentPrescriptionActor();

  if (!actor) {
    return null;
  }

  if (actor.patient) {
    return prisma.prescription.findMany({
      where: { patientId: actor.patient.id },
      include: prescriptionInclude,
      orderBy: { prescribedAt: "desc" },
    });
  }

  if (actor.doctor) {
    return prisma.prescription.findMany({
      where: { doctorId: actor.doctor.id },
      include: prescriptionInclude,
      orderBy: { prescribedAt: "desc" },
    });
  }

  return [];
}

export async function getPrescriptionForActor(prescriptionId: string) {
  const actor = await getCurrentPrescriptionActor();

  if (!actor) {
    return null;
  }

  const prescription = await prisma.prescription.findUnique({
    where: { id: prescriptionId },
    include: prescriptionInclude,
  });

  if (!prescription) {
    return null;
  }

  if (actor.patient?.id === prescription.patientId || actor.doctor?.id === prescription.doctorId) {
    return prescription;
  }

  return null;
}

export async function getPrescriptionByPublicCode(publicCode: string) {
  let qrCode;
  try {
    qrCode = await prisma.qrCode.findUnique({
      where: { publicCode },
      include: {
        prescriptions: {
          include: prescriptionInclude,
          take: 1,
        },
      },
    });
  } catch (error) {
    console.error("Prescription verification lookup failed", error);
    return null;
  }

  if (!qrCode || qrCode.type !== QrCodeType.PRESCRIPTION_VERIFY || qrCode.status !== QrCodeStatus.ACTIVE) {
    return null;
  }

  return qrCode.prescriptions[0] ?? null;
}

export async function getPrescriptionByIdForActor(prescriptionId: string) {
  return getPrescriptionForActor(prescriptionId);
}

export async function getPrescriptionsForCurrentUser() {
  const prescriptions = await getVisiblePrescriptions();

  return prescriptions?.map(toPrescriptionView) ?? [];
}

export async function createDigitalPrescription({
  doctorId,
  input,
}: {
  doctorId: string;
  input: PrescriptionInput;
}) {
  const prescription = await createPrescriptionForDoctor({ doctorId, input });

  return prescription ? toPrescriptionView(prescription) : null;
}

export async function getPrescriptionVerificationView(publicCode: string) {
  const prescription = await getPrescriptionByPublicCode(publicCode);

  return prescription ? toPrescriptionView(prescription) : null;
}

export async function getPrescriptionPdfView(prescriptionId: string) {
  const prescription = await getPrescriptionForActor(prescriptionId);

  return prescription ? toPrescriptionView(prescription) : null;
}

export async function getPrescriptionForPdfById(prescriptionId: string) {
  const prescription = await getPrescriptionForActor(prescriptionId);

  if (!prescription) {
    return null;
  }

  return {
    ...toPrescriptionView(prescription),
    patientEmail: prescription.patient.user.email,
    doctorSpecialty: prescription.doctor.specialty,
  };
}

export function getPrescriptionVerificationUrl(publicCode: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return new URL(`/prescriptions/verify/${publicCode}`, baseUrl).toString();
}

export async function createPrescriptionQrImage(publicCode: string) {
  return QRCode.toDataURL(getPrescriptionVerificationUrl(publicCode), {
    errorCorrectionLevel: "M",
    margin: 2,
    scale: 7,
    color: {
      dark: "#0f172a",
      light: "#ffffff",
    },
  });
}

export function toPrescriptionView(prescription: PrescriptionWithRelations) {
  if (!prescription) {
    throw new Error("Prescription is required.");
  }

  const patientProfile = prescription.patient.user.profile;
  const doctorProfile = prescription.doctor.user.profile;
  const publicCode = prescription.verificationQrCode?.publicCode ?? "";

  return {
    id: prescription.id,
    medicationName: prescription.medicationName,
    dosage: prescription.dosage,
    frequency: prescription.frequency,
    route: prescription.route,
    quantity: prescription.quantity,
    refills: prescription.refills,
    instructions: decryptNullable(prescription.instructions),
    status: prescription.status,
    prescribedAt: prescription.prescribedAt.toISOString(),
    expiresAt: prescription.expiresAt?.toISOString() ?? null,
    publicCode,
    verificationUrl: publicCode ? getPrescriptionVerificationUrl(publicCode) : null,
    patientName: patientProfile
      ? `${patientProfile.firstName} ${patientProfile.lastName}`
      : "TivAid patient",
    doctorName: doctorProfile
      ? `Dr. ${doctorProfile.firstName} ${doctorProfile.lastName}`
      : "TivAid doctor",
    doctorLicense: prescription.doctor.licenseNumber,
  };
}

const prescriptionInclude = {
  verificationQrCode: true,
  patient: {
    include: {
      user: {
        include: {
          profile: true,
        },
      },
    },
  },
  doctor: {
    include: {
      user: {
        include: {
          profile: true,
        },
      },
    },
  },
} as const;

export type PrescriptionView = ReturnType<typeof toPrescriptionView>;

type PrescriptionWithRelations = Prisma.PrescriptionGetPayload<{
  include: typeof prescriptionInclude;
}>;

export type PrescriptionPdfView = NonNullable<
  Awaited<ReturnType<typeof getPrescriptionForPdfById>>
>;
