/*
  Warnings:

  - Added the required column `assetUnitId` to the `asset_assingment_employee` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UnitStatus" AS ENUM ('IN_STOCK', 'IN_USE', 'SOLD', 'DAMAGED', 'LOST');

-- AlterTable
ALTER TABLE "asset_assingment_employee" ADD COLUMN     "assetUnitId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "assets" ADD COLUMN     "units" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "asset_units" (
    "id" SERIAL NOT NULL,
    "assetId" INTEGER NOT NULL,
    "productId" TEXT NOT NULL,
    "status" "UnitStatus" NOT NULL DEFAULT 'IN_STOCK',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asset_units_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "asset_units_productId_key" ON "asset_units"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "asset_units_id_assetId_key" ON "asset_units"("id", "assetId");

-- AddForeignKey
ALTER TABLE "asset_units" ADD CONSTRAINT "asset_units_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_assingment_employee" ADD CONSTRAINT "asset_assingment_employee_assetUnitId_assetId_fkey" FOREIGN KEY ("assetUnitId", "assetId") REFERENCES "asset_units"("id", "assetId") ON DELETE RESTRICT ON UPDATE CASCADE;
