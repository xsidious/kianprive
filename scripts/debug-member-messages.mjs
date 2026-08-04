import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

const member = await p.user.findUnique({ where: { email: "member@kianprive.com" } });
console.log("member", member?.id, member?.email);

const intakes = await p.therapeuticsIntakeSubmission.findMany({
  where: {
    OR: [
      { email: { equals: "member@kianprive.com", mode: "insensitive" } },
      ...(member ? [{ userId: member.id }] : []),
    ],
  },
  select: {
    id: true,
    publicTrackingToken: true,
    email: true,
    userId: true,
    messages: {
      orderBy: { createdAt: "asc" },
      select: { id: true, authorRole: true, authorName: true, body: true, createdAt: true },
    },
  },
});

for (const i of intakes) {
  console.log("\n===", i.publicTrackingToken, i.id);
  console.log("email", i.email, "userId", i.userId);
  for (const m of i.messages) {
    console.log(`  [${m.authorRole}] ${m.authorName || "-"}: ${m.body.slice(0, 80)}`);
  }
}

// Simulate member ownedSubmission lookup for KP-DEMO-PAY1
const ref = "KP-DEMO-PAY1";
const found = await p.therapeuticsIntakeSubmission.findFirst({
  where: {
    AND: [
      {
        OR: [
          ...(member ? [{ userId: member.id }] : []),
          { email: { equals: "member@kianprive.com", mode: "insensitive" } },
        ],
      },
      {
        OR: [{ publicTrackingToken: ref }, { id: ref }],
      },
    ],
  },
  select: { id: true, publicTrackingToken: true },
});
console.log("\nlookup KP-DEMO-PAY1 =>", found);

if (found) {
  const msgs = await p.intakeMessage.findMany({
    where: { intakeSubmissionId: found.id },
    orderBy: { createdAt: "asc" },
  });
  console.log("messages for that intake:", msgs.length);
}

await p.$disconnect();
