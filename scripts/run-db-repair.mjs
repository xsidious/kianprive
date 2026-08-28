import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const sqlPath = path.join(root, "repair-db-schema.sql");
const sql = readFileSync(sqlPath, "utf8");

console.log("Running database schema repair…");
execSync(`npx prisma db execute --stdin --schema prisma/schema.prisma`, {
  cwd: path.join(root, ".."),
  input: sql,
  stdio: "inherit",
  env: process.env,
});
console.log("Database schema repair complete.");
