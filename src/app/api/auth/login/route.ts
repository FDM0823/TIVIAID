import { ZodError } from "zod";

import {
  jsonError,
  jsonOk,
  parseJsonBody,
  RequestBodyError,
  validationError,
} from "@/lib/api/security";
import { findConfiguredDemoAccount, upsertDemoAccount } from "@/lib/auth/demo-accounts";
import { getAuthCookieOptions, signAuthToken } from "@/lib/auth/jwt";
import { verifyPassword } from "@/lib/auth/password";
import { loginSchema } from "@/lib/auth/validation";
import { isAuthRole, type AuthRole } from "@/lib/auth/constants";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const payload = loginSchema.parse(await parseJsonBody(request));
    const email = payload.email.toLowerCase();
    const demoAccount = findConfiguredDemoAccount(email);

    if (demoAccount) {
      if (payload.password !== demoAccount.password) {
        return jsonError("Invalid email or password.", 401);
      }

      const demoUser = await upsertDemoAccount(demoAccount);
      return createLoginResponse({
        email: demoUser.email,
        id: demoUser.id,
        profile: demoUser.profile,
        role: demoAccount.role,
      });
    }

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

    if (!isAuthRole(user.role)) {
      return jsonError("Only patient, doctor, and lab demo accounts can sign in here.", 403);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return createLoginResponse({
      email: user.email,
      id: user.id,
      profile: user.profile,
      role: user.role,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError("Invalid login payload.", error);
    }

    if (error instanceof RequestBodyError) {
      return jsonError(error.message, error.status);
    }

    console.error("Login failed", error);
    return jsonError(
      "Login is temporarily unavailable. Please try again later.",
      503,
    );
  }
}

async function createLoginResponse(user: {
  email: string;
  id: string;
  profile: { firstName: string; lastName: string } | null;
  role: AuthRole;
}) {
  const token = await signAuthToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : user.email,
  });

  const response = jsonOk({
    user: {
      email: user.email,
      firstName: user.profile?.firstName,
      id: user.id,
      lastName: user.profile?.lastName,
      role: user.role,
    },
  });

  response.cookies.set({
    ...getAuthCookieOptions(),
    value: token,
  });

  return response;
}
