/*
  Warnings:

  - The primary key for the `asset_assingment_deparment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `asset_assingment_deparment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `asset_assingment_employee` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `asset_assingment_employee` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `assets` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `assets` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `brandId` column on the `assets` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `categoryId` column on the `assets` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `subCategoryId` column on the `assets` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `vendorId` column on the `assets` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `brand` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `brand` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `category` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `category` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `department` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `department` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `employees` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `employees` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `departmentId` column on the `employees` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `sub_category` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `sub_category` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `vendor` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `vendor` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `assetId` on the `asset_assingment_deparment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `departmentId` on the `asset_assingment_deparment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `assetId` on the `asset_assingment_employee` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `employeeId` on the `asset_assingment_employee` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `categoryId` on the `sub_category` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "assets" DROP CONSTRAINT "assets_brandId_fkey";

-- DropForeignKey
ALTER TABLE "assets" DROP CONSTRAINT "assets_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "assets" DROP CONSTRAINT "assets_subCategoryId_fkey";

-- DropForeignKey
ALTER TABLE "assets" DROP CONSTRAINT "assets_vendorId_fkey";

-- DropForeignKey
ALTER TABLE "employees" DROP CONSTRAINT "employees_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "sub_category" DROP CONSTRAINT "sub_category_categoryId_fkey";

-- AlterTable
ALTER TABLE "asset_assingment_deparment" DROP CONSTRAINT "asset_assingment_deparment_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "assetId",
ADD COLUMN     "assetId" INTEGER NOT NULL,
DROP COLUMN "departmentId",
ADD COLUMN     "departmentId" INTEGER NOT NULL,
ADD CONSTRAINT "asset_assingment_deparment_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "asset_assingment_employee" DROP CONSTRAINT "asset_assingment_employee_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "assetId",
ADD COLUMN     "assetId" INTEGER NOT NULL,
DROP COLUMN "employeeId",
ADD COLUMN     "employeeId" INTEGER NOT NULL,
ADD CONSTRAINT "asset_assingment_employee_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "assets" DROP CONSTRAINT "assets_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "brandId",
ADD COLUMN     "brandId" INTEGER,
DROP COLUMN "categoryId",
ADD COLUMN     "categoryId" INTEGER,
DROP COLUMN "subCategoryId",
ADD COLUMN     "subCategoryId" INTEGER,
DROP COLUMN "vendorId",
ADD COLUMN     "vendorId" INTEGER,
ADD CONSTRAINT "assets_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "brand" DROP CONSTRAINT "brand_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "brand_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "category" DROP CONSTRAINT "category_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "category_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "department" DROP CONSTRAINT "department_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "department_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "employees" DROP CONSTRAINT "employees_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "departmentId",
ADD COLUMN     "departmentId" INTEGER,
ADD CONSTRAINT "employees_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "sub_category" DROP CONSTRAINT "sub_category_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "categoryId",
ADD COLUMN     "categoryId" INTEGER NOT NULL,
ADD CONSTRAINT "sub_category_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "vendor" DROP CONSTRAINT "vendor_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "vendor_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "sub_category_name_categoryId_key" ON "sub_category"("name", "categoryId");

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_category" ADD CONSTRAINT "sub_category_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "sub_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
