-- Clinical catalog + intake therapy proposals (additive / idempotent)
DO $$ BEGIN
  CREATE TYPE "ProductCatalogKind" AS ENUM ('RETAIL', 'CLINICAL');
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
  CREATE TYPE "IntakeTherapyProposalStatus" AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'DECLINED', 'PAID');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "Product"
  ADD COLUMN IF NOT EXISTS "subcategory" TEXT,
  ADD COLUMN IF NOT EXISTS "catalogKind" "ProductCatalogKind" NOT NULL DEFAULT 'RETAIL',
  ADD COLUMN IF NOT EXISTS "externalId" TEXT,
  ADD COLUMN IF NOT EXISTS "wholesalePrice" DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS "form" TEXT,
  ADD COLUMN IF NOT EXISTS "strength" TEXT,
  ADD COLUMN IF NOT EXISTS "deliveryMethod" TEXT,
  ADD COLUMN IF NOT EXISTS "source" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "Product_externalId_key" ON "Product"("externalId");
CREATE INDEX IF NOT EXISTS "Product_catalogKind_status_category_idx" ON "Product"("catalogKind", "status", "category");

ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "authorizeNetTransId" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "Order_authorizeNetTransId_key" ON "Order"("authorizeNetTransId");

CREATE TABLE IF NOT EXISTS "IntakeTherapyProposal" (
  "id" TEXT NOT NULL,
  "intakeSubmissionId" TEXT NOT NULL,
  "providerPartnerId" TEXT NOT NULL,
  "orderId" TEXT,
  "status" "IntakeTherapyProposalStatus" NOT NULL DEFAULT 'DRAFT',
  "notes" TEXT,
  "sentAt" TIMESTAMP(3),
  "paidAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "IntakeTherapyProposal_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "IntakeTherapyProposal_orderId_key" ON "IntakeTherapyProposal"("orderId");
CREATE INDEX IF NOT EXISTS "IntakeTherapyProposal_intakeSubmissionId_status_idx" ON "IntakeTherapyProposal"("intakeSubmissionId", "status");
CREATE INDEX IF NOT EXISTS "IntakeTherapyProposal_providerPartnerId_createdAt_idx" ON "IntakeTherapyProposal"("providerPartnerId", "createdAt");

CREATE TABLE IF NOT EXISTS "IntakeTherapyItem" (
  "id" TEXT NOT NULL,
  "proposalId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "titleSnapshot" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "IntakeTherapyItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IntakeTherapyItem_proposalId_idx" ON "IntakeTherapyItem"("proposalId");
CREATE UNIQUE INDEX IF NOT EXISTS "IntakeTherapyItem_proposalId_productId_key" ON "IntakeTherapyItem"("proposalId", "productId");

DO $$ BEGIN
  ALTER TABLE "IntakeTherapyProposal"
    ADD CONSTRAINT "IntakeTherapyProposal_intakeSubmissionId_fkey"
    FOREIGN KEY ("intakeSubmissionId") REFERENCES "TherapeuticsIntakeSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "IntakeTherapyProposal"
    ADD CONSTRAINT "IntakeTherapyProposal_providerPartnerId_fkey"
    FOREIGN KEY ("providerPartnerId") REFERENCES "PartnerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "IntakeTherapyProposal"
    ADD CONSTRAINT "IntakeTherapyProposal_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "IntakeTherapyItem"
    ADD CONSTRAINT "IntakeTherapyItem_proposalId_fkey"
    FOREIGN KEY ("proposalId") REFERENCES "IntakeTherapyProposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "IntakeTherapyItem"
    ADD CONSTRAINT "IntakeTherapyItem_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
