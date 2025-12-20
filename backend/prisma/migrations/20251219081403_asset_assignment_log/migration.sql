/*
  Warnings:

  - You are about to drop the column `createdAt` on the `asset_assingment_employee` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `asset_assingment_employee` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "asset_assingment_employee" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "unassignedAt" TIMESTAMP(3);
