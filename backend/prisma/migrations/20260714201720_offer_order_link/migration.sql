-- AlterTable
ALTER TABLE "Offer" ADD COLUMN     "order_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Offer_order_id_key" ON "Offer"("order_id");

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
