import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { sql } from "@/lib/db";

const encodedKey = new TextEncoder().encode(process.env.SESSION_SECRET);
const SESSION_DAYS = 30;

async function encrypt(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(encodedKey);
}

async function decrypt(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch {
    return null;
  }
}

export async function createSession(userId) {
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const token = await encrypt({ userId });
  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires,
    path: "/",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

// Returns the logged-in user, or null if nobody is logged in.
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const payload = await decrypt(cookieStore.get("session")?.value);
  if (!payload?.userId) return null;

  const rows = await sql`
    SELECT id, name, email, is_pro FROM users WHERE id = ${payload.userId}
  `;
  return rows[0] ?? null;
}
