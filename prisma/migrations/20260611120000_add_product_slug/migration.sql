ALTER TABLE "Product" ADD COLUMN "slug" TEXT;

UPDATE "Product"
SET "slug" = trim(
  both '-' from lower(regexp_replace("title", '[^a-zA-Z0-9]+', '-', 'g'))
) || '-' || right("id", 6)
WHERE "slug" IS NULL;

UPDATE "Product"
SET "slug" = 'produto-' || right("id", 8)
WHERE "slug" IS NULL OR "slug" = '';

CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
