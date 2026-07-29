import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

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

function str(value: unknown) {
  if (value == null || value === "") return "—";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "—";
  return String(value);
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

/** Build a signed clinical intake PDF (client + provider signatures). */
export async function buildIntakePdf(input: IntakePdfInput) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  let page = doc.addPage([612, 792]);
  let y = 750;
  const left = 48;
  const width = 516;
  const lineGap = 14;

  const drawText = (text: string, opts?: { size?: number; bold?: boolean; color?: ReturnType<typeof rgb> }) => {
    const size = opts?.size ?? 10;
    const useBold = opts?.bold ? bold : font;
    const color = opts?.color ?? rgb(0.12, 0.1, 0.08);
    const lines = wrapText(text, width, size, useBold);
    for (const line of lines) {
      if (y < 72) {
        page = doc.addPage([612, 792]);
        y = 750;
      }
      page.drawText(line, { x: left, y, size, font: useBold, color });
      y -= lineGap;
    }
  };

  const section = (title: string) => {
    y -= 6;
    drawText(title, { size: 12, bold: true, color: rgb(0.55, 0.43, 0.24) });
    y -= 2;
  };

  const field = (label: string, value: unknown) => {
    drawText(`${label}: ${str(value)}`);
  };

  drawText("KIAN PRIVÉ — Clinical Intake", { size: 16, bold: true });
  drawText("Wellness Hub / Provider Connect", { size: 10, color: rgb(0.4, 0.35, 0.3) });
  drawText(`Reference: ${input.referenceId}`);
  drawText(`Generated: ${new Date().toLocaleString()}`);
  y -= 8;

  section("Patient");
  field("Full name", input.fullName);
  field("Email", input.email);
  field("Phone", input.phone);
  field("Date of birth", input.dateOfBirth);
  field("Age", input.payload.age);
  field("Sex at birth", input.payload.sexAtBirth);
  field("Address", input.payload.address);
  field("Referred by", input.referredBy || input.payload.referredBy);
  field("Assigned provider", input.assignedProvider || input.payload.assignedProvider);
  field("Requested appointment", `${str(input.payload.requestedDate)} at ${str(input.payload.requestedTime)}`);

  section("Medications & allergies");
  field("Prescription medications", input.payload.prescriptionMedications);
  field("Supplements & peptides", input.payload.supplementsPeptides);
  field("Medication allergies", input.payload.medicationAllergies);
  field("Food allergies", input.payload.foodAllergies);
  field("Other allergies", input.payload.otherAllergies);

  section("History");
  field("Conditions", input.payload.conditions);
  field("Other conditions", input.payload.otherConditions);
  field("Recent surgeries", input.payload.recentSurgeries);
  field("Pregnant / breastfeeding", input.payload.pregnantBreastfeeding);

  section("GLP / weight-loss history");
  field("Medications", input.payload.glpMedications);
  field("Dose", input.payload.glpDose);
  field("Duration", input.payload.glpDuration);
  field("Reason stopped", input.payload.glpReasonStopped);
  field("Side effects", input.payload.glpSideEffects);

  section("Screening");
  field("Contraindications", input.payload.contraindications);
  field("Family MTC / MEN2", input.payload.familyMtcMen2);
  field("Allergic reaction", input.payload.allergicReactionAny);
  field("Allergic reaction details", input.payload.allergicReactionDetails);

  section("Signatures");
  field("Client printed name", input.attestationName || input.payload.attestationName);
  field("Client signed date", input.attestationDate || input.payload.attestationDate);

  const clientSig = await embedPng(doc, input.clientSignatureDataUrl);
  if (clientSig) {
    if (y < 160) {
      page = doc.addPage([612, 792]);
      y = 750;
    }
    drawText("Client signature:", { bold: true });
    const sigW = 220;
    const sigH = (clientSig.height / clientSig.width) * sigW;
    page.drawImage(clientSig, { x: left, y: y - sigH, width: sigW, height: sigH });
    y -= sigH + 16;
  }

  field("Provider name", input.providerSignedName);
  field(
    "Provider signed at",
    input.providerSignedAt ? new Date(input.providerSignedAt).toLocaleString() : "—",
  );

  const providerSig = await embedPng(doc, input.providerSignatureDataUrl);
  if (providerSig) {
    if (y < 160) {
      page = doc.addPage([612, 792]);
      y = 750;
    }
    drawText("Provider signature:", { bold: true });
    const sigW = 220;
    const sigH = (providerSig.height / providerSig.width) * sigW;
    page.drawImage(providerSig, { x: left, y: y - sigH, width: sigW, height: sigH });
    y -= sigH + 16;
  }

  y -= 10;
  drawText("Confidential — protected under HIPAA guidelines.", {
    size: 8,
    color: rgb(0.45, 0.4, 0.35),
  });

  return Buffer.from(await doc.save());
}

function wrapText(
  text: string,
  maxWidth: number,
  size: number,
  font: { widthOfTextAtSize: (t: string, s: number) => number },
) {
  const words = text.split(/\s+/);
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
  return lines.length ? lines : [""];
}
