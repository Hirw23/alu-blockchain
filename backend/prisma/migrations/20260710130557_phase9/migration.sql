-- AlterTable
ALTER TABLE "SupplyChainEvent" ADD COLUMN     "blockchainRecordedAt" TIMESTAMP(3),
ADD COLUMN     "blockchainStatus" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "blockchainTransactionId" TEXT;
