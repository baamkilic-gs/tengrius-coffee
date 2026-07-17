-- MembershipTier: STANDARD (ücretsiz) ile PREMIUM arasına ara kademe olarak BASIC eklendi
ALTER TYPE "MembershipTier" ADD VALUE 'BASIC' AFTER 'STANDARD';

-- Favori İlanlar
CREATE TABLE "ProductFavorite" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductFavorite_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProductFavorite_organization_id_product_id_key" ON "ProductFavorite"("organization_id", "product_id");

ALTER TABLE "ProductFavorite" ADD CONSTRAINT "ProductFavorite_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ProductFavorite" ADD CONSTRAINT "ProductFavorite_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
