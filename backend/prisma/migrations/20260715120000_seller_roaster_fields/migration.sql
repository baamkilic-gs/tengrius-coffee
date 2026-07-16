-- Organization: satıcı kayıt alanları
ALTER TABLE "Organization" ADD COLUMN "tax_number" TEXT;
ALTER TABLE "Organization" ADD COLUMN "tax_office" TEXT;
ALTER TABLE "Organization" ADD COLUMN "company_legal_name" TEXT;
ALTER TABLE "Organization" ADD COLUMN "website" TEXT;
ALTER TABLE "Organization" ADD COLUMN "bank_iban_try" TEXT;
ALTER TABLE "Organization" ADD COLUMN "bank_iban_usd" TEXT;
ALTER TABLE "Organization" ADD COLUMN "includes_vat" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Organization" ADD COLUMN "nationwide_shipping" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Organization" ADD COLUMN "same_day_shipping" BOOLEAN NOT NULL DEFAULT false;

-- Organization: roaster (alıcı) kayıt alanları
ALTER TABLE "Organization" ADD COLUMN "shipping_address" TEXT;
ALTER TABLE "Organization" ADD COLUMN "ship_to_billing" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Organization" ADD COLUMN "shipping_contact_name" TEXT;
ALTER TABLE "Organization" ADD COLUMN "shipping_contact_phone" TEXT;

-- Organization: zorunlu yasal onaylar
ALTER TABLE "Organization" ADD COLUMN "kvkk_accepted_at" TIMESTAMP(3);
ALTER TABLE "Organization" ADD COLUMN "security_policy_accepted_at" TIMESTAMP(3);
ALTER TABLE "Organization" ADD COLUMN "sales_agreement_accepted_at" TIMESTAMP(3);

-- Product: yeni alanlar
ALTER TABLE "Product" ADD COLUMN "description" TEXT;
ALTER TABLE "Product" ADD COLUMN "score" DOUBLE PRECISION;
ALTER TABLE "Product" ADD COLUMN "greenbro_supplied" BOOLEAN NOT NULL DEFAULT false;

-- Mevcut BUYER/BOTH organizasyonlarını enum daraltılmadan önce ROASTER'a taşı
UPDATE "Organization" SET "type" = 'ROASTER' WHERE "type" IN ('BUYER', 'BOTH');

-- OrgType enum'unu SELLER/ROASTER'a daralt
CREATE TYPE "OrgType_new" AS ENUM ('SELLER', 'ROASTER');
ALTER TABLE "Organization" ALTER COLUMN "type" TYPE "OrgType_new" USING ("type"::text::"OrgType_new");
ALTER TYPE "OrgType" RENAME TO "OrgType_old";
ALTER TYPE "OrgType_new" RENAME TO "OrgType";
DROP TYPE "OrgType_old";
