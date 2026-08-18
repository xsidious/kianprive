-- CreateEnum
CREATE TYPE "TherapyBillingInterval" AS ENUM ('ONE_TIME', 'WEEKLY', 'EVERY_2_WEEKS', 'EVERY_4_WEEKS', 'MONTHLY', 'EVERY_6_WEEKS', 'EVERY_8_WEEKS', 'CUSTOM');

-- CreateEnum
CREATE TYPE "TherapySubscriptionStatus" AS ENUM ('PENDING', 'ACTIVE', 'PAUSED', 'PAST_DUE', 'CANCELED');

-- AlterTable
ALTER TABLE "IntakeTherapyProposal" ADD COLUMN "billingInterval" "TherapyBillingInterval" NOT NULL DEFAULT 'ONE_TIME';
ALTER TABLE "IntakeTherapyProposal" ADD COLUMN "intervalDays" INTEGER;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "therapySubscriptionId" TEXT;

-- CreateTable
CREATE TABLE "TherapySubscription" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "intakeSubmissionId" TEXT NOT NULL,
    "status" "TherapySubscriptionStatus" NOT NULL DEFAULT 'PENDING',
    "interval" "TherapyBillingInterval" NOT NULL,
    "intervalDays" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "email" TEXT,
    "nextChargeAt" TIMESTAMP(3),
    "lastChargedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "customerProfileId" TEXT,
    "paymentProfileId" TEXT,
    "cardLast4" TEXT,
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TherapySubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TherapySubscription_proposalId_key" ON "TherapySubscription"("proposalId");

-- CreateIndex
CREATE INDEX "TherapySubscription_status_nextChargeAt_idx" ON "TherapySubscription"("status", "nextChargeAt");

-- CreateIndex
CREATE INDEX "TherapySubscription_intakeSubmissionId_idx" ON "TherapySubscription"("intakeSubmissionId");

-- CreateIndex
CREATE INDEX "Order_therapySubscriptionId_idx" ON "Order"("therapySubscriptionId");

-- AddForeignKey
ALTER TABLE "TherapySubscription" ADD CONSTRAINT "TherapySubscription_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "IntakeTherapyProposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TherapySubscription" ADD CONSTRAINT "TherapySubscription_intakeSubmissionId_fkey" FOREIGN KEY ("intakeSubmissionId") REFERENCES "TherapeuticsIntakeSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_therapySubscriptionId_fkey" FOREIGN KEY ("therapySubscriptionId") REFERENCES "TherapySubscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
