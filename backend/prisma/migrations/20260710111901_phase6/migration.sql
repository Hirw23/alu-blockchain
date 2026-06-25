-- CreateTable
CREATE TABLE "ProductIdentity" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "verificationToken" TEXT NOT NULL,
    "qrVersion" INTEGER NOT NULL DEFAULT 1,
    "qrStatus" TEXT NOT NULL DEFAULT 'GENERATED',
    "generatedBy" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activatedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "lastScanAt" TIMESTAMP(3),
    "totalScans" INTEGER NOT NULL DEFAULT 0,
    "blockchainStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "blockchainTransactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductIdentity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QRCodeAsset" (
    "id" TEXT NOT NULL,
    "productIdentityId" TEXT NOT NULL,
    "imagePath" TEXT NOT NULL,
    "imageFormat" TEXT NOT NULL,
    "imageSize" INTEGER NOT NULL,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "printCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QRCodeAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationEvent" (
    "id" TEXT NOT NULL,
    "productIdentityId" TEXT NOT NULL,
    "verifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verificationStatus" TEXT NOT NULL,
    "country" TEXT,
    "province" TEXT,
    "district" TEXT,
    "ipHash" TEXT NOT NULL,
    "deviceType" TEXT,
    "browser" TEXT,
    "operatingSystem" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "notes" TEXT,

    CONSTRAINT "VerificationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductIdentity_verificationToken_key" ON "ProductIdentity"("verificationToken");

-- AddForeignKey
ALTER TABLE "ProductIdentity" ADD CONSTRAINT "ProductIdentity_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductIdentity" ADD CONSTRAINT "ProductIdentity_generatedBy_fkey" FOREIGN KEY ("generatedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QRCodeAsset" ADD CONSTRAINT "QRCodeAsset_productIdentityId_fkey" FOREIGN KEY ("productIdentityId") REFERENCES "ProductIdentity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationEvent" ADD CONSTRAINT "VerificationEvent_productIdentityId_fkey" FOREIGN KEY ("productIdentityId") REFERENCES "ProductIdentity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
