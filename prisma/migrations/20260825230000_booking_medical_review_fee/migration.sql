-- AlterTable
ALTER TABLE "BookingRequest" ADD COLUMN "medicalReviewPaidAt" TIMESTAMP(3);
ALTER TABLE "BookingRequest" ADD COLUMN "medicalReviewTransId" TEXT;
ALTER TABLE "BookingRequest" ADD COLUMN "medicalReviewAmount" DECIMAL(10,2);
