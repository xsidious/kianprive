import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-guard";
import { syncPrescribeUsaCatalog, syncEventideCatalog } from "@/lib/eventide/sync-catalog";
import { eventideConfigured } from "@/lib/eventide/client";

export async function GET() {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;
  return NextResponse.json({
    configured: eventideConfigured(),
    hasKey: Boolean(
      process.env.EVENTIDE_API_KEY ||
        process.env.VITARELAY_API_KEY ||
        process.env.EVENTIDE_API_KEY ||
        process.env.EVENTIDE_LIVE_API_KEY,
    ),
  });
}

export async function POST(req: Request) {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;

  const body = (await req.json().catch(() => ({}))) as { vendor?: string };
  const vendor = String(body.vendor || "eventide").toLowerCase();

  if (vendor === "prescribeusa" || vendor === "pusa") {
    const result = await syncPrescribeUsaCatalog({ activateNew: true });
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: "PrescribeUSA sync failed." }, { status: 400 });
    }
    const { ok: _ok, ...rest } = result;
    return NextResponse.json({ ok: true, vendor: "prescribeusa", ...rest });
  }

  const result = await syncEventideCatalog({ activateNew: true });
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }
  const { ok: _ok, ...rest } = result;
  return NextResponse.json({ ok: true, vendor: "eventide", ...rest });
}
