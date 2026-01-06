/*
  Warnings:

  - Added the required column `asset_uid` to the `asset_log` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "asset_log" ADD COLUMN     "asset_uid" TEXT NOT NULL;
