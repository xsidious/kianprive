import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendTransactionalEmail } from "@/lib/email";

const bodySchema = z.object({
  email: z.string().email(),
  action: z.enum(["opt_out", "subscribe"]),
  source: z.string().max(80).optional(),
  marketingConsent: z.boolean().optional(),
});

type OptOutRecord = {
  email: string;
  action: string;
  source?: string;
  at: string;
};

const SETTING_KEY = "email.preferences";

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const action = parsed.data.action;

  if (action === "subscribe" && parsed.data.marketingConsent !== true) {
    return NextResponse.json(
      { error: "Marketing consent is required before we can add you to the list." },
      { status: 400 },
    );
  }

  const existing = await prisma.siteSetting.findUnique({ where: { key: SETTING_KEY } }).catch(() => null);
  const current = (existing?.value as { records?: OptOutRecord[] } | null) ?? {};
  const records = Array.isArray(current.records) ? [...current.records] : [];
  records.push({
    email,
    action,
    source: parsed.data.source,
    at: new Date().toISOString(),
  });
  // Keep last 5k preference events
  const trimmed = records.slice(-5000);

  await prisma.siteSetting.upsert({
    where: { key: SETTING_KEY },
    update: { value: { records: trimmed } },
    create: { key: SETTING_KEY, value: { records: trimmed } },
  });

  try {
    await sendTransactionalEmail({
      to: process.env.CONTACT_INBOX_EMAIL || "contact@kianprive.com",
      subject: `Email preference — ${action.replace("_", " ")} — ${email}`,
      text: [
        `Action: ${action}`,
        `Email: ${email}`,
        `Source: ${parsed.data.source || "web"}`,
        `Time: ${new Date().toISOString()}`,
      ].join("\n"),
    });
  } catch (error) {
    console.error("[email-preferences] notify failed", error);
  }

  if (action === "opt_out") {
    return NextResponse.json({
      message: "You are opted out of marketing emails. It can take a few days for all lists to update.",
    });
  }

  return NextResponse.json({
    message: "Thank you — you are subscribed to marketing updates. You can opt out anytime.",
  });
}
