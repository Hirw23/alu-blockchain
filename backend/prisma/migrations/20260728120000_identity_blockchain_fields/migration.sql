ALTER TABLE "ProductIdentity"
ADD COLUMN "blockchainRecordedAt" TIMESTAMP(3),
ADD COLUMN "blockchainBlockNumber" INTEGER,
ADD COLUMN "blockchainRetryCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "blockchainLastError" TEXT;
