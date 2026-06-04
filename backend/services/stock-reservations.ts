import { getPrisma } from "@/backend/services/prisma"

export const RESERVATION_DURATION_MS = 15 * 60 * 1000

export async function releaseExpiredStockReservations(now = new Date()) {
  const prisma = getPrisma()

  const result = await prisma.stockReservation.deleteMany({
    where: {
      expiresAt: {
        lt: now,
      },
    },
  })

  return result.count
}

export async function releaseStockReservationGroup(groupId: string) {
  const prisma = getPrisma()

  const result = await prisma.stockReservation.deleteMany({
    where: {
      groupId,
    },
  })

  return result.count
}

export async function getActiveReservedQuantity(productId: string, now = new Date()) {
  const prisma = getPrisma()

  const reservationTotals = await prisma.stockReservation.aggregate({
    _sum: {
      quantity: true,
    },
    where: {
      productId,
      expiresAt: {
        gt: now,
      },
    },
  })

  return reservationTotals._sum.quantity ?? 0
}

export function getAvailableStock({
  stock,
  reservedQuantity,
}: {
  stock: number
  reservedQuantity: number
}) {
  return Math.max(0, stock - reservedQuantity)
}
