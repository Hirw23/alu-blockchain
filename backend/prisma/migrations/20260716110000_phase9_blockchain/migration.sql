ALTER TABLE "Product"
ADD COLUMN "blockchainStatus" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN "blockchainTransactionId" TEXT,
ADD COLUMN "blockchainRecordedAt" TIMESTAMP(3),
ADD COLUMN "blockchainBlockNumber" INTEGER,
ADD COLUMN "blockchainRetryCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "blockchainLastError" TEXT;

ALTER TABLE "SupplyChainEvent"
ADD COLUMN "blockchainBlockNumber" INTEGER,
ADD COLUMN "blockchainRetryCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "blockchainLastError" TEXT;
