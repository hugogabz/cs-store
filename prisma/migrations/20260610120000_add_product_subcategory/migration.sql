-- Add optional product subcategory while keeping existing products compatible.
ALTER TABLE "Product" ADD COLUMN "subcategory" TEXT;

UPDATE "Product"
SET "subcategory" = "category"
WHERE "subcategory" IS NULL;
