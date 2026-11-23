import { z } from "zod";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/anti-bot";

export const BCRYPT_COST = 12;
export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_HINT =
  "At least 12 characters with upper and lower case, a number, and a symbol.";

const FAIL_WINDOW_MS = 15 * 60 * 1000;
const FAIL_LIMIT = 5;
const LOCK_MS = 30 * 60 * 1000;
const IP_LOGIN_LIMIT = 12;
const IP_LOGIN_WINDOW_MS = 15 * 60 * 1000;

export async function requestClientMeta() {
  const h = await headers();
  const fwd = h.get("x-forwarded-for") || h.get("x-real-ip") || "";
  const ip = fwd.split(",")[0]?.trim() || "unknown";
  const ua = (h.get("user-agent") || "").slice(0, 300);
  return { ip, ua };
}

export async function authTimingPad() {
  const ms = 320 + Math.floor(Math.random() * 280);
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export function assertStrongPassword(password: string) {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return { ok: false as const, error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters.` };
  }
  if (password.length > 128) {
    return { ok: false as const, error: "Password is too long." };
  }
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
    return { ok: false as const, error: "Password needs upper and lower case letters." };
  }
  if (!/[0-9]/.test(password)) {
    return { ok: false as const, error: "Password needs at least one number." };
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return { ok: false as const, error: "Password needs at least one symbol." };
  }
  const lowered = password.toLowerCase();
  if (
    ["password", "kianprive", "kian", "wellnesstech", "1234567890", "qwertyuiop"].some((w) =>
      lowered.includes(w),
    )
  ) {
    return { ok: false as const, error: "Choose a less common password." };
  }
  return { ok: true as const };
}

export const strongPasswordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH)
  .max(128)
  .superRefine((value, ctx) => {
    const check = assertStrongPassword(value);
    if (!check.ok) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: check.error });
    }
  });

export async function assertNotRateLimited(ip: string, email: string) {
  const byIp = rateLimit(`kian-auth-ip:${ip}`, IP_LOGIN_LIMIT, IP_LOGIN_WINDOW_MS);
  if (!byIp.ok) {
    return { ok: false as const, error: "Too many sign-in attempts from this network. Try again later." };
  }
  const byEmail = rateLimit(`kian-auth-email:${email}`, FAIL_LIMIT + 2, FAIL_WINDOW_MS);
  if (!byEmail.ok) {
    return { ok: false as const, error: "Too many attempts for this account. Try again later." };
  }
  return { ok: true as const };
}

export async function assertNotLockedOut(email: string) {
  const since = new Date(Date.now() - LOCK_MS);
  const recentFails = await prisma.auditLog.findMany({
    where: {
      action: "auth.login_failed",
      entityType: "User",
      entityId: email,
      createdAt: { gt: since },
    },
    orderBy: { createdAt: "desc" },
    take: FAIL_LIMIT,
    select: { createdAt: true },
  });
  if (recentFails.length < FAIL_LIMIT) return { ok: true as const };

  const oldestInBurst = recentFails[recentFails.length - 1]?.createdAt;
  if (!oldestInBurst) return { ok: true as const };
  const unlockAt = oldestInBurst.getTime() + LOCK_MS;
  if (Date.now() < unlockAt) {
    const mins = Math.max(1, Math.ceil((unlockAt - Date.now()) / 60000));
    return {
      ok: false as const,
      error: `Account temporarily locked after failed sign-ins. Try again in about ${mins} minute${mins === 1 ? "" : "s"}.`,
    };
  }
  return { ok: true as const };
}

export async function recordLoginFailure(email: string, ip: string, reason: string) {
  await prisma.auditLog.create({
    data: {
      action: "auth.login_failed",
      entityType: "User",
      entityId: email,
      ipAddress: ip,
      metadata: { reason: reason.slice(0, 120) },
    },
  });
  await authTimingPad();
}

export async function recordLoginSuccess(userId: string, email: string, ip: string, ua = "") {
  await prisma.auditLog.create({
    data: {
      userId,
      action: "auth.login_success",
      entityType: "User",
      entityId: email,
      ipAddress: ip,
      userAgent: ua.slice(0, 300) || undefined,
      metadata: {},
    },
  });
}

export function genericAuthError() {
  return "Invalid email or password.";
}
