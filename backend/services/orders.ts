import type { Prisma } from "@prisma/client"

type OrderNumberRow = {
  nextOrderNumber: string
}

export async function generateNextOrderNumber(tx: Prisma.TransactionClient) {
  const rows = await tx.$queryRaw<OrderNumberRow[]>`
    SELECT
      'CS-' || (
        COALESCE(
          MAX(
            CASE
              WHEN "orderNumber" ~ '^CS-[0-9]+$'
              THEN SUBSTRING("orderNumber" FROM 4)::INTEGER
              ELSE NULL
            END
          ),
          1000
        ) + 1
      )::TEXT AS "nextOrderNumber"
    FROM "Order"
  `

  return rows[0]?.nextOrderNumber ?? "CS-1001"
}
