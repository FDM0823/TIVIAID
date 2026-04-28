import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getAuthCookieOptions, signAuthToken } from "@/lib/auth/jwt";
import { verifyPassword } from "@/lib/auth/password";
import { loginSchema } from "@/lib/auth/validation";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const payload = loginSchema.parse(await request.json());
    const email = payload.email.toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user?.passwordHash || !(await verifyPassword(payload.password, user.passwordHash))) {
      return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json({ message: "This account is not active." }, { status: 403 });
    }

    if (user.role !== "PATIENT" && user.role !== "DOCTOR") {
      return NextResponse.json(
        { message: "Only patient and doctor accounts can sign in here." },
        { status: 403 },
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const token = await signAuthToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : user.email,
    });

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.profile?.firstName,
        lastName: user.profile?.lastName,
      },
    });

    response.cookies.set({
      ...getAuthCookieOptions(),
      value: token,
    });
    return response;
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Invalid login payload.", issues: error.flatten() },
        { status: 400 },
      );
    }

    return NextResponse.json({ message: "Unable to log in." }, { status: 500 });
  }
}
