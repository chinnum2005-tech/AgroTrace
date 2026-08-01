-- AlterTable
ALTER TABLE "Crop" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Shipment" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;
