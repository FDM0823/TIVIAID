import { NextResponse } from "next/server";
import { ZodError } from "zod";

const MAX_JSON_BYTES = 64 * 1024;

export function jsonError(message: string, status: number, details?: unknown) {
  return NextResponse.json(
    details ? { error: message, details } : { error: message },
    {
      status,
      headers: securityHeaders(),
    },
  );
}

export function jsonOk<T>(body: T, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      ...securityHeaders(),
      ...Object.fromEntries(new Headers(init?.headers).entries()),
    },
  });
}

export const secureJson = jsonOk;
export const secureJsonError = jsonError;

export function validationError(messageOrError: string | ZodError, error?: ZodError) {
  const zodError = messageOrError instanceof ZodError ? messageOrError : error;
  const message = typeof messageOrError === "string" ? messageOrError : "Invalid request data.";

  return jsonError(message, 400, zodError?.flatten().fieldErrors);
}

export const validationErrorJson = validationError;

export function methodNotAllowed() {
  return jsonError("Method not allowed.", 405);
}

export async function parseJsonBody(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.toLowerCase().includes("application/json")) {
    throw new RequestBodyError("Expected application/json request body.", 415);
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);

  if (contentLength > MAX_JSON_BYTES) {
    throw new RequestBodyError("Request body is too large.", 413);
  }

  try {
    return request.json();
  } catch {
    throw new RequestBodyError("Malformed JSON request body.", 400);
  }
}

export class RequestBodyError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

export function applySecurityHeaders(response: NextResponse) {
  const headers = securityHeaders();

  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }

  return response;
}

export function securityHeaders() {
  return {
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
  };
}
