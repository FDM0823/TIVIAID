export const AUTH_COOKIE_NAME = "tivaid_session";

export const AUTH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

export const AUTH_ROLES = ["PATIENT", "DOCTOR", "CLINIC_ADMIN"] as const;

export type AuthRole = (typeof AUTH_ROLES)[number];

export const SELF_SERVICE_REGISTRATION_ROLES = ["PATIENT", "DOCTOR"] as const;

export type SelfServiceRegistrationRole = (typeof SELF_SERVICE_REGISTRATION_ROLES)[number];

export function isAuthRole(role: string): role is AuthRole {
  return AUTH_ROLES.includes(role as AuthRole);
}

export const publicAuthRoutes = ["/login", "/register"] as const;

export const protectedRoutePrefixes = ["/dashboard"] as const;
