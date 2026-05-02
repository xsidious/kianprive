import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      services: {
        database: "up",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        timestamp: new Date().toISOString(),
        services: {
          database: "down",
        },
        error: error instanceof Error ? error.message : "unknown",
      },
      { status: 503 },
    );
  }
}
