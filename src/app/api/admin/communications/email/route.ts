import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-guard";
import { writeAuditLog } from "@/lib/ops/audit";
import { sendTransactionalEmail } from "@/lib/email";

export async function POST(req: Request) {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;

  const body = await req.json();
  if (!body?.to || !body?.subject || !body?.message) {
    return NextResponse.json({ error: "to, subject, and message are required" }, { status: 400 });
  }

  await sendTransactionalEmail({
    to: body.to,
    subject: body.subject,
    text: body.message,
  });

  await writeAuditLog({
    userId: guard.userId,
    action: "communications.email.send",
    entityType: "Communication",
    metadata: { to: body.to, subject: body.subject },
  });

  return NextResponse.json({ ok: true });
}
