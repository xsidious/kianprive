/**
 * Import KIAN client CSV into User + Profile.
 * Does not overwrite staff accounts or existing passwords.
 *
 * Usage:
 *   node scripts/import-client-list.mjs "C:\\Users\\...\\client list KIAN.csv"
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient, Role } from "@prisma/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  for (const file of [".env", ".env.local"]) {
    const full = path.join(__dirname, "..", file);
    if (!fs.existsSync(full)) continue;
    for (const line of fs.readFileSync(full, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

loadEnv();

const STAFF_ROLES = new Set(["ADMIN", "OPERATIONS", "EDITOR", "PARTNER", "AMBASSADOR", "PROVIDER"]);

const SKIP_EMAIL_FRAGMENTS = [
  "example.com",
  "mailinator.com",
  "classpass.com",
  "test@test.com",
  "kian-test-",
  "kian-db-",
  "test-kian-",
];

const SKIP_NAME_PATTERNS = [
  /^block\b/i,
  /^test\b/i,
  /^jane mctest$/i,
  /^integration test$/i,
  /^new boxer$/i,
  /^id,?\s*omnis/i,
  /^esse,?\s*id/i,
  /^sed,?\s*quod/i,
];

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === ",") {
      row.push(field);
      field = "";
      continue;
    }
    if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }
    if (ch === "\r") continue;
    field += ch;
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function normalizeEmail(raw) {
  let email = String(raw ?? "").trim().replace(/^mailto:/i, "");
  email = email.replace(/\s+/g, "");
  email = email.replace(/,+$/, "");
  if (!email.includes("@") || !email.includes(".")) return null;
  if (email.split("@").length !== 2) return null;
  email = email.toLowerCase();
  if (SKIP_EMAIL_FRAGMENTS.some((frag) => email.includes(frag))) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

function normalizePhone(raw) {
  const digits = String(raw ?? "").replace(/\D/g, "");
  if (digits.length < 7) return null;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (digits.length === 10) return `+1${digits}`;
  return `+${digits}`;
}

function displayName(first, last) {
  return `${String(first ?? "").trim()} ${String(last ?? "").trim()}`.replace(/\s+/g, " ").trim();
}

function shouldSkipName(name) {
  if (!name) return true;
  return SKIP_NAME_PATTERNS.some((re) => re.test(name));
}

function parseDays(raw) {
  const n = Number(String(raw ?? "").trim());
  return Number.isFinite(n) ? n : null;
}

const csvPath = process.argv[2];
if (!csvPath) {
  console.error("Usage: node scripts/import-client-list.mjs <path-to-csv>");
  process.exit(1);
}

const abs = path.resolve(csvPath);
if (!fs.existsSync(abs)) {
  console.error("CSV not found:", abs);
  process.exit(1);
}

const rows = parseCsv(fs.readFileSync(abs, "utf8"));
const header = rows[0]?.map((h) => h.trim()) ?? [];
const idx = Object.fromEntries(header.map((h, i) => [h, i]));

const byEmail = new Map();
const skipped = { noEmail: 0, banned: 0, test: 0, name: 0 };

for (const row of rows.slice(1)) {
  if (!row.some((cell) => String(cell ?? "").trim())) continue;
  const first = row[idx["First Name"]] ?? "";
  const last = row[idx["Last Name"]] ?? "";
  const name = displayName(first, last);
  const banned = String(row[idx["Banned"]] ?? "").trim().toUpperCase() === "Y";
  const email = normalizeEmail(row[idx["Email"]]);
  const notes = String(row[idx["Notes"]] ?? "").trim();
  const phone = normalizePhone(row[idx["Phone"]]);
  const days = parseDays(row[idx["Days Since Last Appointment"]]);

  if (banned) {
    skipped.banned += 1;
    continue;
  }
  if (!email) {
    skipped.noEmail += 1;
    continue;
  }
  if (shouldSkipName(name)) {
    skipped.name += 1;
    continue;
  }

  const existing = byEmail.get(email);
  const next = {
    email,
    name,
    phone,
    notes,
    days,
    aliases: [name],
  };
  if (!existing) {
    byEmail.set(email, next);
    continue;
  }
  existing.aliases.push(name);
  if (!existing.phone && phone) existing.phone = phone;
  if ((notes?.length ?? 0) > (existing.notes?.length ?? 0)) existing.notes = notes;
  else if (notes && existing.notes && !existing.notes.includes(notes)) {
    existing.notes = `${existing.notes}\n\n---\n${notes}`;
  }
  if (existing.days == null || (days != null && days < existing.days)) {
    existing.days = days;
    if (name) existing.name = name;
  }
}

const prisma = new PrismaClient();
const stats = { created: 0, updated: 0, skippedStaff: 0, unchanged: 0 };

function importedNoteText(client) {
  const uniqueAliases = [...new Set(client.aliases.filter((n) => n && n !== client.name))];
  return [
    client.notes || null,
    uniqueAliases.length ? `Also listed as: ${uniqueAliases.join("; ")}` : null,
    client.days != null ? `Days since last appointment (at import): ${client.days}` : null,
  ]
    .filter(Boolean)
    .join("\n\n");
}

try {
  const host = process.env.DATABASE_URL?.match(/@([^/]+)\//)?.[1];
  console.log("Importing into", host);
  console.log("Unique emails to process:", byEmail.size);

  const existingUsers = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      passwordHash: true,
      profile: { select: { phone: true, notes: true, importedNotes: true, source: true } },
    },
  });
  const existingByEmail = new Map(
    existingUsers.map((user) => [user.email.trim().toLowerCase(), user]),
  );
  console.log("Existing users in database:", existingUsers.length);

  const toCreate = [];
  const toUpdate = [];
  for (const client of byEmail.values()) {
    const existing = existingByEmail.get(client.email);
    if (existing && STAFF_ROLES.has(existing.role)) {
      stats.skippedStaff += 1;
      continue;
    }
    if (!existing) toCreate.push(client);
    else toUpdate.push({ client, existing });
  }

  console.log(`Creating ${toCreate.length} new members...`);
  const created = [];
  const chunkSize = 50;
  for (let i = 0; i < toCreate.length; i += chunkSize) {
    const chunk = toCreate.slice(i, i + chunkSize);
    await prisma.user.createMany({
      data: chunk.map((client) => ({
        email: client.email,
        name: client.name || null,
        role: Role.MEMBER,
        mustSetPassword: true,
        memberOnboardingComplete: false,
      })),
      skipDuplicates: true,
    });
    const users = await prisma.user.findMany({
      where: { email: { in: chunk.map((client) => client.email) } },
      select: { id: true, email: true },
    });
    created.push(...users);
    console.log(`  users ${Math.min(i + chunk.length, toCreate.length)}/${toCreate.length}`);
  }

  const createdByEmail = new Map(created.map((user) => [user.email.toLowerCase(), user]));
  for (let i = 0; i < toCreate.length; i += chunkSize) {
    const chunk = toCreate.slice(i, i + chunkSize);
    await prisma.profile.createMany({
      data: chunk.map((client) => {
        const user = createdByEmail.get(client.email);
        const notes = importedNoteText(client);
        return {
          userId: user.id,
          phone: client.phone,
          importedNotes: notes || null,
          notes: notes || null,
          source: "client-list-import",
        };
      }),
      skipDuplicates: true,
    });
  }
  stats.created = toCreate.length;

  console.log(`Updating ${toUpdate.length} existing accounts...`);
  for (let i = 0; i < toUpdate.length; i += 25) {
    const chunk = toUpdate.slice(i, i + 25);
    await Promise.all(
      chunk.map(({ client, existing }) => {
        const keepPassword = Boolean(existing.passwordHash);
        const notes = importedNoteText(client);
        return prisma.user.update({
          where: { id: existing.id },
          data: {
            name: existing.name || client.name || existing.name,
            role: existing.role === Role.GUEST ? Role.MEMBER : existing.role,
            mustSetPassword: keepPassword ? undefined : true,
            memberOnboardingComplete: keepPassword ? true : false,
            profile: {
              upsert: {
                create: {
                  phone: client.phone,
                  importedNotes: notes || null,
                  notes: notes || null,
                  source: "client-list-import",
                },
                update: {
                  phone: existing.profile?.phone || client.phone,
                  importedNotes: existing.profile?.importedNotes || notes || null,
                  notes: existing.profile?.notes || notes || null,
                  source: existing.profile?.source || "client-list-import",
                },
              },
            },
          },
        });
      }),
    );
    console.log(`  updated ${Math.min(i + chunk.length, toUpdate.length)}/${toUpdate.length}`);
  }
  stats.updated = toUpdate.length;

  console.log("Import complete.");
  console.log("Unique emails:", byEmail.size);
  console.log(stats);
  console.log("Skipped rows:", skipped);
} finally {
  await prisma.$disconnect();
}
