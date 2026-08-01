import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { patientFacingIntakeStatus } from "@/lib/intake/tracking";

const claimSchema = z.object({
  email: z.string().email(),
  referenceId: z.string().min(8).max(64),
  password: z.string().min(8).max(100),
  name: z.string().min(2).max(120).optional(),
});

function withCors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return res;
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

/** Create/link MEMBER account from intake email + reference ID. */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return withCors(NextResponse.json({ error: "Invalid request body." }, { status: 400 }));
  }

  const parsed = claimSchema.safeParse(body);
  if (!parsed.success) {
    return withCors(
      NextResponse.json(
        { error: "Invalid details. Password must be at least 8 characters." },
        { status: 400 },
      ),
    );
  }

  const email = parsed.data.email.trim().toLowerCase();
  const submission = await prisma.therapeuticsIntakeSubmission.findFirst({
    where: {
      id: parsed.data.referenceId.trim(),
      email: { equals: email, mode: "insensitive" },
    },
  });

  if (!submission) {
    return withCors(
      NextResponse.json(
        { error: "No intake found for that email and reference ID." },
        { status: 404 },
      ),
    );
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const displayName = parsed.data.name?.trim() || submission.fullName;
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    if (existing.role !== Role.MEMBER && existing.role !== Role.GUEST) {
      return withCors(
        NextResponse.json(
          {
            error:
              "This email already belongs to a staff or partner account. Sign in with that portal instead.",
          },
          { status: 409 },
        ),
      );
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: existing.id },
        data: {
          name: existing.name || displayName,
          passwordHash,
          role: Role.MEMBER,
        },
      }),
      prisma.therapeuticsIntakeSubmission.update({
        where: { id: submission.id },
        data: { userId: existing.id },
      }),
      prisma.therapeuticsIntakeSubmission.updateMany({
        where: {
          email: { equals: email, mode: "insensitive" },
          userId: null,
        },
        data: { userId: existing.id },
      }),
    ]);

    return withCors(
      NextResponse.json({
        ok: true,
        linkedExisting: true,
        email,
        referenceId: submission.id,
        status: submission.status,
        statusLabel: patientFacingIntakeStatus(submission.status),
        loginUrl: "/login?callbackUrl=/dashboard/intake",
      }),
    );
  }

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        name: displayName,
        email,
        passwordHash,
        role: Role.MEMBER,
        profile: { create: { phone: submission.phone || null } },
      },
    });
    await tx.therapeuticsIntakeSubmission.update({
      where: { id: submission.id },
      data: { userId: created.id },
    });
    await tx.therapeuticsIntakeSubmission.updateMany({
      where: {
        email: { equals: email, mode: "insensitive" },
        userId: null,
        NOT: { id: submission.id },
      },
      data: { userId: created.id },
    });
    return created;
  });

  return withCors(
    NextResponse.json({
      ok: true,
      linkedExisting: false,
      email: user.email,
      referenceId: submission.id,
      status: submission.status,
      statusLabel: patientFacingIntakeStatus(submission.status),
      loginUrl: "/login?callbackUrl=/dashboard/intake",
    }),
  );
}
