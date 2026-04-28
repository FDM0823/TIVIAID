import { SignJWT, jwtVerify } from "jose";

import { AUTH_COOKIE_NAME, AUTH_TOKEN_TTL_SECONDS, type AuthRole } from "./constants";

export type AuthTokenPayload = {
  sub: string;
  email: string;
  role: AuthRole;
  name: string;
};

const encoder = new TextEncoder();

function getJwtSecret() {
  return encoder.encode(
    process.env.JWT_SECRET ?? "development-only-change-me-before-production",
  );
}

export async function signAuthToken(payload: AuthTokenPayload) {
  return new SignJWT({
    email: payload.email,
    role: payload.role,
    name: payload.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${AUTH_TOKEN_TTL_SECONDS}s`)
    .sign(getJwtSecret());
}

export async function verifyAuthToken(token: string): Promise<AuthTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());

    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.role !== "string" ||
      typeof payload.name !== "string"
    ) {
      return null;
    }

    if (payload.role !== "PATIENT" && payload.role !== "DOCTOR") {
      return null;
    }

    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      name: payload.name,
    };
  } catch {
    return null;
  }
}

export function getAuthCookieOptions() {
  return {
    name: AUTH_COOKIE_NAME,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: AUTH_TOKEN_TTL_SECONDS,
  };
}

export async function createAuthCookie(payload: AuthTokenPayload) {
  const token = await signAuthToken(payload);
  const options = getAuthCookieOptions();

  return {
    ...options,
    value: token,
  };
}
