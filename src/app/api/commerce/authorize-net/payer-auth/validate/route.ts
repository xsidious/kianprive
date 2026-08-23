import { NextResponse } from "next/server";
import { z } from "zod";
import { validateCardinalResponseJwt } from "@/lib/cardinal-payer-auth";

const bodySchema = z.object({
  jwt: z.string().min(10),
});

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid authentication response." }, { status: 400 });
  }

  try {
    const result = validateCardinalResponseJwt(parsed.data.jwt);
    return NextResponse.json({
      actionCode: result.actionCode,
      cavv: result.cavv ?? null,
      eciFlag: result.eciFlag ?? null,
      xid: result.xid ?? null,
      enrolled: result.enrolled ?? null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not verify bank authentication." },
      { status: 400 },
    );
  }
}
