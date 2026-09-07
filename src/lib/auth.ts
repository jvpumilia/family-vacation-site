import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { prisma } from "./db";

const COOKIE = "fvs_session";
const DAYS = 30;

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + DAYS * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { token, userId, expiresAt } });
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
  return token;
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { token } });
    jar.delete(COOKIE);
  }
}

export async function getCurrentUser() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session || session.expiresAt < new Date()) {
    if (session) await prisma.session.delete({ where: { id: session.id } });
    return null;
  }
  return session.user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") throw new Error("FORBIDDEN");
  return user;
}

/** Passwordless email stub: upsert user by email + household, create session */
export async function loginWithEmail(opts: {
  email: string;
  name?: string;
  household: string;
}) {
  const email = opts.email.trim().toLowerCase();
  const adminEmail = (process.env.ADMIN_EMAIL || "joe@example.com").toLowerCase();
  const role = email === adminEmail ? "admin" : "member";
  const user = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name: opts.name?.trim() || email.split("@")[0],
      household: opts.household,
      role,
    },
    update: {
      name: opts.name?.trim() || undefined,
      household: opts.household,
      role,
    },
  });
  await createSession(user.id);
  return user;
}
