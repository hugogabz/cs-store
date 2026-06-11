ALTER TABLE "Order" ADD COLUMN "orderNumber" TEXT;

WITH numbered_orders AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (ORDER BY "createdAt", "id") + 1000 AS sequence_number
  FROM "Order"
)
UPDATE "Order"
SET "orderNumber" = 'CS-' || numbered_orders.sequence_number::TEXT
FROM numbered_orders
WHERE "Order"."id" = numbered_orders."id";

ALTER TABLE "Order" ALTER COLUMN "orderNumber" SET NOT NULL;

CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
