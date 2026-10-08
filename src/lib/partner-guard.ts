import { NextResponse } from "next/server";
import { PartnerType, Role } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { typesForKind, type NetworkKind } from "@/lib/network-profile";

function typesForKinds(kinds: NetworkKind[]): PartnerType[] {
  return [...new Set(kinds.flatMap((kind) => typesForKind(kind)))];
}

/** Resolve the signed-in user's network profile for one or more portal kinds. */
export async function requirePartnerProfile(kind: NetworkKind | NetworkKind[]) {
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

  const kinds = Array.isArray(kind) ? kind : [kind];
  const types = typesForKinds(kinds);
  const partner = await prisma.partnerProfile.findFirst({
    where: {
      userId: session.user.id,
      type: types.length === 1 ? types[0] : { in: types },
    },
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
