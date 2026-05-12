import { Prisma, UserRole } from "@prisma/client";
import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import type { PatientProfileInput } from "@/lib/patient/validation";
import { decryptNullable, encryptNullable } from "@/lib/security/encryption";

const patientProfileInclude = {
  user: {
    include: {
      profile: true,
    },
  },
  emergencyContacts: {
    orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
    take: 1,
  },
} satisfies Prisma.PatientInclude;

type PatientWithProfile = Prisma.PatientGetPayload<{
  include: typeof patientProfileInclude;
}>;

export type PatientProfileView = {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  sex: string | null;
  bloodType: string;
  heightCm: string | null;
  weightKg: string | null;
  organDonor: boolean;
  primaryLanguage: string | null;
  emergencySummary: string | null;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    email: string | null;
  } | null;
};

export type PatientEmergencyReadinessView = {
  activeAllergyCount: number;
  activeConditionCount: number;
  activeMedicationCount: number;
  bloodType: string;
  dateOfBirth: string | null;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  } | null;
  emergencySummary: string | null;
  heightCm: string | null;
  patientName: string;
  primaryLanguage: string | null;
  qrCode: {
    createdAt: string;
    lastScannedAt: string | null;
    publicCode: string;
  } | null;
  recentAccessEvents: Array<{
    accessReason: string | null;
    id: string;
    openedAt: string;
    requesterRole: string | null;
    status: string;
  }>;
  weightKg: string | null;
};

export type PatientProfile = Awaited<ReturnType<typeof getPatientProfileForCurrentUser>>;

export async function requirePatientUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/patient");
  }

  if (user.role !== UserRole.PATIENT) {
    notFound();
  }

  const patient = await prisma.patient.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!patient) {
    notFound();
  }

  return { user, patient };
}

export async function getCurrentPatient() {
  const user = await getCurrentUser();

  if (!user || user.role !== UserRole.PATIENT) {
    return null;
  }

  return prisma.patient.findUnique({
    where: { userId: user.id },
    select: { id: true, userId: true },
  });
}

