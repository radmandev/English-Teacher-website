import "server-only";
import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";
import type { Role } from "./constants";

const scryptAsync = promisify(scrypt) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;
const COOKIE = "fahm_session";
const SESSION_DAYS = 30;

export const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
export const newToken = () => randomBytes(32).toString("base64url");

export async function hashPassword(pw: string) {
  const salt = randomBytes(16);
  return `${salt.toString("hex")}:${(await scryptAsync(pw, salt, 64)).toString("hex")}`;
}

export async function verifyPassword(pw: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const actual = await scryptAsync(pw, Buffer.from(salt, "hex"), 64);
  return timingSafeEqual(actual, Buffer.from(hash, "hex"));
}

export async function startSession(userId: string) {
  const token = newToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 864e5);
  await db.session.create({ data: { id: sha256(token), userId, expiresAt } });
  (await cookies()).set(COOKIE, token, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", expires: expiresAt,
  });
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { id: sha256(token) } });
  jar.delete(COOKIE);
}

export const getUser = cache(async () => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const s = await db.session.findUnique({
    where: { id: sha256(token) },
    include: { user: { select: { id: true, name: true, email: true, role: true } } },
  });
  if (!s || s.expiresAt < new Date()) return null;
  return s.user as { id: string; name: string; email: string; role: Role };
});

export async function requireUser(next = "/ar/dashboard") {
  const user = await getUser();
  if (!user) redirect(`/ar/login?next=${encodeURIComponent(next)}`);
  return user;
}

export async function requireRole(roles: Role[], next = "/ar/admin") {
  const user = await requireUser(next);
  if (!roles.includes(user.role)) redirect("/ar");
  return user;
}

/** Only allow same-site relative redirects after login. */
export const safeNext = (n: unknown) =>
  typeof n === "string" && n.startsWith("/") && !n.startsWith("//") ? n : "/ar/dashboard";
