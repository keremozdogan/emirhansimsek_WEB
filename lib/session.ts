import { SignJWT, jwtVerify } from "jose";

/**
 * Oturum jetonu üretimi/doğrulaması.
 *
 * Bu dosya bilerek veritabanından bağımsız tutulmuştur; `middleware.ts` Edge
 * çalışma ortamında çalıştığı için Prisma'yı içeri alamaz.
 */

export const SESSION_COOKIE = "es_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 gün

export type SessionPayload = {
  sub: string;
  email: string;
  name: string;
};

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "AUTH_SECRET tanımlı değil veya çok kısa. .env dosyasını kontrol edin.",
    );
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT({ email: payload.email, name: payload.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secretKey());
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (!payload.sub) return null;
    return {
      sub: payload.sub,
      email: String(payload.email ?? ""),
      name: String(payload.name ?? ""),
    };
  } catch {
    return null;
  }
}
