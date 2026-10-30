import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-guard";
import { syncOpenDistributionStatuses } from "@/lib/rxhere/sync-distribution-status";

export async function POST() {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;
  const summary = await syncOpenDistributionStatuses(30);
  return NextResponse.json({ ok: true, ...summary });
}
