import { NextResponse } from "next/server"
import { isAdminAuthenticated, unauthorizedResponse } from "@/backend/services/admin-auth"
import { getPrisma } from "@/backend/services/prisma"
import { releaseStockReservationGroup } from "@/backend/services/stock-reservations"
import { sendOrderStatusEmail } from "@/shared/email"
import { isAllowedOrderStatus, normalizeOrderStatus } from "@/shared/utils/order-status"

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

type OrderControlRow = {
  status: string
  reservationId: string | null
  stockDeductedAt: Date | string | null
  trackingCode: string | null
}

function normalizeText(value: unknown) {
  return String(value ?? "").trim()
}

function createManualTestPaymentId(orderId: string) {
  return `manual-test-${orderId.slice(-8)}-${Date.now()}`
}

async function sendOrderEmailIfStatusChanged({
  order,
  statusChanged,
}: {
  order: NonNullable<Awaited<ReturnType<typeof getOrderWithItems>>>
  statusChanged: boolean
}) {
  if (!statusChanged) {
    return {
      attempted: false,
      sent: false,
      skipped: true,
      message: "Status sem alteração. E-mail não enviado.",
    }
  }

  return sendOrderStatusEmail(order).catch((error) => ({
    attempted: true,
    sent: false,
    skipped: false,
    message: error instanceof Error
      ? `Status atualizado, mas o e-mail nao pode ser enviado: ${error.message}`
      : "Status atualizado, mas o e-mail nao pode ser enviado.",
    errorMessage: error instanceof Error ? error.message : undefined,
  }))
}

async function releaseReservationIfPossible(reservationId: string | null) {
  if (!reservationId) return 0

  return releaseStockReservationGroup(reservationId)
}

async function getOrderWithItems(id: string) {
  const prisma = getPrisma()

  return prisma.order.findUnique({
    where: {
      id,
    },
    include: {
      items: true,
      statusHistory: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  })
}

async function markOrderAsPaidForTest(id: string) {
  const prisma = getPrisma()
  let reservationId: string | null = null

  const result = await prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<OrderControlRow[]>`
      SELECT "status", "reservationId", "stockDeductedAt"
      FROM "Order"
      WHERE "id" = ${id}
      LIMIT 1
    `

    const order = rows[0]

    if (!order) {
      throw new Error("ORDER_NOT_FOUND")
    }

    reservationId = order.reservationId
    const shouldDeductStock = order.status !== "paid" && !order.stockDeductedAt

    if (shouldDeductStock) {
      const items = await tx.orderItem.findMany({
        where: {
          orderId: id,
        },
      })

      for (const item of items) {
        if (!item.productId) continue

        const quantity = Math.max(1, item.quantity)
        const updated = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: {
              gte: quantity,
            },
          },
          data: {
            stock: {
              decrement: quantity,
            },
          },
        })

        if (updated.count === 0) {
          throw new Error(`Estoque insuficiente para ${item.title}.`)
        }
      }
    }

    const now = new Date()
    const paymentId = createManualTestPaymentId(id)

    if (shouldDeductStock) {
      await tx.$executeRaw`
        UPDATE "Order"
        SET
          "status" = 'paid',
          "paymentProvider" = COALESCE(NULLIF("paymentProvider", ''), 'manual-test'),
          "paymentId" = COALESCE(NULLIF("paymentId", ''), ${paymentId}),
          "stockDeductedAt" = ${now},
          "updatedAt" = ${now}
        WHERE "id" = ${id}
      `
    } else {
      await tx.$executeRaw`
        UPDATE "Order"
        SET
          "status" = 'paid',
          "paymentProvider" = COALESCE(NULLIF("paymentProvider", ''), 'manual-test'),
          "paymentId" = COALESCE(NULLIF("paymentId", ''), ${paymentId}),
          "updatedAt" = ${now}
        WHERE "id" = ${id}
      `
    }

    if (order.status !== "paid") {
      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          status: "paid",
        },
      })
    }

    return {
      deductedStock: shouldDeductStock,
      statusChanged: order.status !== "paid",
    }
  })

  const releasedReservations = await releaseReservationIfPossible(reservationId)
  const order = await getOrderWithItems(id)

  if (!order) {
    throw new Error("ORDER_NOT_FOUND")
  }

  return {
    order,
    deductedStock: result.deductedStock,
    releasedReservations,
    statusChanged: result.statusChanged,
  }
}

