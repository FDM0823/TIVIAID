export const AUTH_COOKIE_NAME = "tivaid_session";

export const AUTH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

export const AUTH_ROLES = ["PATIENT", "DOCTOR"] as const;

export type AuthRole = (typeof AUTH_ROLES)[number];

export const publicAuthRoutes = ["/login", "/register"] as const;

export const protectedRoutePrefixes = ["/dashboard"] as const;
