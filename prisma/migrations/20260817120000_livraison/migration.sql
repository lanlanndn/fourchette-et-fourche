-- Migration : ajout du suivi de livraison sur les commandes

-- Type enum pour le statut de livraison
CREATE TYPE "DeliveryStatus" AS ENUM ('NOT_SHIPPED', 'SHIPPED', 'DELIVERED');

-- Colonnes de suivi sur la table Order
ALTER TABLE "Order" ADD COLUMN "deliveryStatus" "DeliveryStatus" NOT NULL DEFAULT 'NOT_SHIPPED';
ALTER TABLE "Order" ADD COLUMN "shippingCarrier" TEXT;
ALTER TABLE "Order" ADD COLUMN "shippingTrackingNumber" TEXT;
ALTER TABLE "Order" ADD COLUMN "shippingTrackingUrl" TEXT;
ALTER TABLE "Order" ADD COLUMN "shippedAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN "deliveredAt" TIMESTAMP(3);

-- Index sur le statut de livraison
CREATE INDEX "Order_deliveryStatus_idx" ON "Order"("deliveryStatus");