async function markOrderAsCanceled(id: string) {
  const prisma = getPrisma()
  let reservationId: string | null = null

  let statusChanged = false

  await prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<OrderControlRow[]>`
      SELECT "status", "reservationId", "stockDeductedAt", "trackingCode"
      FROM "Order"
      WHERE "id" = ${id}
      LIMIT 1
    `

    const order = rows[0]

    if (!order) {
      throw new Error("ORDER_NOT_FOUND")
    }

    reservationId = order.reservationId
    statusChanged = order.status !== "cancelled"
    const now = new Date()

    await tx.$executeRaw`
      UPDATE "Order"
      SET
        "status" = 'cancelled',
        "updatedAt" = ${now}
      WHERE "id" = ${id}
    `

    if (statusChanged) {
      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          status: "cancelled",
          trackingCode: order.trackingCode,
        },
      })
    }
  })

  const releasedReservations = await releaseReservationIfPossible(reservationId)
  const order = await getOrderWithItems(id)

  if (!order) {
    throw new Error("ORDER_NOT_FOUND")
  }

  return {
    order,
    releasedReservations,
    statusChanged,
  }
}

export async function GET(_request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return unauthorizedResponse()
  }

  const { id } = await context.params
  const prisma = getPrisma()
  const order = await prisma.order.findUnique({
    where: {
      id,
    },
    include: {
      items: true,
      statusHistory: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  })

  if (!order) {
    return NextResponse.json(
      {
        message: "Pedido não encontrado.",
      },
      {
        status: 404,
      }
    )
  }

  return NextResponse.json(order)
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return unauthorizedResponse()
  }

  const { id } = await context.params
  const body = await request.json().catch(() => null)
  const action = String(body?.action ?? "")
  const status = normalizeOrderStatus(normalizeText(body?.status))
  const trackingCode = normalizeText(body?.trackingCode)

  if (action === "mark-paid-test") {
    try {
      const result = await markOrderAsPaidForTest(id)
      const email = await sendOrderEmailIfStatusChanged({
        order: result.order,
        statusChanged: result.statusChanged,
      })

      return NextResponse.json({
        ...result.order,
        deductedStock: result.deductedStock,
        releasedReservations: result.releasedReservations,
        email,
      })
    } catch (error) {
      if (error instanceof Error && error.message === "ORDER_NOT_FOUND") {
        return NextResponse.json(
          {
            message: "Pedido nÃ£o encontrado.",
          },
          {
            status: 404,
          }
        )
      }

      return NextResponse.json(
        {
          message: error instanceof Error
            ? error.message
            : "NÃ£o foi possÃ­vel marcar o pedido como pago.",
        },
        {
          status: 400,
        }
      )
    }
  }

  if (action === "mark-canceled-test") {
    try {
      const result = await markOrderAsCanceled(id)
      const email = await sendOrderEmailIfStatusChanged({
        order: result.order,
        statusChanged: result.statusChanged,
      })

      return NextResponse.json({
        ...result.order,
        releasedReservations: result.releasedReservations,
        email,
      })
    } catch (error) {
      if (error instanceof Error && error.message === "ORDER_NOT_FOUND") {
        return NextResponse.json(
          {
            message: "Pedido nÃ£o encontrado.",
          },
          {
            status: 404,
          }
        )
      }

      return NextResponse.json(
        {
          message: error instanceof Error
            ? error.message
            : "NÃ£o foi possÃ­vel cancelar o pedido.",
        },
        {
          status: 400,
        }
      )
    }
  }

  if (!isAllowedOrderStatus(status)) {
    return NextResponse.json(
      {
        message: "Status de pedido inválido.",
      },
      {
        status: 400,
      }
    )
  }

  const prisma = getPrisma()
  const result = await prisma.$transaction(async (tx) => {
    const existingOrder = await tx.order.findUnique({
      where: {
        id,
      },
      select: {
        status: true,
        trackingCode: true,
      },
    })

    if (!existingOrder) {
      return null
    }

    const nextTrackingCode = status === "shipped"
      ? trackingCode || existingOrder.trackingCode
      : trackingCode || existingOrder.trackingCode

    const updatedOrder = await tx.order.update({
      where: {
        id,
      },
      data: {
        status,
        trackingCode: nextTrackingCode || null,
      },
      include: {
        items: true,
        statusHistory: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })

    if (
      existingOrder.status !== status ||
      (existingOrder.trackingCode ?? "") !== (nextTrackingCode ?? "")
    ) {
      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          status,
          trackingCode: nextTrackingCode || null,
        },
      })
    }

    return {
      order: updatedOrder,
      statusChanged: existingOrder.status !== status,
    }
  }).catch(() => null)

  if (!result?.order) {
    return NextResponse.json(
      {
        message: "Pedido não encontrado.",
      },
      {
        status: 404,
      }
    )
  }

  const email = await sendOrderEmailIfStatusChanged({
    order: result.order,
    statusChanged: result.statusChanged,
  })

  return NextResponse.json({
    ...result.order,
    email,
  })
}
