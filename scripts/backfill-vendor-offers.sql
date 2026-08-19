-- Safe additive backfill: copies existing product vendor costs into ProductVendorOffer.
-- Does NOT delete or modify patient/intake data.

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
