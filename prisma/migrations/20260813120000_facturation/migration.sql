-- CreateEnum
CREATE TYPE "InvoiceType" AS ENUM ('ACHETEUR', 'VENTE', 'COMMISSION');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "tvaIntracom" TEXT;

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "tvaCents" INTEGER NOT NULL DEFAULT 550;

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "type" "InvoiceType" NOT NULL,
    "orderId" TEXT NOT NULL,
    "emitPourUserId" TEXT,
    "sequence" INTEGER NOT NULL,
    "annee" INTEGER NOT NULL,
    "montantHtCents" INTEGER NOT NULL,
    "tvaCents" INTEGER NOT NULL,
    "montantTtcCents" INTEGER NOT NULL,
    "storagePath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_numero_key" ON "Invoice"("numero");

-- CreateIndex
CREATE INDEX "Invoice_orderId_idx" ON "Invoice"("orderId");

-- CreateIndex
CREATE INDEX "Invoice_emitPourUserId_idx" ON "Invoice"("emitPourUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_type_sequence_annee_key" ON "Invoice"("type", "sequence", "annee");

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

