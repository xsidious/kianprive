import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();
const intakes = await p.therapeuticsIntakeSubmission.findMany({
  select: {
    id: true,
    publicTrackingToken: true,
    email: true,
    assignedPartnerId: true,
    statusNote: true,
    _count: { select: { messages: true } },
  },
});
for (const i of intakes) {
  console.log(
    i.publicTrackingToken,
    i.email,
    "msgs",
    i._count.messages,
    "partner",
    i.assignedPartnerId?.slice(0, 8),
  );
}
const sample = await p.intakeMessage.findMany({
  take: 8,
  orderBy: { createdAt: "desc" },
  select: { body: true, authorRole: true, intakeSubmission: { select: { publicTrackingToken: true } } },
});
console.log(JSON.stringify(sample, null, 2));
await p.$disconnect();
