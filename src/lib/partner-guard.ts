import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessPartnerPortal } from "@/lib/rbac";

export async function requirePartnerAccess(opts?: { allowAdmin?: boolean }) {
  const allowAdmin = opts?.allowAdmin ?? true;
  const session = await auth();
  if (!session?.user?.id || !canAccessPartnerPortal(session.user.role)) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      userId: null,
      partner: null,
      session: null,
    };
  }

  if (session.user.role === Role.ADMIN && !allowAdmin) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      userId: null,
      partner: null,
      session: null,
    };
  }

  const partner =
    session.user.role === Role.PARTNER
      ? await prisma.partnerProfile.findUnique({ where: { userId: session.user.id } })
      : null;

  if (session.user.role === Role.PARTNER && (!partner || partner.status === "SUSPENDED")) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Partner account unavailable." }, { status: 403 }),
      userId: session.user.id,
      partner: null,
      session,
    };
  }

  return {
    ok: true as const,
    userId: session.user.id,
    partner,
    session,
  };
}

export async function requirePartnerProfile() {
  const access = await requirePartnerAccess({ allowAdmin: false });
  if (!access.ok) return access;
  if (!access.partner) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Partner profile not found." }, { status: 404 }),
      userId: access.userId,
      partner: null,
      session: access.session,
    };
  }
  return {
    ok: true as const,
    userId: access.userId,
    partner: access.partner,
    session: access.session,
  };
}
