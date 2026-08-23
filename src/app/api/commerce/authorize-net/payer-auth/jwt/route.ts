import { NextResponse } from "next/server";
import { z } from "zod";
import { generateCardinalSetupJwt } from "@/lib/cardinal-payer-auth";

const bodySchema = z.object({
  orderNumber: z.string().min(1).max(40),
});

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const jwt = generateCardinalSetupJwt(parsed.data.orderNumber);
    return NextResponse.json({ jwt });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "3D Secure is unavailable." },
      { status: 503 },
    );
  }
}
