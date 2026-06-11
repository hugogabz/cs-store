import { getPrisma } from "@/backend/services/prisma"
import {
  getAvailableStock,
  releaseExpiredStockReservations,
} from "@/backend/services/stock-reservations"
import { normalizeProductImageSrc } from "@/shared/utils/images"

export type Product = {
  id: string
  title: string
  description: string | null
  category: string
  subcategory: string | null
  price: number
  image: string
  featured: boolean
  stock: number
  rating: number
  ratingCount: number
  weight: number | null
  height: number | null
  width: number | null
  length: number | null
  createdAt: Date
}

export async function getProducts(): Promise<Product[]> {
  const prisma = getPrisma()
  const now = new Date()

  await releaseExpiredStockReservations(now)

  const products = await prisma.product.findMany({
    include: {
      reservations: {
        where: {
          expiresAt: {
            gt: now,
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return products.map(({ reservations, ...product }) => {
    const reservedQuantity = reservations.reduce(
      (acc, reservation) => acc + Math.max(0, reservation.quantity),
      0
    )

    return {
      ...product,
      image: normalizeProductImageSrc(product.image),
      stock: getAvailableStock({
        stock: product.stock,
        reservedQuantity,
      }),
    }
  })
}
