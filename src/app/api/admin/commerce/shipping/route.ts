import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminAccess } from "@/lib/admin-guard";
import { getShippingConfig, saveShippingConfig } from "@/lib/commerce/shipping";
import { writeAuditLog } from "@/lib/ops/audit";

export async function GET() {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;
  const config = await getShippingConfig();
  return NextResponse.json({ config });
}

const putSchema = z.object({
  freeThreshold: z.number().min(0).max(100000).optional(),
  flatRate: z.number().min(0).max(100000).optional(),
  alwaysFree: z.boolean().optional(),
});

export async function PUT(req: Request) {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;

  const parsed = putSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid shipping settings." }, { status: 400 });
  }

  const config = await saveShippingConfig(parsed.data);
  await writeAuditLog({
    userId: guard.userId,
    action: "commerce.shipping.update",
    entityType: "SiteSetting",
    entityId: "commerce.shipping",
    metadata: config,
  });

  return NextResponse.json({ config });
}
