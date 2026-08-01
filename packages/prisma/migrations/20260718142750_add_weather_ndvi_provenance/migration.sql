-- AlterTable
ALTER TABLE "NDVIReading" ADD COLUMN     "cloudCoverPercent" DOUBLE PRECISION,
ADD COLUMN     "imageDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "provider" TEXT NOT NULL DEFAULT 'sentinel-2';

-- AlterTable
ALTER TABLE "WeatherSnapshot" ADD COLUMN     "isForecast" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "WeatherSyncJob" (
    "id" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "requestedRange" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "WeatherSyncJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WeatherSyncJob_fieldId_idx" ON "WeatherSyncJob"("fieldId");

-- AddForeignKey
ALTER TABLE "WeatherSyncJob" ADD CONSTRAINT "WeatherSyncJob_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "Field"("id") ON DELETE CASCADE ON UPDATE CASCADE;
