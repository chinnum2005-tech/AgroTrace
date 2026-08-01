-- CreateEnum
CREATE TYPE "PredictionStatus" AS ENUM ('PENDING', 'CONFIRMED', 'FAILED');

-- CreateEnum
CREATE TYPE "TriggerSource" AS ENUM ('MANUAL', 'NDVI_FUSION');

-- CreateEnum
CREATE TYPE "PredictionType" AS ENUM ('YIELD', 'CROP');

-- AlterTable
ALTER TABLE "CropRecommendation" ADD COLUMN     "predictionHash" TEXT NOT NULL,
ADD COLUMN     "provenanceStatus" "PredictionStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "txHash" TEXT;

-- AlterTable
ALTER TABLE "YieldPrediction" ADD COLUMN     "predictionHash" TEXT NOT NULL,
ADD COLUMN     "provenanceStatus" "PredictionStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "sourceNdviReadingId" TEXT,
ADD COLUMN     "triggeredBy" "TriggerSource" NOT NULL DEFAULT 'MANUAL',
ADD COLUMN     "txHash" TEXT;

-- CreateTable
CREATE TABLE "ProvenanceRecord" (
    "id" TEXT NOT NULL,
    "predictionId" TEXT NOT NULL,
    "predictionType" "PredictionType" NOT NULL,
    "inputSnapshot" JSONB NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "txHash" TEXT,
    "blockNumber" INTEGER,
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProvenanceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProvenanceRecord_predictionId_idx" ON "ProvenanceRecord"("predictionId");

-- CreateIndex
CREATE INDEX "ProvenanceRecord_txHash_idx" ON "ProvenanceRecord"("txHash");

-- AddForeignKey
ALTER TABLE "YieldPrediction" ADD CONSTRAINT "YieldPrediction_sourceNdviReadingId_fkey" FOREIGN KEY ("sourceNdviReadingId") REFERENCES "NDVIReading"("id") ON DELETE SET NULL ON UPDATE CASCADE;
