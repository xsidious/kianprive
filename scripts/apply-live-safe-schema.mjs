/**
 * Inspect + optionally apply additive schema. Never DROP/DELETE/TRUNCATE.
 * Usage:
 *   node scripts/apply-live-safe-schema.mjs --check
 *   node scripts/apply-live-safe-schema.mjs --apply
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mode = process.argv.includes("--apply") ? "apply" : "check";
const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const host = url.match(/@([^/]+)\//)?.[1] ?? "(unknown host)";
const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

const TABLES = [
  "User",
  "Order",
  "Product",
  "TherapeuticsIntakeSubmission",
  "IntakeMessage",
  "IntakeTherapyProposal",
  "IntakeTherapyItem",
  "OrderMessage",
];

async function counts(c) {
  const out = {};
  for (const t of TABLES) {
    const exists = await c.query(
      `SELECT to_regclass($1) IS NOT NULL AS ok`,
      [`public."${t}"`],
    );
    if (!exists.rows[0].ok) {
      out[t] = null;
      continue;
    }
    const r = await c.query(`SELECT COUNT(*)::int AS n FROM "${t}"`);
    out[t] = r.rows[0].n;
  }
  return out;
}

async function main() {
  await client.connect();
  console.log(`Connected host: ${host}`);
  console.log(`Mode: ${mode}`);

  const before = await counts(client);
  console.log("Row counts BEFORE:", before);

  if (mode === "apply") {
    const sqlPath = path.join(__dirname, "live-safe-schema-additions.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");
    const sqlNoComments = sql
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/--[^\n]*/g, "");
    if (/\bDROP\s+TABLE\b|\bTRUNCATE\b|\bDELETE\s+FROM\b/i.test(sqlNoComments)) {
      console.error("ABORT: SQL file contains destructive statements.");
      process.exit(1);
    }
    console.log("Applying additive SQL (BEGIN/COMMIT)...");
    await client.query("BEGIN");
    try {
      await client.query(sql);
      await client.query("COMMIT");
      console.log("COMMIT ok");
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("ROLLBACK — no changes kept. Error:", err.message);
      process.exit(1);
    }
  }

  const after = await counts(client);
  console.log("Row counts AFTER:", after);

  for (const t of ["User", "Order", "Product", "TherapeuticsIntakeSubmission", "IntakeMessage"]) {
    if (before[t] != null && after[t] != null && before[t] !== after[t]) {
      console.error(`WARNING: count changed for ${t}: ${before[t]} -> ${after[t]}`);
      process.exit(1);
    }
  }
  console.log("Existing data counts unchanged.");
  await client.end();
}

main().catch(async (e) => {
  console.error(e);
  try {
    await client.end();
  } catch {}
  process.exit(1);
});
