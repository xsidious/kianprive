import { readFileSync, existsSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

function readDatabaseUrl(file) {
  if (!existsSync(file)) return "";
  const text = readFileSync(file, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^DATABASE_URL=(.*)$/);
    if (!match) continue;
    let value = match[1].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    return value;
  }
  return "";
}

const statements = [
  `ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "emergencyRelationship" TEXT`,
  `ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "addressLine1" TEXT`,
  `ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "city" TEXT`,
  `ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "state" TEXT`,
  `ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "postalCode" TEXT`,
  `ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "sexAtBirth" TEXT`,
  `ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "primaryCarePhysician" TEXT`,
  `ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "supplements" TEXT`,
  `ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "pregnancyStatus" TEXT`,
  `ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "preferredContact" TEXT`,
];

const primary = readDatabaseUrl(".env");
const local = readDatabaseUrl(".env.local");
const targets = [];
if (primary) targets.push({ label: "primary", url: primary });
if (local && local !== primary) targets.push({ label: "local", url: local });

if (targets.length === 0) {
  console.error("No database URL found.");
  process.exit(1);
}

for (const target of targets) {
  const prisma = new PrismaClient({ datasources: { db: { url: target.url } } });
  try {
    for (const statement of statements) {
      await prisma.$executeRawUnsafe(statement);
    }
    const columns = await prisma.$queryRawUnsafe(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'Profile' AND column_name IN ('emergencyRelationship','addressLine1','city','state','postalCode','sexAtBirth','primaryCarePhysician','supplements','pregnancyStatus','preferredContact')`,
    );
    console.log(`${target.label}: ${columns.length} columns ready`);
  } finally {
    await prisma.$disconnect();
  }
}
