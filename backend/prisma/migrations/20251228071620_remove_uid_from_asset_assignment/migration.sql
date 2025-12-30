/*
  Warnings:

  - You are about to drop the column `uid` on the `asset_assingment_department` table. All the data in the column will be lost.
  - You are about to drop the column `uid` on the `asset_assingment_employee` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "asset_assingment_department_uid_key";

-- DropIndex
DROP INDEX "asset_assingment_employee_uid_key";

-- AlterTable
ALTER TABLE "asset_assingment_department" DROP COLUMN "uid";

-- AlterTable
ALTER TABLE "asset_assingment_employee" DROP COLUMN "uid";
