-- AlterEnum
-- This migration must run outside a multi-statement transaction (Postgres restriction).
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'PROVIDER';
ALTER TYPE "PartnerType" ADD VALUE IF NOT EXISTS 'PROVIDER';
