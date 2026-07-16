-- Offer: insan-okunur teklif no
CREATE SEQUENCE "Offer_offer_no_seq" AS INTEGER START 1;
ALTER TABLE "Offer" ADD COLUMN "offer_no" INTEGER NOT NULL DEFAULT nextval('"Offer_offer_no_seq"');
ALTER SEQUENCE "Offer_offer_no_seq" OWNED BY "Offer"."offer_no";
CREATE UNIQUE INDEX "Offer_offer_no_key" ON "Offer"("offer_no");

-- Order: insan-okunur siparis no
CREATE SEQUENCE "Order_order_no_seq" AS INTEGER START 1;
ALTER TABLE "Order" ADD COLUMN "order_no" INTEGER NOT NULL DEFAULT nextval('"Order_order_no_seq"');
ALTER SEQUENCE "Order_order_no_seq" OWNED BY "Order"."order_no";
CREATE UNIQUE INDEX "Order_order_no_key" ON "Order"("order_no");
