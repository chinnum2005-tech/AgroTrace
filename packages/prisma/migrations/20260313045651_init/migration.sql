-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'FARMER', 'DISTRIBUTOR', 'CONSUMER');

-- CreateEnum
CREATE TYPE "CropType" AS ENUM ('WHEAT', 'RICE', 'CORN', 'SOYBEANS', 'BARLEY', 'OATS', 'CANOLA', 'SORGHUM', 'OTHER');

-- CreateEnum
CREATE TYPE "GrowthStage" AS ENUM ('PLANTED', 'GERMINATION', 'VEGETATIVE', 'FLOWERING', 'FRUITING', 'MATURING', 'READY_FOR_HARVEST', 'HARVESTED');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('PLANTED', 'HARVESTED', 'PROCESSED', 'PACKAGED', 'SHIPPED', 'RECEIVED', 'QUALITY_CHECK', 'RETAIL', 'SOLD');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CONSUMER',
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Farm" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "location" JSONB NOT NULL,
    "size" DOUBLE PRECISION NOT NULL,
    "certification" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Farm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Crop" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CropType" NOT NULL,
    "variety" TEXT,
    "plantingDate" TIMESTAMP(3) NOT NULL,
    "expectedHarvest" TIMESTAMP(3),
    "growthStage" "GrowthStage" NOT NULL DEFAULT 'PLANTED',
    "area" DOUBLE PRECISION NOT NULL,
    "estimatedYield" DOUBLE PRECISION,
    "actualYield" DOUBLE PRECISION,
    "farmId" TEXT NOT NULL,
    "qrCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Crop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "cropId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "packagingDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "batchNumber" TEXT NOT NULL,
    "storageLocation" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIPrediction" (
    "id" TEXT NOT NULL,
    "cropId" TEXT NOT NULL,
    "predictedYield" DOUBLE PRECISION NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "factors" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIPrediction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplyChainEvent" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "eventType" "EventType" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "actorId" TEXT NOT NULL,
    "cropId" TEXT,
    "metadata" TEXT,
    "transactionHash" TEXT,
    "blockNumber" INTEGER,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupplyChainEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" JSONB,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Farm_userId_key" ON "Farm"("userId");

-- CreateIndex
CREATE INDEX "Farm_userId_idx" ON "Farm"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Crop_qrCode_key" ON "Crop"("qrCode");

-- CreateIndex
CREATE INDEX "Crop_farmId_idx" ON "Crop"("farmId");

-- CreateIndex
CREATE INDEX "Crop_type_idx" ON "Crop"("type");

-- CreateIndex
CREATE INDEX "Crop_growthStage_idx" ON "Crop"("growthStage");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- CreateIndex
CREATE INDEX "Product_cropId_idx" ON "Product"("cropId");

-- CreateIndex
CREATE INDEX "Product_sku_idx" ON "Product"("sku");

-- CreateIndex
CREATE INDEX "Product_batchNumber_idx" ON "Product"("batchNumber");

-- CreateIndex
CREATE INDEX "Product_status_idx" ON "Product"("status");

-- CreateIndex
CREATE INDEX "AIPrediction_cropId_idx" ON "AIPrediction"("cropId");

-- CreateIndex
CREATE UNIQUE INDEX "SupplyChainEvent_transactionHash_key" ON "SupplyChainEvent"("transactionHash");

-- CreateIndex
CREATE INDEX "SupplyChainEvent_productId_idx" ON "SupplyChainEvent"("productId");

-- CreateIndex
CREATE INDEX "SupplyChainEvent_eventType_idx" ON "SupplyChainEvent"("eventType");

-- CreateIndex
CREATE INDEX "SupplyChainEvent_transactionHash_idx" ON "SupplyChainEvent"("transactionHash");

-- CreateIndex
CREATE INDEX "SupplyChainEvent_cropId_idx" ON "SupplyChainEvent"("cropId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");

-- CreateIndex
CREATE INDEX "AuditLog_entity_idx" ON "AuditLog"("entity");

-- AddForeignKey
ALTER TABLE "Farm" ADD CONSTRAINT "Farm_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Crop" ADD CONSTRAINT "Crop_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIPrediction" ADD CONSTRAINT "AIPrediction_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplyChainEvent" ADD CONSTRAINT "SupplyChainEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplyChainEvent" ADD CONSTRAINT "SupplyChainEvent_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplyChainEvent" ADD CONSTRAINT "SupplyChainEvent_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
