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
    "organicCertified" BOOLEAN NOT NULL DEFAULT false,
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
    "fieldId" TEXT NOT NULL,
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
    "productId" TEXT,
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

-- CreateTable
CREATE TABLE "Cart" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartItem" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "consumerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "shippingAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shipment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "distributorId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ASSIGNED',
    "currentLocation" TEXT,
    "estimatedDelivery" TIMESTAMP(3),
    "actualDelivery" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Field" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Default Field',
    "soilType" TEXT,
    "lastSoilTestAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Field_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SoilReading" (
    "id" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "N" DOUBLE PRECISION NOT NULL,
    "P" DOUBLE PRECISION NOT NULL,
    "K" DOUBLE PRECISION NOT NULL,
    "pH" DOUBLE PRECISION NOT NULL,
    "moisture" DOUBLE PRECISION NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SoilReading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeatherSnapshot" (
    "id" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL,
    "humidity" DOUBLE PRECISION NOT NULL,
    "rainfall" DOUBLE PRECISION NOT NULL,
    "source" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeatherSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CropRecommendation" (
    "id" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "inputSnapshot" JSONB NOT NULL,
    "recommendedCrop" TEXT NOT NULL,
    "alternatives" JSONB NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CropRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YieldPrediction" (
    "id" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "cropType" "CropType" NOT NULL,
    "predictedYield" DOUBLE PRECISION NOT NULL,
    "confidenceInterval" JSONB NOT NULL,
    "metadata" JSONB NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "YieldPrediction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FertilizerRecommendation" (
    "id" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "recommendedFertilizer" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "timingWindow" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FertilizerRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NDVIReading" (
    "id" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "ndviScore" DOUBLE PRECISION NOT NULL,
    "imageSource" TEXT NOT NULL,
    "stressFlag" BOOLEAN NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NDVIReading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationLog" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "scannedByUserId" TEXT,
    "geolocation" JSONB,
    "blockchainHash" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationLog_pkey" PRIMARY KEY ("id")
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
CREATE INDEX "Crop_fieldId_idx" ON "Crop"("fieldId");

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

-- CreateIndex
CREATE UNIQUE INDEX "Cart_userId_key" ON "Cart"("userId");

-- CreateIndex
CREATE INDEX "Cart_userId_idx" ON "Cart"("userId");

-- CreateIndex
CREATE INDEX "CartItem_cartId_idx" ON "CartItem"("cartId");

-- CreateIndex
CREATE INDEX "CartItem_productId_idx" ON "CartItem"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_cartId_productId_key" ON "CartItem"("cartId", "productId");

-- CreateIndex
CREATE INDEX "Order_consumerId_idx" ON "Order"("consumerId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_orderId_key" ON "Shipment"("orderId");

-- CreateIndex
CREATE INDEX "Field_farmId_idx" ON "Field"("farmId");

-- CreateIndex
CREATE UNIQUE INDEX "Field_farmId_name_key" ON "Field"("farmId", "name");

-- CreateIndex
CREATE INDEX "SoilReading_fieldId_idx" ON "SoilReading"("fieldId");

-- CreateIndex
CREATE INDEX "WeatherSnapshot_fieldId_idx" ON "WeatherSnapshot"("fieldId");

-- CreateIndex
CREATE INDEX "CropRecommendation_fieldId_idx" ON "CropRecommendation"("fieldId");

-- CreateIndex
CREATE INDEX "YieldPrediction_fieldId_idx" ON "YieldPrediction"("fieldId");

-- CreateIndex
CREATE INDEX "FertilizerRecommendation_fieldId_idx" ON "FertilizerRecommendation"("fieldId");

-- CreateIndex
CREATE INDEX "NDVIReading_fieldId_idx" ON "NDVIReading"("fieldId");

-- CreateIndex
CREATE INDEX "ChatMessage_userId_idx" ON "ChatMessage"("userId");

-- CreateIndex
CREATE INDEX "VerificationLog_productId_idx" ON "VerificationLog"("productId");

-- CreateIndex
CREATE INDEX "VerificationLog_scannedByUserId_idx" ON "VerificationLog"("scannedByUserId");

-- AddForeignKey
ALTER TABLE "Farm" ADD CONSTRAINT "Farm_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Crop" ADD CONSTRAINT "Crop_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Crop" ADD CONSTRAINT "Crop_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "Field"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_consumerId_fkey" FOREIGN KEY ("consumerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_distributorId_fkey" FOREIGN KEY ("distributorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Field" ADD CONSTRAINT "Field_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoilReading" ADD CONSTRAINT "SoilReading_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "Field"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeatherSnapshot" ADD CONSTRAINT "WeatherSnapshot_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "Field"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropRecommendation" ADD CONSTRAINT "CropRecommendation_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "Field"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YieldPrediction" ADD CONSTRAINT "YieldPrediction_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "Field"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FertilizerRecommendation" ADD CONSTRAINT "FertilizerRecommendation_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "Field"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NDVIReading" ADD CONSTRAINT "NDVIReading_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "Field"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationLog" ADD CONSTRAINT "VerificationLog_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationLog" ADD CONSTRAINT "VerificationLog_scannedByUserId_fkey" FOREIGN KEY ("scannedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
