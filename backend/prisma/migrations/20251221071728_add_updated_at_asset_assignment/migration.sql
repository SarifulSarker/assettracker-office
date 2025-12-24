-- DropIndex
DROP INDEX "asset_assingment_employee_assetId_employeeId_key";

-- AlterTable
ALTER TABLE "asset_assingment_employee"
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
