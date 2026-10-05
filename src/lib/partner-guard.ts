import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { profileWhere, type NetworkKind } from "@/lib/network-profile";

export async function requirePartnerProfile(kind: NetworkKind) {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      userId: null,
      partner: null,
      session: null,
    };
  }

  if (session.user.role === Role.ADMIN) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      userId: null,
      partner: null,
      session,
    };
  }

  const partner = await prisma.partnerProfile.findFirst({
    where: profileWhere(session.user.id, kind),
  });

  if (!partner || partner.status === "SUSPENDED") {
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
