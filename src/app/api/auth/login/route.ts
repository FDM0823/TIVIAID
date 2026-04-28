import { ZodError } from "zod";

import {
  jsonError,
  jsonOk,
  parseJsonBody,
  RequestBodyError,
  validationError,
} from "@/lib/api/security";
import { getAuthCookieOptions, signAuthToken } from "@/lib/auth/jwt";
import { verifyPassword } from "@/lib/auth/password";
import { loginSchema } from "@/lib/auth/validation";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const payload = loginSchema.parse(await parseJsonBody(request));
    const email = payload.email.toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user?.passwordHash || !(await verifyPassword(payload.password, user.passwordHash))) {
      return jsonError("Invalid email or password.", 401);
    }

    if (user.status !== "ACTIVE") {
      return jsonError("This account is not active.", 403);
    }

    if (user.role !== "PATIENT" && user.role !== "DOCTOR") {
      return jsonError("Only patient and doctor accounts can sign in here.", 403);
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

    const response = jsonOk({
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
      return validationError("Invalid login payload.", error);
    }

    if (error instanceof RequestBodyError) {
      return jsonError(error.message, error.status);
    }

    return jsonError("Unable to log in.", 500);
  }
}
