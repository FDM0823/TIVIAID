import { EncounterType, MedicalRecordType, Prisma, RelationshipStatus, UserRole } from "@prisma/client";
import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import type { DoctorNoteInput } from "@/lib/doctor/validation";
import { decryptNullable, encryptNullable } from "@/lib/security/encryption";

export async function requireDoctorUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/doctor");
  }

  if (user.role !== UserRole.DOCTOR) {
    notFound();
  }

  const doctor = await prisma.doctor.findUnique({
    where: { userId: user.id },
    include: {
      user: {
        include: {
          profile: true,
        },
      },
    },
  });

  if (!doctor) {
    notFound();
  }

  return { user, doctor };
}

export async function getCurrentDoctor() {
  const user = await getCurrentUser();

  if (!user || user.role !== UserRole.DOCTOR) {
    return null;
  }

  return prisma.doctor.findUnique({
    where: { userId: user.id },
    include: {
      user: {
        include: {
          profile: true,
        },
      },
    },
  });
}

export async function getDoctorDashboardData() {
  const { doctor } = await requireDoctorUser();
  const relationships = await prisma.patientDoctor.findMany({
    where: {
      doctorId: doctor.id,
      status: RelationshipStatus.ACTIVE,
    },
    include: {
      patient: {
        include: {
          user: {
            include: {
              profile: true,
            },
          },
          encounters: {
            where: { doctorId: doctor.id },
            orderBy: { createdAt: "desc" },
            take: 3,
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return { doctor, relationships };
}

export async function scanPatientByPublicCode(doctorId: string, publicCode: string) {
  const qrCode = await prisma.qrCode.findUnique({
    where: { publicCode },
    include: {
      patient: {
        include: {
          user: {
            include: {
              profile: true,
            },
          },
          emergencyContacts: {
            orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
            take: 3,
          },
          allergies: {
            orderBy: { notedAt: "desc" },
            take: 8,
          },
          conditions: {
            orderBy: { createdAt: "desc" },
            take: 8,
          },
          medications: {
            orderBy: { createdAt: "desc" },
            take: 8,
          },
          encounters: {
            orderBy: { createdAt: "desc" },
            take: 5,
            include: {
              doctor: {
                include: {
                  user: {
                    include: {
                      profile: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (
    !qrCode ||
    qrCode.status !== "ACTIVE" ||
    qrCode.type !== "PATIENT_EMERGENCY" ||
    !qrCode.patient ||
    (qrCode.expiresAt && qrCode.expiresAt < new Date())
  ) {
    return null;
  }

  await prisma.$transaction([
    prisma.qrCode.update({
      where: { id: qrCode.id },
      data: { lastScannedAt: new Date() },
    }),
    prisma.emergencyAccessEvent.create({
      data: {
        patientId: qrCode.patient.id,
        qrCodeId: qrCode.id,
        requesterRole: "DOCTOR",
        accessReason: "Doctor simulated QR scan",
        status: "VERIFIED",
      },
    }),
    prisma.patientDoctor.upsert({
      where: {
        patientId_doctorId: {
          patientId: qrCode.patient.id,
          doctorId,
        },
      },
      update: {
        status: RelationshipStatus.ACTIVE,
        endedAt: null,
      },
      create: {
        patientId: qrCode.patient.id,
        doctorId,
        status: RelationshipStatus.ACTIVE,
        startedAt: new Date(),
      },
    }),
  ]);

  return qrCode.patient;
}

export async function getDoctorPatient(doctorId: string, patientId: string) {
  const relationship = await prisma.patientDoctor.findUnique({
    where: {
      patientId_doctorId: {
        patientId,
        doctorId,
      },
    },
    include: {
      patient: {
        include: {
          user: {
            include: {
              profile: true,
            },
          },
          emergencyContacts: {
            orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
            take: 3,
          },
          allergies: {
            orderBy: { notedAt: "desc" },
            take: 8,
          },
          conditions: {
            orderBy: { createdAt: "desc" },
            take: 8,
          },
          medications: {
            orderBy: { createdAt: "desc" },
            take: 8,
          },
          encounters: {
            orderBy: { createdAt: "desc" },
            take: 8,
            include: {
              doctor: {
                include: {
                  user: {
                    include: {
                      profile: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!relationship || relationship.status !== RelationshipStatus.ACTIVE) {
    return null;
  }

  return relationship.patient;
}

export async function createDoctorPatientNote({
  doctorId,
  doctorUserId,
  input,
  patientId,
}: {
  doctorId: string;
  doctorUserId: string;
  input: DoctorNoteInput;
  patientId: string;
}) {
  return prisma.$transaction(async (tx) => {
    const relationship = await tx.patientDoctor.findUnique({
      where: {
        patientId_doctorId: {
          patientId,
          doctorId,
        },
      },
      select: { id: true, status: true },
    });

    if (!relationship || relationship.status !== RelationshipStatus.ACTIVE) {
      return null;
    }

    const encounter = await tx.encounter.create({
      data: {
        patientId,
        doctorId,
        type: EncounterType.CONSULTATION,
        status: "SIGNED",
        chiefComplaint: input.chiefComplaint,
        subjective: encryptNullable(input.subjective),
        objective: encryptNullable(input.objective),
        assessment: encryptNullable(input.assessment),
        plan: encryptNullable(input.plan),
        signedAt: new Date(),
      },
    });

    await tx.medicalRecord.create({
      data: {
        patientId,
        encounterId: encounter.id,
        createdByUserId: doctorUserId,
        type: MedicalRecordType.ENCOUNTER_NOTE,
        title: input.noteTitle,
        description: encryptNullable(input.noteBody),
        metadata: {
          source: "doctor-dashboard",
          chiefComplaint: input.chiefComplaint,
          subjective: encryptNullable(input.subjective),
          objective: encryptNullable(input.objective),
          assessment: encryptNullable(input.assessment),
          plan: encryptNullable(input.plan),
        },
      },
    });

    if (input.conditionName) {
      await tx.condition.create({
        data: {
          patientId,
          name: input.conditionName,
          notes: encryptNullable(input.assessment),
        },
      });
    }

    if (input.medicationName) {
      await tx.medication.create({
        data: {
          patientId,
          name: input.medicationName,
          dosage: encryptNullable(input.medicationDosage),
          frequency: encryptNullable(input.medicationFrequency),
        },
      });
    }

    if (input.allergySubstance) {
      await tx.allergy.create({
        data: {
          patientId,
          substance: input.allergySubstance,
          reaction: encryptNullable(input.allergyReaction),
        },
      });
    }

    return getDoctorPatient(doctorId, patientId);
  });
}

type DoctorPatientView = Prisma.PatientGetPayload<{
  include: {
    user: { include: { profile: true } };
    emergencyContacts: true;
    allergies: true;
    conditions: true;
    medications: true;
    encounters: {
      include: {
        doctor: {
          include: {
            user: {
              include: {
                profile: true;
              };
            };
          };
        };
      };
    };
  };
}>;

export function toScannedPatientView(patient: DoctorPatientView, publicCode?: string) {
  const profile = patient.user.profile;
  const name = profile ? `${profile.firstName} ${profile.lastName}` : "TivAid patient";

  return {
    id: patient.id,
    publicCode: publicCode ?? "",
    name,
    dateOfBirth: profile?.dateOfBirth ? profile.dateOfBirth.toISOString().slice(0, 10) : null,
    sex: profile?.sex ?? null,
    bloodType: patient.bloodType,
    emergencySummary: decryptNullable(patient.emergencySummary),
    emergencyContacts: patient.emergencyContacts.map((contact) => ({
      name: contact.name,
      relationship: contact.relationship,
      phone: contact.phone,
    })),
    allergies: patient.allergies.map((allergy) => ({
      substance: allergy.substance,
      reaction: decryptNullable(allergy.reaction),
      severity: allergy.severity,
    })),
    conditions: patient.conditions.map((condition) => ({
      name: condition.name,
      status: condition.status,
      notes: decryptNullable(condition.notes),
    })),
    medications: patient.medications.map((medication) => ({
      name: medication.name,
      dosage: decryptNullable(medication.dosage),
      frequency: decryptNullable(medication.frequency),
    })),
    encounters: patient.encounters.map((encounter) => {
      const doctorProfile = encounter.doctor.user.profile;
      const doctorName = doctorProfile
        ? `Dr. ${doctorProfile.firstName} ${doctorProfile.lastName}`
        : "Doctor";

      return {
        id: encounter.id,
        type: encounter.type,
        status: encounter.status,
        chiefComplaint: encounter.chiefComplaint,
        assessment: decryptNullable(encounter.assessment),
        plan: decryptNullable(encounter.plan),
        createdAt: encounter.createdAt.toISOString(),
        doctorName,
      };
    }),
  };
}
