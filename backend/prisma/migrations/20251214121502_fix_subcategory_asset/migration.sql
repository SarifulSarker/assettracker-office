-- AlterTable
ALTER TABLE "assets" ADD COLUMN     "subCategoryId" INTEGER;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
