import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const base = (process.env.WT_API_URL || "https://www.wellnesstechdistribution.com").replace(/\/$/, "");
const secret = process.env.WT_PARTNER_ORDER_SECRET || process.env.KIAN_PARTNER_SECRET || "";

const open = ["PENDING_REVIEW", "UNDER_PHYSICIAN_REVIEW", "NEEDS_LABS", "NEEDS_FOLLOW_UP"];

const rows = await prisma.therapeuticsIntakeSubmission.findMany({
  where: { status: { in: open } },
  orderBy: { updatedAt: "desc" },
  take: 40,
  select: { id: true, fullName: true, status: true },
});

console.log("open intakes", rows.length);
for (const row of rows) {
  const { syncIntakeToWellnessTechHub } = await import("../src/lib/wellness-tech/hub-sync.ts");
  const result = await syncIntakeToWellnessTechHub(row.id);
  console.log(row.id, row.status, result);
}

await prisma.$disconnect();
