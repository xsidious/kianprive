-- Additive only: order messaging for members ↔ admin.
-- Safe for live: creates new enum/table/indexes. Does NOT drop or truncate data.

DO $$ BEGIN
  CREATE TYPE "OrderMessageAuthor" AS ENUM ('CUSTOMER', 'ADMIN', 'SYSTEM');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "OrderMessage" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "authorRole" "OrderMessageAuthor" NOT NULL,
    "authorUserId" TEXT,
    "authorName" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderMessage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "OrderMessage_orderId_createdAt_idx" ON "OrderMessage"("orderId", "createdAt");
CREATE INDEX IF NOT EXISTS "Order_userId_createdAt_idx" ON "Order"("userId", "createdAt");

DO $$ BEGIN
  ALTER TABLE "OrderMessage" ADD CONSTRAINT "OrderMessage_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
