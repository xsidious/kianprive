ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "distributionOrderId" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "distributionSyncError" TEXT;
