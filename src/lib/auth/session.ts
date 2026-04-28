import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import { verifyAuthToken, type AuthTokenPayload } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma";

export async function getAuthTokenFromCookies(): Promise<string | undefined> {
  const cookieStore = await cookies();

  return cookieStore.get(AUTH_COOKIE_NAME)?.value;
}

export async function getCurrentSession(): Promise<AuthTokenPayload | null> {
  const token = await getAuthTokenFromCookies();

  if (!token) {
    return null;
  }

  return verifyAuthToken(token);
}

export async function getCurrentUser() {
  const session = await getCurrentSession();

  if (!session) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: session.sub },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      profile: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
}
