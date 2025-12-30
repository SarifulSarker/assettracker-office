-- CreateTable
CREATE TABLE "asset_log" (
    "id" SERIAL NOT NULL,
    "asset_id" INTEGER NOT NULL,
    "context" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "issuer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asset_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "asset_log_asset_id_idx" ON "asset_log"("asset_id");

-- AddForeignKey
ALTER TABLE "asset_log" ADD CONSTRAINT "asset_log_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
