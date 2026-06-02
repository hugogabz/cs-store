import { getPrisma } from "@/services/prisma"
import {
  getAvailableStock,
  releaseExpiredStockReservations,
} from "@/services/stock-reservations"
import { normalizeProductImageSrc } from "@/utils/images"

export type Product = {
  id: string
  title: string
  description: string | null
  category: string
  price: number
  image: string
  featured: boolean
  stock: number
  rating: number
  ratingCount: number
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
