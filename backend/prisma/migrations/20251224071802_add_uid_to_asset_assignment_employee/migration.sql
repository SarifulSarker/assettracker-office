/*
  Warnings:

  - A unique constraint covering the columns `[uid]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uid]` on the table `asset_assingment_department` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uid]` on the table `asset_assingment_employee` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uid]` on the table `assets` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uid]` on the table `brand` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uid]` on the table `category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uid]` on the table `department` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uid]` on the table `designations` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uid]` on the table `employees` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uid]` on the table `vendor` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `uid` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uid` to the `asset_assingment_department` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uid` to the `asset_assingment_employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uid` to the `assets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uid` to the `brand` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uid` to the `category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uid` to the `department` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uid` to the `designations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uid` to the `employees` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uid` to the `vendor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "uid" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "asset_assingment_department" ADD COLUMN     "uid" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "asset_assingment_employee" ADD COLUMN     "uid" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "assets" ADD COLUMN     "uid" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "brand" ADD COLUMN     "uid" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "category" ADD COLUMN     "uid" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "department" ADD COLUMN     "uid" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "designations" ADD COLUMN     "uid" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "employees" ADD COLUMN     "uid" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "vendor" ADD COLUMN     "uid" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_uid_key" ON "User"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "asset_assingment_department_uid_key" ON "asset_assingment_department"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "asset_assingment_employee_uid_key" ON "asset_assingment_employee"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "assets_uid_key" ON "assets"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "brand_uid_key" ON "brand"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "category_uid_key" ON "category"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "department_uid_key" ON "department"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "designations_uid_key" ON "designations"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "employees_uid_key" ON "employees"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_uid_key" ON "vendor"("uid");
