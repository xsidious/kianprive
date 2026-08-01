import { readFile } from "fs/promises";
import path from "path";
import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFImage,
  type PDFPage,
} from "pdf-lib";

export type IntakePdfInput = {
  referenceId: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  referredBy?: string | null;
  assignedProvider?: string | null;
  payload: Record<string, unknown>;
  clientSignatureDataUrl?: string | null;
  providerSignatureDataUrl?: string | null;
  providerSignedName?: string | null;
  providerSignedAt?: string | Date | null;
  attestationName?: string | null;
  attestationDate?: string | null;
};

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN_X = 42;
const MARGIN_TOP = 44;
const MARGIN_BOTTOM = 52;
const CONTENT_W = PAGE_W - MARGIN_X * 2;

const COLORS = {
  ink: rgb(0.14, 0.11, 0.08),
  muted: rgb(0.42, 0.37, 0.32),
  soft: rgb(0.55, 0.5, 0.45),
  gold: rgb(0.541, 0.408, 0.18),
  goldLight: rgb(0.93, 0.88, 0.78),
  goldPale: rgb(0.975, 0.955, 0.91),
  line: rgb(0.82, 0.76, 0.66),
  card: rgb(0.988, 0.982, 0.972),
  white: rgb(1, 1, 1),
  rule: rgb(0.88, 0.84, 0.78),
};

function str(value: unknown) {
  if (value == null || value === "") return "-";
  if (Array.isArray(value)) return value.length ? value.map((v) => str(v)).join(", ") : "-";
  return sanitizePdfText(String(value).trim()) || "-";
}

/** Helvetica/WinAnsi-safe text for pdf-lib StandardFonts. */
function sanitizePdfText(text: string) {
  return text
    .replace(/\u2014/g, "--")
    .replace(/\u2013/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2026/g, "...")
    .replace(/\u00A0/g, " ")
    .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, "");
}

function formatDateTime(value?: string | Date | null) {
  if (!value) return "-";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return sanitizePdfText(String(value));
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

async function embedPng(doc: PDFDocument, dataUrl?: string | null) {
  if (!dataUrl?.startsWith("data:image")) return null;
  const base64 = dataUrl.split(",")[1];
  if (!base64) return null;
  const bytes = Buffer.from(base64, "base64");
  try {
    return await doc.embedPng(bytes);
  } catch {
    try {
      return await doc.embedJpg(bytes);
    } catch {
      return null;
    }
  }
}

async function embedBrandLogo(doc: PDFDocument) {
  try {
    const logoPath = path.join(process.cwd(), "public", "images", "kian-prive-logo.png");
    const bytes = await readFile(logoPath);
    return await doc.embedPng(bytes);
  } catch {
    return null;
  }
}

function wrapText(
  text: string,
  maxWidth: number,
  size: number,
  font: PDFFont,
) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return ["-"];
  const words = normalized.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : ["-"];
}

type FieldPair = { label: string; value: unknown };

