import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { createAuthCookie } from "@/lib/auth/jwt";
import { hashPassword } from "@/lib/auth/password";
import { registerSchema } from "@/lib/auth/validation";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const payload = registerSchema.parse(await request.json());
    const email = payload.email.toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(payload.password);

    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: payload.role,
          profile: {
            create: {
              firstName: payload.firstName,
              lastName: payload.lastName,
            },
          },
        },
        include: {
          profile: true,
        },
      });

      if (payload.role === UserRole.PATIENT) {
        await tx.patient.create({
          data: {
            userId: createdUser.id,
          },
        });
      }

      if (payload.role === UserRole.DOCTOR) {
        if (!payload.licenseNumber || !payload.licenseCountry || !payload.specialty) {
          throw new Error("Doctor registration fields were not validated.");
        }

        await tx.doctor.create({
          data: {
            userId: createdUser.id,
            licenseNumber: payload.licenseNumber,
            licenseCountry: payload.licenseCountry,
            specialty: payload.specialty,
          },
        });
      }

      return createdUser;
    });

    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          profile: user.profile,
        },
      },
      { status: 201 },
    );

    const role = user.role === UserRole.DOCTOR ? UserRole.DOCTOR : UserRole.PATIENT;

    response.cookies.set(
      await createAuthCookie({
        email: user.email,
        name: `${user.profile?.firstName ?? ""} ${user.profile?.lastName ?? ""}`.trim(),
        role,
        sub: user.id,
      }),
    );

    return response;
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid registration data.", issues: error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    console.error("Registration failed", error);
    return NextResponse.json({ error: "Registration failed." }, { status: 500 });
  }
}
