import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/partners";
import {
  PEPTIDE_GUIDELINES,
  PEPTIDE_LIBRARY_DISCLAIMER,
  PEPTIDE_LIBRARY_INTRO,
  PEPTIDE_LIBRARY_TITLE,
  PEPTIDE_LIBRARY_VERSION,
  peptideToGuidelineBody,
} from "@/lib/partners/peptide-guidelines-data";

/** Publish/upsert the full peptide library and grant to all partners. */
export async function POST() {
  const access = await requireAdminAccess();
  if (!access.ok) return access.response;

  const result = await prisma.$transaction(async (tx) => {
    const cover =
      (await tx.partnerGuideline.findFirst({
        where: { title: PEPTIDE_LIBRARY_TITLE },
      })) ??
      (await tx.partnerGuideline.create({
        data: {
          title: PEPTIDE_LIBRARY_TITLE,
          category: "PEPTIDES",
          body: `${PEPTIDE_LIBRARY_INTRO}\n\n${PEPTIDE_LIBRARY_DISCLAIMER}`,
          version: PEPTIDE_LIBRARY_VERSION,
          requiresAck: true,
          publishedAt: new Date(),
        },
      }));

    await tx.partnerGuideline.update({
      where: { id: cover.id },
      data: {
        category: "PEPTIDES",
        body: `${PEPTIDE_LIBRARY_INTRO}\n\n${PEPTIDE_LIBRARY_DISCLAIMER}`,
        version: PEPTIDE_LIBRARY_VERSION,
        requiresAck: true,
        publishedAt: new Date(),
      },
    });

    await tx.partnerGuidelineGrant.deleteMany({ where: { guidelineId: cover.id } });
    await tx.partnerGuidelineGrant.create({
      data: { guidelineId: cover.id, allPartners: true },
    });

    let upserted = 0;
    for (const peptide of PEPTIDE_GUIDELINES) {
      const title = `Peptide Protocol: ${peptide.name}`;
      const existing = await tx.partnerGuideline.findFirst({ where: { title } });
      if (existing) {
        await tx.partnerGuideline.update({
          where: { id: existing.id },
          data: {
            category: "PEPTIDES",
            body: peptideToGuidelineBody(peptide),
            version: PEPTIDE_LIBRARY_VERSION,
            requiresAck: false,
            publishedAt: new Date(),
          },
        });
        await tx.partnerGuidelineGrant.deleteMany({ where: { guidelineId: existing.id } });
        await tx.partnerGuidelineGrant.create({
          data: { guidelineId: existing.id, allPartners: true },
        });
      } else {
        const created = await tx.partnerGuideline.create({
          data: {
            title,
            category: "PEPTIDES",
            body: peptideToGuidelineBody(peptide),
            version: PEPTIDE_LIBRARY_VERSION,
            requiresAck: false,
            publishedAt: new Date(),
            grants: { create: [{ allPartners: true }] },
          },
        });
        void created;
      }
      upserted += 1;
    }

    return { coverId: cover.id, upserted };
  });

  await writeAuditLog({
    userId: access.userId,
    action: "partner.guidelines.peptide_library.publish",
    entityType: "PartnerGuideline",
    entityId: result.coverId,
    metadata: { upserted: result.upserted, version: PEPTIDE_LIBRARY_VERSION },
  });

  return NextResponse.json({
    ok: true,
    coverId: result.coverId,
    protocols: result.upserted,
    version: PEPTIDE_LIBRARY_VERSION,
  });
}
