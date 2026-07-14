/*
  Warnings:

  - You are about to drop the column `quantity` on the `Offer` table. All the data in the column will be lost.
  - You are about to alter the column `offer_price` on the `Offer` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Decimal(12,4)`.
  - You are about to drop the column `quantity` on the `Order` table. All the data in the column will be lost.
  - You are about to alter the column `unit_price` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Decimal(12,4)`.
  - You are about to alter the column `target_price` on the `PriceAlert` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Decimal(12,4)`.
  - You are about to alter the column `price` on the `PriceHistory` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Decimal(12,4)`.
  - You are about to drop the column `price_per_unit` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `pricing_unit` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `quantity_available` on the `Product` table. All the data in the column will be lost.
  - Added the required column `quantity_kg` to the `Offer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity_kg` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price_per_kg` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity_kg` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "OrgType" ADD VALUE 'ROASTER';

-- AlterTable
ALTER TABLE "Offer" DROP COLUMN "quantity",
ADD COLUMN     "quantity_kg" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "offer_price" SET DATA TYPE DECIMAL(12,4);

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "quantity",
ADD COLUMN     "quantity_kg" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "unit_price" SET DATA TYPE DECIMAL(12,4);

-- AlterTable
ALTER TABLE "PriceAlert" ALTER COLUMN "target_price" SET DATA TYPE DECIMAL(12,4);

-- AlterTable
ALTER TABLE "PriceHistory" ALTER COLUMN "price" SET DATA TYPE DECIMAL(12,4);

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "price_per_unit",
DROP COLUMN "pricing_unit",
DROP COLUMN "quantity_available",
ADD COLUMN     "container_type_id" TEXT,
ADD COLUMN     "price_per_container" DECIMAL(14,2),
ADD COLUMN     "price_per_kg" DECIMAL(12,4) NOT NULL,
ADD COLUMN     "price_per_ton" DECIMAL(12,2),
ADD COLUMN     "quantity_kg" DOUBLE PRECISION NOT NULL;

-- DropEnum
DROP TYPE "PricingUnit";

-- CreateTable
CREATE TABLE "ContainerType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacity_kg" DOUBLE PRECISION NOT NULL,
    "bag_count" INTEGER,
    "bag_weight_kg" DOUBLE PRECISION,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContainerType_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_container_type_id_fkey" FOREIGN KEY ("container_type_id") REFERENCES "ContainerType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
