/*
  Warnings:

  - You are about to drop the column `images` on the `assets` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "UnitStatus" ADD VALUE 'MAINTENANCE';

-- AlterTable
ALTER TABLE "asset_units" ADD COLUMN     "images" TEXT[];

-- AlterTable
ALTER TABLE "assets" DROP COLUMN "images";
