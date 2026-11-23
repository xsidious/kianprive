import { prisma } from "../src/lib/prisma";
import { syncIntakeToWellnessTechHub } from "../src/lib/wellness-tech/hub-sync";

async function main() {
  const open = ["PENDING_REVIEW", "UNDER_PHYSICIAN_REVIEW", "NEEDS_LABS", "NEEDS_FOLLOW_UP"] as const;
  const rows = await prisma.therapeuticsIntakeSubmission.findMany({
    where: { status: { in: [...open] } },
    orderBy: { updatedAt: "desc" },
    take: 25,
    select: { id: true, status: true, fullName: true },
  });
  console.log("count", rows.length);
  for (const row of rows) {
    const out = await syncIntakeToWellnessTechHub(row.id);
    console.log(row.status, row.fullName, out);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
