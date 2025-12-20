/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `assets` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `assets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "assets" ADD COLUMN     "name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "assets_name_key" ON "assets"("name");