export async function getPatientProfileForCurrentUser() {
  const { user } = await requirePatientUser();

  const patient = await prisma.patient.findUnique({
    where: { userId: user.id },
    include: {
      user: {
        include: {
          profile: true,
        },
      },
      emergencyContacts: {
        orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
      },
      allergies: {
        orderBy: { notedAt: "desc" },
      },
      conditions: {
        orderBy: { createdAt: "desc" },
      },
      medications: {
        orderBy: { createdAt: "desc" },
      },
      qrCodes: {
        where: {
          type: "PATIENT_EMERGENCY",
          status: "ACTIVE",
        },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!patient) {
    notFound();
  }

  return patient;
}

export async function getPatientProfile(userId: string): Promise<PatientProfileView | null> {
  const patient = await prisma.patient.findUnique({
    where: { userId },
    include: patientProfileInclude,
  });

  return patient ? toPatientProfileView(patient) : null;
}

export async function getPatientEmergencyReadiness(
  userId: string,
): Promise<PatientEmergencyReadinessView | null> {
  const patient = await prisma.patient.findUnique({
    where: { userId },
    include: {
      user: {
        include: {
          profile: true,
        },
      },
      emergencyContacts: {
        orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
        take: 1,
      },
      allergies: {
        where: { resolvedAt: null },
        select: { id: true },
      },
      conditions: {
        where: { status: { in: ["ACTIVE", "REMISSION"] } },
        select: { id: true },
      },
      medications: {
        where: { active: true },
        select: { id: true },
      },
      qrCodes: {
        where: {
          type: "PATIENT_EMERGENCY",
          status: "ACTIVE",
        },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      emergencyAccessEvents: {
        orderBy: { openedAt: "desc" },
        take: 4,
      },
    },
  });

  if (!patient) {
    return null;
  }

  const profile = patient.user.profile;
  const contact = patient.emergencyContacts[0];
  const qrCode = patient.qrCodes[0];

  return {
    activeAllergyCount: patient.allergies.length,
    activeConditionCount: patient.conditions.length,
    activeMedicationCount: patient.medications.length,
    bloodType: patient.bloodType,
    dateOfBirth: profile?.dateOfBirth ? profile.dateOfBirth.toISOString().slice(0, 10) : null,
    emergencyContact: contact
      ? {
          name: contact.name,
          phone: decryptNullable(contact.phone) ?? "",
          relationship: contact.relationship,
        }
      : null,
    emergencySummary: decryptNullable(patient.emergencySummary),
    heightCm: patient.heightCm?.toString() ?? null,
    patientName: profile ? `${profile.firstName} ${profile.lastName}` : "TivAid patient",
    primaryLanguage: patient.primaryLanguage,
    qrCode: qrCode
      ? {
          createdAt: qrCode.createdAt.toISOString(),
          lastScannedAt: qrCode.lastScannedAt?.toISOString() ?? null,
          publicCode: qrCode.publicCode,
        }
      : null,
    recentAccessEvents: patient.emergencyAccessEvents.map((event) => ({
      accessReason: event.accessReason,
      id: event.id,
      openedAt: event.openedAt.toISOString(),
      requesterRole: event.requesterRole,
      status: event.status,
    })),
    weightKg: patient.weightKg?.toString() ?? null,
  };
}

export async function updatePatientProfile(userId: string, input: PatientProfileInput) {
  const patient = await prisma.patient.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!patient) {
    return null;
  }

  await prisma.$transaction(async (tx) => {
    await tx.profile.update({
      where: { userId },
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
        sex: input.sex,
      },
    });

    await tx.patient.update({
      where: { id: patient.id },
      data: {
        bloodType: input.bloodType,
        heightCm: toDecimal(input.heightCm),
        weightKg: toDecimal(input.weightKg),
        organDonor: input.organDonor,
        primaryLanguage: input.primaryLanguage,
        emergencySummary: encryptNullable(input.emergencySummary),
      },
    });

    const contact = await tx.emergencyContact.findFirst({
      where: { patientId: patient.id, priority: 1 },
      select: { id: true },
    });

    const contactName = input.emergencyContactName;
    const contactRelationship = input.emergencyContactRelationship;
    const contactPhone = input.emergencyContactPhone;
    const hasContact = Boolean(contactName && contactRelationship && contactPhone);

    if (hasContact && contact) {
      await tx.emergencyContact.update({
        where: { id: contact.id },
        data: {
          name: contactName!,
          relationship: contactRelationship!,
          phone: encryptNullable(contactPhone)!,
          email: encryptNullable(input.emergencyContactEmail),
        },
      });
    }

    if (hasContact && !contact) {
      await tx.emergencyContact.create({
        data: {
          patientId: patient.id,
          name: contactName!,
          relationship: contactRelationship!,
          phone: encryptNullable(contactPhone)!,
          email: encryptNullable(input.emergencyContactEmail),
          priority: 1,
        },
      });
    }

    if (!hasContact && contact) {
      await tx.emergencyContact.delete({
        where: { id: contact.id },
      });
    }
  });

  return getPatientProfile(userId);
}

function toPatientProfileView(patient: PatientWithProfile): PatientProfileView {
  const profile = patient.user.profile;

  return {
    id: patient.id,
    firstName: profile?.firstName ?? "",
    lastName: profile?.lastName ?? "",
    dateOfBirth: profile?.dateOfBirth ? profile.dateOfBirth.toISOString().slice(0, 10) : null,
    sex: profile?.sex ?? null,
    bloodType: patient.bloodType,
    heightCm: patient.heightCm?.toString() ?? null,
    weightKg: patient.weightKg?.toString() ?? null,
    organDonor: patient.organDonor,
    primaryLanguage: patient.primaryLanguage,
    emergencySummary: decryptNullable(patient.emergencySummary),
    emergencyContact: patient.emergencyContacts[0]
      ? {
          name: patient.emergencyContacts[0].name,
          relationship: patient.emergencyContacts[0].relationship,
          phone: decryptNullable(patient.emergencyContacts[0].phone) ?? "",
          email: decryptNullable(patient.emergencyContacts[0].email),
        }
      : null,
  };
}

function toDecimal(value: string | null | undefined) {
  return value ? new Prisma.Decimal(value) : null;
}
