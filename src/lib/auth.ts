import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "doctor_tracker_jwt_secure_secret_production_ready_2026"
);

export const AUTH_COOKIE_NAME = "dt_session_token";

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: "admin";
}

/**
 * Creates a signed JWT for the authenticated user session.
 */
export async function createSessionToken(
  payload: SessionPayload
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
}

/**
 * Verifies a JWT session token and returns the payload.
 */
export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Extracts and verifies the session from incoming Next.js Request or server cookies.
 */
export async function getSession(
  req?: Request | NextRequest
): Promise<SessionPayload | null> {
  let token: string | undefined;

  if (req) {
    if ("cookies" in req && typeof (req as any).cookies?.get === "function") {
      token = (req as NextRequest).cookies.get(AUTH_COOKIE_NAME)?.value;
    }

    if (!token) {
      const cookieHeader = req.headers.get("cookie");
      if (cookieHeader) {
        const cookiesMap = Object.fromEntries(
          cookieHeader.split("; ").map((c) => {
            const [k, ...v] = c.split("=");
            return [k, v.join("=")];
          })
        );
        token = cookiesMap[AUTH_COOKIE_NAME];
      }
    }

    if (!token) {
      const authHeader = req.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }
  } else {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    } catch {
      token = undefined;
    }
  }

  if (!token) return null;
  return verifySessionToken(token);
}

