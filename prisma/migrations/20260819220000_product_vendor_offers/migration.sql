CREATE TABLE IF NOT EXISTS "ProductVendorOffer" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "vendorId" TEXT NOT NULL,
  "unitCost" DECIMAL(10,2) NOT NULL,
  "shippingCost" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "vendorSku" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProductVendorOffer_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ProductVendorOffer_productId_vendorId_key" ON "ProductVendorOffer"("productId", "vendorId");
CREATE INDEX IF NOT EXISTS "ProductVendorOffer_vendorId_idx" ON "ProductVendorOffer"("vendorId");
CREATE INDEX IF NOT EXISTS "ProductVendorOffer_productId_idx" ON "ProductVendorOffer"("productId");

DO $$ BEGIN
  ALTER TABLE "ProductVendorOffer"
    ADD CONSTRAINT "ProductVendorOffer_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ProductVendorOffer"
    ADD CONSTRAINT "ProductVendorOffer_vendorId_fkey"
    FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

INSERT INTO "ProductVendorOffer" ("id", "productId", "vendorId", "unitCost", "shippingCost", "createdAt", "updatedAt")
SELECT
  ('cvo' || substr(md5(p."id" || coalesce(p."vendorId", '')), 1, 22)),
  p."id",
  p."vendorId",
  p."wholesalePrice",
  0,
  NOW(),
  NOW()
FROM "Product" p
WHERE p."vendorId" IS NOT NULL AND p."wholesalePrice" IS NOT NULL
ON CONFLICT ("productId", "vendorId") DO NOTHING;
