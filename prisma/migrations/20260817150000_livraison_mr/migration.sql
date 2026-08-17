-- Livraison « comme Vinted » via Mondial Relay
-- - Listing.poidsGrammes : poids d'une unité vendue (frais de port)
-- - Order : adresse de livraison, frais de port, méthode, bordereau
-- IF NOT EXISTS : la migration est ré-exécutable sans risque
-- (première application partielle le 17 août 2026 : colonnes créées,
-- enregistrement _prisma_migrations refusé — nom trop long, corrigé).
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "poidsGrammes" INTEGER NOT NULL DEFAULT 1000;

ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "bordereauNumeroExpedition" TEXT,
ADD COLUMN IF NOT EXISTS "bordereauPath" TEXT,
ADD COLUMN IF NOT EXISTS "shippingAddressCP" TEXT,
ADD COLUMN IF NOT EXISTS "shippingAddressLigne1" TEXT,
ADD COLUMN IF NOT EXISTS "shippingAddressLigne2" TEXT,
ADD COLUMN IF NOT EXISTS "shippingAddressNom" TEXT,
ADD COLUMN IF NOT EXISTS "shippingAddressPays" TEXT,
ADD COLUMN IF NOT EXISTS "shippingAddressTel" TEXT,
ADD COLUMN IF NOT EXISTS "shippingAddressVille" TEXT,
ADD COLUMN IF NOT EXISTS "shippingMethod" TEXT NOT NULL DEFAULT 'DOMICILE',
ADD COLUMN IF NOT EXISTS "shippingPriceCents" INTEGER NOT NULL DEFAULT 0;
