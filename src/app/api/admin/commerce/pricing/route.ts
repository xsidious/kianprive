import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminAccess } from "@/lib/admin-guard";
import { getPricingConfig, savePricingConfig } from "@/lib/commerce/vendor-pricing";
import { writeAuditLog } from "@/lib/ops/audit";

export async function GET() {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;
  const config = await getPricingConfig();
  return NextResponse.json({ config });
}

const putSchema = z.object({
  marginPercent: z.number().min(0).max(1000).optional(),
  extraDollars: z.number().min(0).max(100000).optional(),
  includeStoreShipping: z.boolean().optional(),
});

export async function PUT(req: Request) {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;
  const parsed = putSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid pricing settings." }, { status: 400 });
  }
  const config = await savePricingConfig(parsed.data);
  await writeAuditLog({
    userId: guard.userId,
    action: "commerce.pricing.update",
    entityType: "SiteSetting",
    entityId: "commerce.pricing",
    metadata: config,
  });
  return NextResponse.json({ config });
}
