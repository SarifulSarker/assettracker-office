/*
  Warnings:

  - You are about to drop the column `subCategoryId` on the `assets` table. All the data in the column will be lost.
  - You are about to drop the `sub_category` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name,parentId]` on the table `category` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "assets" DROP CONSTRAINT "assets_subCategoryId_fkey";

-- DropForeignKey
ALTER TABLE "sub_category" DROP CONSTRAINT "sub_category_categoryId_fkey";

-- DropIndex
DROP INDEX "category_name_key";

-- AlterTable
ALTER TABLE "assets" DROP COLUMN "subCategoryId";

-- AlterTable
ALTER TABLE "category" ADD COLUMN     "parentId" INTEGER;

-- DropTable
DROP TABLE "sub_category";

-- CreateIndex
CREATE UNIQUE INDEX "category_name_parentId_key" ON "category"("name", "parentId");

-- AddForeignKey
ALTER TABLE "category" ADD CONSTRAINT "category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
