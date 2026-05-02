import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAccess } from "@/lib/admin-guard";
import { writeAuditLog } from "@/lib/ops/audit";

export async function GET() {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;

  const settings = await prisma.siteSetting.findMany({
    orderBy: { key: "asc" },
  });
  return NextResponse.json({ settings });
}

export async function PUT(req: Request) {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;
  const body = await req.json();

  if (!Array.isArray(body.settings)) {
    return NextResponse.json({ error: "settings array required" }, { status: 400 });
  }

  const updates = await Promise.all(
    body.settings.map((setting: { key: string; value: unknown }) =>
      prisma.siteSetting.upsert({
        where: { key: setting.key },
        create: { key: setting.key, value: (setting.value as object) ?? {} },
        update: { value: (setting.value as object) ?? {} },
      }),
    ),
  );

  await writeAuditLog({
    userId: guard.userId,
    action: "settings.bulk.update",
    entityType: "SiteSetting",
    metadata: { keys: updates.map((u) => u.key) },
  });

  return NextResponse.json({ settings: updates });
}
