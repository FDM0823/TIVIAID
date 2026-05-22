import { Prisma, UserRole } from "@prisma/client";

import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";

type DemoAccountKind = "patient" | "doctor" | "lab";

type DemoAccountDefinition = {
  firstName: string;
  kind: DemoAccountKind;
  lastName: string;
  prefix: string;
  role: UserRole.PATIENT | UserRole.DOCTOR | UserRole.CLINIC_ADMIN;
};

export type ConfiguredDemoAccount = DemoAccountDefinition & {
  email: string;
  password: string;
};

const demoAccountDefinitions: DemoAccountDefinition[] = [
  {
    firstName: "Paciente",
    kind: "patient",
    lastName: "Demo",
    prefix: "DEMO_PATIENT",
    role: UserRole.PATIENT,
  },
  {
    firstName: "Doctor",
    kind: "doctor",
    lastName: "Demo",
    prefix: "DEMO_DOCTOR",
    role: UserRole.DOCTOR,
  },
  {
    firstName: "Laboratorio",
    kind: "lab",
    lastName: "Demo",
    prefix: "DEMO_LAB",
    role: UserRole.CLINIC_ADMIN,
  },
];

export function getConfiguredDemoAccounts() {
  if (process.env.DEMO_ACCOUNTS_ENABLED !== "true") {
    return [];
  }

  return demoAccountDefinitions.flatMap((definition) => {
    const email = process.env[`${definition.prefix}_EMAIL`]?.trim().toLowerCase();
    const password = process.env[`${definition.prefix}_PASSWORD`]?.trim();

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

export async function upsertDemoAccount(account: ConfiguredDemoAccount) {
  const passwordHash = await hashPassword(account.password);

  const user = await prisma.user.upsert({
    where: { email: account.email },
    update: {
      passwordHash,
      role: account.role,
      status: "ACTIVE",
      profile: {
        upsert: {
          create: {
            firstName: account.firstName,
            lastName: account.lastName,
          },
          update: {
            firstName: account.firstName,
            lastName: account.lastName,
          },
        },
      },
    },
    create: {
      email: account.email,
      passwordHash,
      role: account.role,
      status: "ACTIVE",
      profile: {
        create: {
          firstName: account.firstName,
          lastName: account.lastName,
        },
      },
    },
    include: { profile: true },
  });

  if (account.role === UserRole.PATIENT) {
    await prisma.patient.upsert({
      where: { userId: user.id },
      update: {
        bloodType: "O_POSITIVE",
        emergencySummary:
          "Cuenta demo para inversionistas: historial clinico, QR de emergencia y resultados conectados.",
        primaryLanguage: "Spanish",
      },
      create: {
        bloodType: "O_POSITIVE",
        emergencySummary:
          "Cuenta demo para inversionistas: historial clinico, QR de emergencia y resultados conectados.",
        primaryLanguage: "Spanish",
        userId: user.id,
      },
    });
  }

  if (account.role === UserRole.DOCTOR) {
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

  if (account.role === UserRole.CLINIC_ADMIN) {
    await upsertDemoClinicMembership(user.id);
  }

  return user;
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
