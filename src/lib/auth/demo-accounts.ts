import type { Prisma, Sex } from "@prisma/client";

import { hashPassword } from "@/lib/auth/password";
import type { AuthRole } from "@/lib/auth/constants";
import { DEFAULT_DEMO_CREDENTIALS } from "@/lib/auth/demo-credentials";
import { prisma } from "@/lib/prisma";

type DemoAccountKind = "patient" | "doctor" | "lab";

type DemoAccountDefinition = {
  firstName: string;
  kind: DemoAccountKind;
  lastName: string;
  prefix: string;
  role: AuthRole;
};

export type ConfiguredDemoAccount = DemoAccountDefinition & {
  email: string;
  password: string;
};

const demoAccountDefinitions: DemoAccountDefinition[] = [
  {
    firstName: "Camila",
    kind: "patient",
    lastName: "Torres",
    prefix: "DEMO_PATIENT",
    role: "PATIENT",
  },
  {
    firstName: "Valeria",
    kind: "doctor",
    lastName: "Cruz",
    prefix: "DEMO_DOCTOR",
    role: "DOCTOR",
  },
  {
    firstName: "Laboratorio",
    kind: "lab",
    lastName: "Demo",
    prefix: "DEMO_LAB",
    role: "CLINIC_ADMIN",
  },
];

export function getConfiguredDemoAccounts() {
  if (process.env.DEMO_ACCOUNTS_ENABLED === "false") {
    return [];
  }

  return demoAccountDefinitions.flatMap((definition) => {
    const fallback = DEFAULT_DEMO_CREDENTIALS.find(
      (credential) => credential.kind === definition.kind,
    );
    const email =
      process.env[`${definition.prefix}_EMAIL`]?.trim().toLowerCase() ?? fallback?.email;
    const password = process.env[`${definition.prefix}_PASSWORD`]?.trim() ?? fallback?.password;

    if (!email || !password) {
      return [];
    }

    return [{ ...definition, email, password }];
  });
}

export function findConfiguredDemoAccount(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  return getConfiguredDemoAccounts().find((account) => account.email === normalizedEmail);
}

export async function upsertDemoAccount(account: ConfiguredDemoAccount): Promise<DemoUser> {
  const passwordHash = await hashPassword(account.password);

  const user = await prisma.user.upsert({
    where: { email: account.email },
    update: {
      passwordHash,
      role: account.role,
      status: "ACTIVE",
      profile: {
        upsert: {
          create: buildDemoProfile(account),
          update: buildDemoProfile(account),
        },
      },
    },
    create: {
      email: account.email,
      passwordHash,
      role: account.role,
      status: "ACTIVE",
      profile: {
        create: buildDemoProfile(account),
      },
    },
    include: { profile: true },
  });

  if (account.role === "PATIENT") {
    await upsertDemoPatient(user.id);
  }

  if (account.role === "DOCTOR") {
    await prisma.doctor.upsert({
      where: { userId: user.id },
      update: {
        licenseCountry: "US",
        specialty: "Medicina familiar",
        verificationStatus: "VERIFIED",
        verifiedAt: new Date(),
      },
      create: {
        licenseCountry: "US",
        licenseNumber: buildDemoLicenseNumber(account),
        specialty: "Medicina familiar",
        userId: user.id,
        verificationStatus: "VERIFIED",
        verifiedAt: new Date(),
      },
    });
  }

  if (account.role === "CLINIC_ADMIN") {
    await upsertDemoClinicMembership(user.id);
  }

  return user;
}

function buildDemoProfile(account: ConfiguredDemoAccount) {
  const sex: Sex = account.role === "PATIENT" ? "FEMALE" : "UNKNOWN";

  return {
    dateOfBirth: account.role === "PATIENT" ? new Date("1991-04-18") : null,
    firstName: account.firstName,
    lastName: account.lastName,
    sex,
  };
}

async function upsertDemoPatient(userId: string) {
  const patient = await prisma.patient.upsert({
    where: { userId },
    update: {
      bloodType: "O_NEGATIVE",
      emergencySummary:
        "Paciente demo con alergia vital a penicilina, asma severa y diabetes tipo 1. Porta bomba de insulina y requiere verificar glucosa capilar durante triage.",
      heightCm: "168",
      organDonor: true,
      primaryLanguage: "Spanish",
      weightKg: "62",
    },
    create: {
      bloodType: "O_NEGATIVE",
      emergencySummary:
        "Paciente demo con alergia vital a penicilina, asma severa y diabetes tipo 1. Porta bomba de insulina y requiere verificar glucosa capilar durante triage.",
      heightCm: "168",
      organDonor: true,
      primaryLanguage: "Spanish",
      userId,
      weightKg: "62",
    },
  });

  await prisma.$transaction([
    prisma.emergencyContact.deleteMany({ where: { patientId: patient.id } }),
    prisma.allergy.deleteMany({ where: { patientId: patient.id } }),
    prisma.condition.deleteMany({ where: { patientId: patient.id } }),
    prisma.medication.deleteMany({ where: { patientId: patient.id } }),
    prisma.emergencyContact.create({
      data: {
        name: "Sofia Ramirez",
        patientId: patient.id,
        phone: "+1 (555) 018-4432",
        priority: 1,
        relationship: "Hermana",
      },
    }),
    prisma.allergy.createMany({
      data: [
        {
          patientId: patient.id,
          reaction: "Anafilaxia documentada",
          severity: "LIFE_THREATENING",
          substance: "Penicilina",
        },
        {
          patientId: patient.id,
          reaction: "Broncoespasmo",
          severity: "SEVERE",
          substance: "Aspirina",
        },
      ],
    }),
    prisma.condition.createMany({
      data: [
        {
          name: "Asma severa",
          notes: "Usa inhalador de rescate",
          patientId: patient.id,
          status: "ACTIVE",
        },
        {
          name: "Diabetes tipo 1",
          notes: "Bomba de insulina",
          patientId: patient.id,
          status: "ACTIVE",
        },
      ],
    }),
    prisma.medication.createMany({
      data: [
        {
          active: true,
          dosage: "100 mcg",
          frequency: "cada 6 horas si precisa",
          name: "Salbutamol",
          patientId: patient.id,
        },
        {
          active: true,
          dosage: "bomba",
          frequency: "continua",
          name: "Insulina lispro",
          patientId: patient.id,
        },
      ],
    }),
  ]);
}

function buildDemoLicenseNumber(account: ConfiguredDemoAccount) {
  return `TIVAID-DEMO-${account.email.replace(/[^a-z0-9]/gi, "").slice(0, 24).toUpperCase()}`;
}

async function upsertDemoClinicMembership(userId: string) {
  const clinic = await prisma.clinic.upsert({
    where: { registrationNo: "TIVAID-DEMO-LAB" },
    update: {
      email: "lab-demo@tivaid.local",
      name: "TivAid Lab Demo",
    },
    create: {
      email: "lab-demo@tivaid.local",
      name: "TivAid Lab Demo",
      registrationNo: "TIVAID-DEMO-LAB",
    },
  });

  await prisma.clinicMember.upsert({
    where: {
      clinicId_userId: {
        clinicId: clinic.id,
        userId,
      },
    },
    update: {
      active: true,
      role: "LAB_ADMIN",
    },
    create: {
      active: true,
      clinicId: clinic.id,
      role: "LAB_ADMIN",
      userId,
    },
  });
}

export type DemoUser = Prisma.UserGetPayload<{
  include: { profile: true };
}>;