/** Build a signed clinical intake PDF (client + provider signatures). */
export async function buildIntakePdf(input: IntakePdfInput) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const italic = await doc.embedFont(StandardFonts.HelveticaOblique);

  const logo = await embedBrandLogo(doc);
  const clientSig = await embedPng(doc, input.clientSignatureDataUrl);
  const providerSig = await embedPng(doc, input.providerSignatureDataUrl);

  const pages: PDFPage[] = [];
  let page = doc.addPage([PAGE_W, PAGE_H]);
  pages.push(page);
  let y = PAGE_H - MARGIN_TOP;

  const ensureSpace = (needed: number) => {
    if (y - needed >= MARGIN_BOTTOM) return;
    page = doc.addPage([PAGE_W, PAGE_H]);
    pages.push(page);
    y = PAGE_H - MARGIN_TOP - 8;
  };

  const advance = (amount: number) => {
    y -= amount;
  };

  // ── Header ──────────────────────────────────────────────────────────────
  page.drawRectangle({
    x: 0,
    y: PAGE_H - 96,
    width: PAGE_W,
    height: 96,
    color: COLORS.goldPale,
  });
  page.drawRectangle({
    x: 0,
    y: PAGE_H - 98,
    width: PAGE_W,
    height: 2.5,
    color: COLORS.gold,
  });

  if (logo) {
    const logoH = 46;
    const logoW = (logo.width / logo.height) * logoH;
    page.drawImage(logo, {
      x: MARGIN_X,
      y: PAGE_H - 72,
      width: Math.min(logoW, 150),
      height: logoH,
    });
  } else {
    page.drawText("KIAN PRIVE", {
      x: MARGIN_X,
      y: PAGE_H - 52,
      size: 18,
      font: bold,
      color: COLORS.gold,
    });
  }

  const titleX = MARGIN_X + 170;
  page.drawText("Clinical Intake Form", {
    x: titleX,
    y: PAGE_H - 42,
    size: 16,
    font: bold,
    color: COLORS.ink,
  });
  page.drawText("Compounded Wellness  ·  Provider Connect", {
    x: titleX,
    y: PAGE_H - 58,
    size: 9,
    font: italic,
    color: COLORS.muted,
  });
  page.drawText("Confidential medical record", {
    x: titleX,
    y: PAGE_H - 72,
    size: 8,
    font: font,
    color: COLORS.soft,
  });

  y = PAGE_H - 118;

  // ── Meta strip ──────────────────────────────────────────────────────────
  const metaBoxH = 46;
  ensureSpace(metaBoxH + 12);
  page.drawRectangle({
    x: MARGIN_X,
    y: y - metaBoxH,
    width: CONTENT_W,
    height: metaBoxH,
    color: COLORS.card,
    borderColor: COLORS.line,
    borderWidth: 0.8,
  });

  const metaCols = [
    { label: "REFERENCE", value: input.referenceId.slice(0, 18) },
    { label: "GENERATED", value: formatDateTime(new Date()) },
    {
      label: "PROVIDER",
      value: str(input.assignedProvider || input.payload.assignedProvider || "Dr. Carmen Ramirez"),
    },
    {
      label: "STATUS",
      value: providerSig ? "Provider signed" : clientSig ? "Client signed" : "Incomplete",
    },
  ];
  const metaColW = CONTENT_W / metaCols.length;
  metaCols.forEach((col, i) => {
    const x = MARGIN_X + 10 + i * metaColW;
    page.drawText(col.label, {
      x,
      y: y - 14,
      size: 7,
      font: bold,
      color: COLORS.gold,
    });
    const valueLines = wrapText(col.value, metaColW - 16, 8.5, font);
    page.drawText(valueLines[0] ?? "-", {
      x,
      y: y - 28,
      size: 8.5,
      font: font,
      color: COLORS.ink,
    });
  });
  advance(metaBoxH + 18);

  // ── Helpers ─────────────────────────────────────────────────────────────
  const drawSectionTitle = (title: string, number?: string) => {
    ensureSpace(36);
    advance(4);
    page.drawRectangle({
      x: MARGIN_X,
      y: y - 20,
      width: CONTENT_W,
      height: 22,
      color: COLORS.goldPale,
    });
    page.drawRectangle({
      x: MARGIN_X,
      y: y - 20,
      width: 3.5,
      height: 22,
      color: COLORS.gold,
    });
    const label = number ? `${number}  ${title}` : title;
    page.drawText(label.toUpperCase(), {
      x: MARGIN_X + 12,
      y: y - 14,
      size: 9,
      font: bold,
      color: COLORS.gold,
    });
    advance(28);
  };

  const drawFieldRow = (fields: FieldPair[], columns = 2) => {
    const gap = 12;
    const colW = (CONTENT_W - gap * (columns - 1)) / columns;
    const labelSize = 7.5;
    const valueSize = 9.5;

    for (let i = 0; i < fields.length; i += columns) {
      const chunk = fields.slice(i, i + columns);
      let rowH = 0;
      chunk.forEach((field) => {
        const valueLines = wrapText(str(field.value), colW - 8, valueSize, font);
        rowH = Math.max(rowH, 12 + valueLines.length * (valueSize + 2) + 10);
      });
      ensureSpace(rowH + 4);
      chunk.forEach((field, idx) => {
        const x = MARGIN_X + idx * (colW + gap);
        page.drawText(field.label.toUpperCase(), {
          x,
          y: y - 8,
          size: labelSize,
          font: bold,
          color: COLORS.soft,
        });
        const valueLines = wrapText(str(field.value), colW - 8, valueSize, font);
        valueLines.forEach((line, li) => {
          page.drawText(line, {
            x,
            y: y - 22 - li * (valueSize + 2),
            size: valueSize,
            font: font,
            color: COLORS.ink,
          });
        });
      });
      page.drawLine({
        start: { x: MARGIN_X, y: y - rowH + 4 },
        end: { x: MARGIN_X + CONTENT_W, y: y - rowH + 4 },
        thickness: 0.4,
        color: COLORS.rule,
      });
      advance(rowH);
    }
  };

  const drawLongField = (label: string, value: unknown) => {
    const valueText = str(value);
    const valueSize = 9.5;
    const lines = wrapText(valueText, CONTENT_W - 16, valueSize, font);
    const boxH = 18 + lines.length * (valueSize + 3) + 8;
    ensureSpace(boxH + 6);
    page.drawText(label.toUpperCase(), {
      x: MARGIN_X,
      y: y - 8,
      size: 7.5,
      font: bold,
      color: COLORS.soft,
    });
    page.drawRectangle({
      x: MARGIN_X,
      y: y - boxH,
      width: CONTENT_W,
      height: boxH - 12,
      color: COLORS.card,
      borderColor: COLORS.rule,
      borderWidth: 0.5,
    });
    lines.forEach((line, li) => {
      page.drawText(line, {
        x: MARGIN_X + 8,
        y: y - 28 - li * (valueSize + 3),
        size: valueSize,
        font: font,
        color: COLORS.ink,
      });
    });
    advance(boxH + 4);
  };

  const drawSignatureBlock = (opts: {
    title: string;
    nameLabel: string;
    nameValue: string;
    dateLabel: string;
    dateValue: string;
    image: PDFImage | null;
  }) => {
    const sigBoxH = 88;
    const blockH = 36 + sigBoxH + 28;
    ensureSpace(blockH + 8);

    page.drawText(opts.title.toUpperCase(), {
      x: MARGIN_X,
      y: y - 8,
      size: 8,
      font: bold,
      color: COLORS.gold,
    });
    advance(16);

    // Signature canvas box
    page.drawRectangle({
      x: MARGIN_X,
      y: y - sigBoxH,
      width: CONTENT_W * 0.58,
      height: sigBoxH,
      color: COLORS.white,
      borderColor: COLORS.line,
      borderWidth: 1,
    });
    page.drawText("SIGNATURE", {
      x: MARGIN_X + 8,
      y: y - 12,
      size: 6.5,
      font: bold,
      color: COLORS.soft,
    });

    if (opts.image) {
      const maxW = CONTENT_W * 0.58 - 24;
      const maxH = sigBoxH - 28;
      const scale = Math.min(maxW / opts.image.width, maxH / opts.image.height);
      const w = opts.image.width * scale;
      const h = opts.image.height * scale;
      page.drawImage(opts.image, {
        x: MARGIN_X + 12,
        y: y - sigBoxH + 10,
        width: w,
        height: h,
      });
    } else {
      page.drawText("No signature on file", {
        x: MARGIN_X + 12,
        y: y - sigBoxH / 2 - 4,
        size: 9,
        font: italic,
        color: COLORS.soft,
      });
    }

    // Name / date beside signature
    const sideX = MARGIN_X + CONTENT_W * 0.58 + 14;
    const sideW = CONTENT_W * 0.42 - 14;
    page.drawText(opts.nameLabel.toUpperCase(), {
      x: sideX,
      y: y - 12,
      size: 7,
      font: bold,
      color: COLORS.soft,
    });
    const nameLines = wrapText(opts.nameValue, sideW, 10, bold);
    nameLines.forEach((line, i) => {
      page.drawText(line, {
        x: sideX,
        y: y - 28 - i * 12,
        size: 10,
        font: bold,
        color: COLORS.ink,
      });
    });

    page.drawLine({
      start: { x: sideX, y: y - 52 },
      end: { x: sideX + sideW, y: y - 52 },
      thickness: 0.5,
      color: COLORS.rule,
    });

    page.drawText(opts.dateLabel.toUpperCase(), {
      x: sideX,
      y: y - 64,
      size: 7,
      font: bold,
      color: COLORS.soft,
    });
    page.drawText(opts.dateValue, {
      x: sideX,
      y: y - 78,
      size: 9.5,
      font: font,
      color: COLORS.ink,
    });

    advance(sigBoxH + 18);
  };

  // ── 01 Patient ──────────────────────────────────────────────────────────
  drawSectionTitle("Patient Information", "01");
  drawFieldRow([
    { label: "Full name", value: input.fullName },
    { label: "Date of birth", value: input.dateOfBirth },
    { label: "Age", value: input.payload.age },
    { label: "Sex at birth", value: input.payload.sexAtBirth },
    { label: "Phone", value: input.phone },
    { label: "Email", value: input.email },
  ]);
  drawLongField("Address", input.payload.address);
  drawFieldRow([
    { label: "Driver's license / Passport #", value: input.payload.idNumber },
    { label: "State / Country of issue", value: input.payload.idIssuePlace },
    { label: "Primary care physician", value: input.payload.primaryCarePhysician },
    { label: "First appointment date", value: input.payload.firstAppointmentDate },
    { label: "Referred by", value: input.referredBy || input.payload.referredBy },
    {
      label: "Assigned provider",
      value: input.assignedProvider || input.payload.assignedProvider,
    },
  ]);

  // ── Scheduling ──────────────────────────────────────────────────────────
  drawSectionTitle("Provider Connect Notes", "02");
  drawFieldRow([
    { label: "Scheduling status", value: input.payload.requestedDate || "To be scheduled" },
    { label: "Preferred time", value: input.payload.requestedTime || "TBD" },
  ]);
  if (str(input.payload.schedulingNotes) !== "-") {
    drawLongField("Discussion notes", input.payload.schedulingNotes);
  }

  // ── Medications ─────────────────────────────────────────────────────────
  drawSectionTitle("Medications, Supplements & Allergies", "03");
  drawLongField("Prescription medications", input.payload.prescriptionMedications);
  drawLongField("Supplements & peptides", input.payload.supplementsPeptides);
  drawFieldRow([
    { label: "Medication allergies", value: input.payload.medicationAllergies },
    { label: "Food allergies", value: input.payload.foodAllergies },
  ]);
  drawLongField("Other allergies", input.payload.otherAllergies);

  // ── History ─────────────────────────────────────────────────────────────
  drawSectionTitle("Past Medical & Surgical History", "04");
  drawLongField("Conditions", input.payload.conditions);
  drawLongField("Other conditions", input.payload.otherConditions);
  drawFieldRow([
    { label: "Surgical procedures (past 12 months)", value: input.payload.recentSurgeries },
    { label: "Pregnant / breastfeeding / planning", value: input.payload.pregnantBreastfeeding },
    { label: "Last physical (year/month)", value: input.payload.lastPhysicalDate },
    { label: "Last bloodwork (year/month)", value: input.payload.lastBloodworkDate },
    { label: "Bloodwork within normal limits", value: input.payload.bloodworkWithinNormalLimits },
  ]);

  // ── GLP ─────────────────────────────────────────────────────────────────
  drawSectionTitle("GLP / Weight-Loss History", "05");
  drawLongField("Previous medications", input.payload.glpMedications);
  drawFieldRow([
    { label: "Dose", value: input.payload.glpDose },
    { label: "Duration used", value: input.payload.glpDuration },
  ]);
  drawLongField("Reason stopped", input.payload.glpReasonStopped);
  drawLongField("Side effects / notable experience", input.payload.glpSideEffects);

  // ── Screening ───────────────────────────────────────────────────────────
  drawSectionTitle("Contraindication Screening", "06");
  drawLongField("Personal history", input.payload.contraindications);
  drawFieldRow([
    { label: "Family history of MTC or MEN2", value: input.payload.familyMtcMen2 },
    { label: "Allergic reaction to med / supplement / peptide", value: input.payload.allergicReactionAny },
  ]);
  if (str(input.payload.allergicReactionAny).toLowerCase() === "yes") {
    drawLongField("Allergic reaction details", input.payload.allergicReactionDetails);
  }

  // ── Consent note ────────────────────────────────────────────────────────
  drawSectionTitle("Patient Attestation & Consent", "07");
  ensureSpace(70);
  page.drawRectangle({
    x: MARGIN_X,
    y: y - 58,
    width: CONTENT_W,
    height: 58,
    color: COLORS.card,
    borderColor: COLORS.line,
    borderWidth: 0.6,
  });
  const consentLines = [
    "Patient confirms the information above is accurate and complete, and acknowledges that this",
    "intake is for clinical consultation only. Peptide therapies are provided under licensed physician",
    "oversight after evaluation. Personal and medical information is confidential and protected under HIPAA.",
  ];
  consentLines.forEach((line, i) => {
    page.drawText(line, {
      x: MARGIN_X + 10,
      y: y - 18 - i * 12,
      size: 8,
      font: italic,
      color: COLORS.muted,
    });
  });
  advance(68);

  drawSignatureBlock({
    title: "Client signature",
    nameLabel: "Printed name",
    nameValue: str(input.attestationName || input.payload.attestationName || input.fullName),
    dateLabel: "Date signed",
    dateValue: str(input.attestationDate || input.payload.attestationDate),
    image: clientSig,
  });

  drawSignatureBlock({
    title: "Provider / Physician signature",
    nameLabel: "Provider name",
    nameValue: str(input.providerSignedName),
    dateLabel: "Signed at",
    dateValue: formatDateTime(input.providerSignedAt),
    image: providerSig,
  });

  // ── Closing line ────────────────────────────────────────────────────────
  ensureSpace(28);
  page.drawLine({
    start: { x: MARGIN_X, y },
    end: { x: MARGIN_X + CONTENT_W, y },
    thickness: 1,
    color: COLORS.gold,
  });
  advance(14);
  page.drawText("KIAN Prive  ·  Wellness Hub Clinical Intake  ·  For authorized clinical use only", {
    x: MARGIN_X,
    y,
    size: 7.5,
    font: italic,
    color: COLORS.soft,
  });

  // ── Page chrome (headers/footers on continuation pages + all footers) ───
  const totalPages = pages.length;
  pages.forEach((p, index) => {
    const pageNum = index + 1;

    // Continuation page top rule (skip first - has full header)
    if (index > 0) {
      p.drawRectangle({
        x: 0,
        y: PAGE_H - 28,
        width: PAGE_W,
        height: 28,
        color: COLORS.goldPale,
      });
      p.drawText("KIAN PRIVE  ·  Clinical Intake Form", {
        x: MARGIN_X,
        y: PAGE_H - 18,
        size: 8,
        font: bold,
        color: COLORS.gold,
      });
      p.drawText(`Ref ${input.referenceId.slice(0, 12)}...`, {
        x: PAGE_W - MARGIN_X - 90,
        y: PAGE_H - 18,
        size: 7.5,
        font: font,
        color: COLORS.muted,
      });
    }

    // Footer
    p.drawLine({
      start: { x: MARGIN_X, y: 34 },
      end: { x: PAGE_W - MARGIN_X, y: 34 },
      thickness: 0.6,
      color: COLORS.line,
    });
    p.drawText("CONFIDENTIAL - Protected under HIPAA guidelines", {
      x: MARGIN_X,
      y: 20,
      size: 7,
      font: font,
      color: COLORS.soft,
    });
    const pageLabel = `Page ${pageNum} of ${totalPages}`;
    const pageLabelW = font.widthOfTextAtSize(pageLabel, 7.5);
    p.drawText(pageLabel, {
      x: PAGE_W - MARGIN_X - pageLabelW,
      y: 20,
      size: 7.5,
      font: font,
      color: COLORS.muted,
    });
  });

  return Buffer.from(await doc.save());
}
