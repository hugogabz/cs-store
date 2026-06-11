ALTER TABLE "Order" ADD COLUMN "trackingCode" TEXT;

CREATE TABLE "OrderStatusHistory" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "trackingCode" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "OrderStatusHistory_pkey" PRIMARY KEY ("id")
);

INSERT INTO "OrderStatusHistory" ("id", "orderId", "status", "createdAt")
SELECT
  'hist_' || "id",
  "id",
  CASE WHEN "status" = 'canceled' THEN 'cancelled' ELSE "status" END,
  "updatedAt"
FROM "Order";

UPDATE "Order"
SET "status" = 'cancelled'
WHERE "status" = 'canceled';

CREATE INDEX "OrderStatusHistory_orderId_idx" ON "OrderStatusHistory"("orderId");
CREATE INDEX "OrderStatusHistory_createdAt_idx" ON "OrderStatusHistory"("createdAt");

ALTER TABLE "OrderStatusHistory"
ADD CONSTRAINT "OrderStatusHistory_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
