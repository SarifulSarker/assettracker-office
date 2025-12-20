/*
  Warnings:

  - You are about to drop the column `designation` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the `asset_assingment_deparment` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[assetId,employeeId]` on the table `asset_assingment_employee` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "employees" DROP COLUMN "designation",
ADD COLUMN     "designationId" INTEGER;

-- DropTable
DROP TABLE "asset_assingment_deparment";

-- CreateTable
CREATE TABLE "designations" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "designations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_assingment_department" (
    "id" SERIAL NOT NULL,
    "assetId" INTEGER NOT NULL,
    "departmentId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asset_assingment_department_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "asset_assingment_department_assetId_departmentId_key" ON "asset_assingment_department"("assetId", "departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "asset_assingment_employee_assetId_employeeId_key" ON "asset_assingment_employee"("assetId", "employeeId");

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_designationId_fkey" FOREIGN KEY ("designationId") REFERENCES "designations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_assingment_employee" ADD CONSTRAINT "asset_assingment_employee_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_assingment_employee" ADD CONSTRAINT "asset_assingment_employee_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_assingment_department" ADD CONSTRAINT "asset_assingment_department_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_assingment_department" ADD CONSTRAINT "asset_assingment_department_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE CASCADE ON UPDATE CASCADE;
