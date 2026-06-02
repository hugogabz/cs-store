import { randomUUID } from "crypto"
import { NextResponse } from "next/server"
import { getPrisma } from "@/services/prisma"
import {
  getActiveReservedQuantity,
  getAvailableStock,
  releaseExpiredStockReservations,
  RESERVATION_DURATION_MS,
} from "@/services/stock-reservations"

type ReservationRequestItem = {
  productId?: unknown
  quantity?: unknown
  title?: unknown
}

function normalizeReservationQuantity(value: unknown) {
  const quantity = Number.parseInt(String(value ?? "0"), 10)

  if (!Number.isFinite(quantity)) return 0

  return Math.max(0, quantity)
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const items = body?.items

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      {
        message: "Carrinho vazio. Adicione produtos antes de reservar.",
      },
      {
        status: 400,
      }
    )
  }

  const normalizedItems = (items as ReservationRequestItem[]).map((item) => ({
    productId: typeof item.productId === "string" ? item.productId : "",
    quantity: normalizeReservationQuantity(item.quantity),
    title: typeof item.title === "string" ? item.title : "Produto",
  }))

  const invalidItem = normalizedItems.find(
    (item) => !item.productId || item.quantity <= 0
  )

  if (invalidItem) {
    return NextResponse.json(
      {
        message: "Produto inválido no carrinho. Remova e adicione novamente.",
      },
      {
        status: 400,
      }
    )
  }

  await releaseExpiredStockReservations()

  const prisma = getPrisma()
  const now = new Date()
  const expiresAt = new Date(now.getTime() + RESERVATION_DURATION_MS)
  const groupId = randomUUID()

  for (const item of normalizedItems) {
    const product = await prisma.product.findUnique({
      where: {
        id: item.productId,
      },
    })

    if (!product) {
      return NextResponse.json(
        {
          message: `${item.title} não foi encontrado no catálogo.`,
        },
        {
          status: 400,
        }
      )
    }

    const reservedQuantity = await getActiveReservedQuantity(product.id, now)
    const availableStock = getAvailableStock({
      stock: product.stock,
      reservedQuantity,
    })

    if (item.quantity > availableStock) {
      return NextResponse.json(
        {
          message: `Estoque insuficiente para ${product.title}. Disponível: ${availableStock}.`,
        },
        {
          status: 400,
        }
      )
    }
  }

  await prisma.stockReservation.createMany({
    data: normalizedItems.map((item) => ({
      groupId,
      productId: item.productId,
      quantity: item.quantity,
      expiresAt,
    })),
  })

  return NextResponse.json({
    reservationId: groupId,
    expiresAt: expiresAt.toISOString(),
    message: "Produtos reservados por 15 minutos",
  })
}
