import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Public list of active providers for book-online preferred-provider UI. */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const service = searchParams.get("service") ?? undefined;

  try {
    const providers = await prisma.partnerProfile.findMany({
      where: {
        type: "PROVIDER",
        status: "ACTIVE",
        ...(service
          ? {
              serviceAssignments: {
                some: { active: true, serviceSlug: service },
              },
            }
          : {}),
      },
      select: {
        id: true,
        displayName: true,
        specialty: true,
        partnerCode: true,
        serviceAssignments: {
          where: { active: true },
          select: { serviceSlug: true },
        },
      },
      orderBy: { displayName: "asc" },
    });

    return NextResponse.json({
      providers: providers.map((p) => ({
        id: p.id,
        label: p.displayName,
        specialty: p.specialty,
        code: p.partnerCode,
        services: p.serviceAssignments.map((a) => a.serviceSlug),
      })),
    });
  } catch {
    return NextResponse.json({ providers: [] });
  }
}
