import "server-only";

import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/db";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
  verifySessionToken,
  type SessionPayload,
} from "@/lib/session";

export type { SessionPayload };
export { SESSION_COOKIE };

export async function getSession(): Promise<SessionPayload | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/** Server action / route handler içinde oturum zorunluluğu */
export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new Error("Bu işlem için giriş yapmalısınız.");
  return session;
}

/** Geçersiz kullanıcıda da bcrypt karşılaştırması yaparak zamanlama sızıntısını engeller */
const DUMMY_HASH = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

export async function login(email: string, password: string) {
  const user = await prisma.adminUser.findUnique({
    where: { email: email.trim().toLowerCase() },
  });
  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) return null;

  const token = await createSessionToken({
    sub: user.id,
    email: user.email,
    name: user.name,
  });

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return { id: user.id, email: user.email, name: user.name };
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
}

export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}
