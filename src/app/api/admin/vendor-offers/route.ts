import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminAccess } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/ops/audit";
import { serializeOffer, suggestedRetailPrice, syncProductFromBestOffer } from "@/lib/commerce/vendor-pricing";

const upsertSchema = z.object({
  productId: z.string().min(1),
  vendorId: z.string().min(1),
  unitCost: z.number().min(0),
  shippingCost: z.number().min(0).optional(),
  vendorSku: z.string().max(80).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export async function GET(req: Request) {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;
  const productId = new URL(req.url).searchParams.get("productId");

  const offers = await prisma.productVendorOffer.findMany({
    where: productId ? { productId } : undefined,
    orderBy: { updatedAt: "desc" },
    include: { vendor: { select: { id: true, name: true } }, product: { select: { id: true, title: true } } },
    take: 400,
  });

  return NextResponse.json({ offers: offers.map(serializeOffer) });
}

export async function POST(req: Request) {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;
  const body = await req.json();

  if (body?.action === "applySuggested") {
    const productId = String(body.productId || "");
    if (!productId) return NextResponse.json({ error: "Product required." }, { status: 400 });
    const synced = await syncProductFromBestOffer(productId);
    if (synced.suggestedRetail == null) {
      return NextResponse.json({ error: "Add at least one vendor price first." }, { status: 400 });
    }
    const product = await prisma.product.update({
      where: { id: productId },
      data: { price: synced.suggestedRetail },
    });
    await writeAuditLog({
      userId: guard.userId,
      action: "product.apply_suggested_price",
      entityType: "Product",
      entityId: productId,
      metadata: { price: synced.suggestedRetail, vendorId: synced.best?.vendorId },
    });
    return NextResponse.json({
      product: { ...product, price: Number(product.price), wholesalePrice: product.wholesalePrice != null ? Number(product.wholesalePrice) : null },
      suggestedRetail: synced.suggestedRetail,
      best: synced.best,
    });
  }

  const parsed = upsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid vendor price." }, { status: 400 });
  }

  const offer = await prisma.productVendorOffer.upsert({
    where: {
      productId_vendorId: { productId: parsed.data.productId, vendorId: parsed.data.vendorId },
    },
    create: {
      productId: parsed.data.productId,
      vendorId: parsed.data.vendorId,
      unitCost: parsed.data.unitCost,
      shippingCost: parsed.data.shippingCost ?? 0,
      vendorSku: parsed.data.vendorSku?.trim() || null,
      notes: parsed.data.notes?.trim() || null,
    },
    update: {
      unitCost: parsed.data.unitCost,
      shippingCost: parsed.data.shippingCost ?? 0,
      vendorSku: parsed.data.vendorSku === undefined ? undefined : parsed.data.vendorSku?.trim() || null,
      notes: parsed.data.notes === undefined ? undefined : parsed.data.notes?.trim() || null,
    },
    include: { vendor: { select: { id: true, name: true } } },
  });

  const synced = await syncProductFromBestOffer(parsed.data.productId);
  await writeAuditLog({
    userId: guard.userId,
    action: "vendor_offer.upsert",
    entityType: "ProductVendorOffer",
    entityId: offer.id,
  });

  return NextResponse.json({
    offer: serializeOffer(offer),
    offers: synced.offers,
    best: synced.best,
    suggestedRetail: synced.suggestedRetail,
  });
}

export async function DELETE(req: Request) {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;
  const id = new URL(req.url).searchParams.get("id") || ((await req.json().catch(() => ({}))) as { id?: string }).id;
  if (!id) return NextResponse.json({ error: "Offer id required." }, { status: 400 });

  const existing = await prisma.productVendorOffer.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Offer not found." }, { status: 404 });

  await prisma.productVendorOffer.delete({ where: { id } });
  const synced = await syncProductFromBestOffer(existing.productId);
  return NextResponse.json({ ok: true, offers: synced.offers, best: synced.best, suggestedRetail: synced.suggestedRetail });
}
