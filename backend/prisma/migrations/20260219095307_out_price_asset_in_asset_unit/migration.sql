/*
  Warnings:

  - You are about to drop the column `purchasePrice` on the `assets` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "asset_units" ADD COLUMN     "purchasePrice" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "assets" DROP COLUMN "purchasePrice";
