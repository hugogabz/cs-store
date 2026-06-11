import { NextResponse } from "next/server"
import type { Prisma, PrismaClient } from "@prisma/client"
import { getPrisma } from "@/backend/services/prisma"
import { releaseStockReservationGroup } from "@/backend/services/stock-reservations"
import { sendOrderStatusEmail } from "@/shared/email"
import { normalizeOrderStatus } from "@/shared/utils/order-status"

type InfinitePayCheckResponse = {
  paid?: boolean
  status?: string
  canceled?: boolean
  cancelled?: boolean
  success?: boolean
  approved?: boolean
}

type OrderMatchRow = {
  id: string
}

type OrderControlRow = {
  id: string
  status: string
  paymentId: string | null
  paymentUrl: string | null
  receiptUrl: string | null
  captureMethod: string | null
  reservationId: string | null
  stockDeductedAt: Date | string | null
}

function normalizeText(value: unknown) {
  return String(value ?? "").trim()
}

function logPaymentCheck(message: string, data?: unknown) {
  if (process.env.NODE_ENV === "production") return

  console.info(`[payment/check] ${message}`, data ?? "")
}

function normalizePaymentStatus(data: InfinitePayCheckResponse | null) {
  if (!data) return "pending"
  if (data.paid || data.success || data.approved) return "paid"
  if (data.cancelled || data.canceled) return "cancelled"

  const status = String(data.status ?? "").toLowerCase()

  if (["paid", "approved", "completed", "success"].includes(status)) {
    return "paid"
  }

  if (["cancelled", "canceled", "cancelado", "failed", "error"].includes(status)) {
    return "cancelled"
  }

  return "pending"
}

async function checkInfinitePayPayment({
  handle,
  orderNsu,
  slug,
}: {
  handle: string
  orderNsu: string
  slug: string
}) {
  const response = await fetch(
    "https://api.checkout.infinitepay.io/payment_check",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        handle,
        order_nsu: orderNsu,
        slug,
      }),
    }
  ).catch((error) => {
    logPaymentCheck("InfinitePay request failed", error)
    return null
  })

  if (!response || !response.ok) {
    logPaymentCheck("InfinitePay did not confirm payment", {
      status: response?.status,
    })
    return null
  }

  return (await response.json().catch(() => null)) as
    | InfinitePayCheckResponse
    | null
}

async function findOrderId({
  orderNsu,
  slug,
  transactionId,
  transactionNsu,
}: {
  orderNsu: string
  slug: string
  transactionId: string
  transactionNsu: string
}) {
  const prisma = getPrisma()

  if (orderNsu) {
    const directMatch = await prisma.$queryRaw<OrderMatchRow[]>`
      SELECT "id"
      FROM "Order"
      WHERE "id" = ${orderNsu}
      LIMIT 1
    `

    if (directMatch[0]?.id) return directMatch[0].id
  }

  const identifiers = [orderNsu, slug, transactionId, transactionNsu].filter(Boolean)

  for (const identifier of identifiers) {
    const matches = await prisma.$queryRaw<OrderMatchRow[]>`
      SELECT "id"
      FROM "Order"
      WHERE
        "paymentId" = ${identifier}
        OR "paymentUrl" LIKE ${`%${identifier}%`}
      ORDER BY "createdAt" DESC
      LIMIT 1
    `

    if (matches[0]?.id) return matches[0].id
  }

  return ""
}

async function getOrderControl(
  id: string,
  tx: PrismaClient | Prisma.TransactionClient = getPrisma()
) {
  const rows = await tx.$queryRaw<OrderControlRow[]>`
    SELECT
      "id",
      "status",
      "paymentId",
      "paymentUrl",
      "receiptUrl",
      "captureMethod",
      "reservationId",
      "stockDeductedAt"
    FROM "Order"
    WHERE "id" = ${id}
    LIMIT 1
  `

  return rows[0] ?? null
}

async function getOrderWithItems(id: string) {
  const prisma = getPrisma()

  return prisma.order.findUnique({
    where: {
      id,
    },
    include: {
      items: true,
    },
  })
}

async function sendOrderEmailIfStatusChanged({
  orderId,
  statusChanged,
}: {
  orderId: string
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

  const order = await getOrderWithItems(orderId)

  if (!order) {
    return {
      attempted: false,
      sent: false,
      skipped: true,
      message: "Pedido não encontrado para envio de e-mail.",
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

async function markOrderAsPaidFromInfinitePay({
  orderId,
  paymentId,
  receiptUrl,
  captureMethod,
}: {
  orderId: string
  paymentId: string
  receiptUrl: string
  captureMethod: string
}) {
  const prisma = getPrisma()
  let reservationId: string | null = null

  const result = await prisma.$transaction(async (tx) => {
    const order = await getOrderControl(orderId, tx)

    if (!order) {
      throw new Error("ORDER_NOT_FOUND")
    }

    reservationId = order.reservationId
    const shouldDeductStock = order.status !== "paid" && !order.stockDeductedAt

    logPaymentCheck("order status before paid update", {
      orderId,
      status: order.status,
      stockDeductedAt: order.stockDeductedAt,
      shouldDeductStock,
    })

    if (shouldDeductStock) {
      const items = await tx.orderItem.findMany({
        where: {
          orderId,
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

    const nextStatus = "paid"

    if (shouldDeductStock) {
      await tx.$executeRaw`
        UPDATE "Order"
        SET
          "status" = 'paid',
          "paymentProvider" = 'infinitepay',
          "paymentId" = COALESCE(NULLIF(${paymentId}, ''), "paymentId"),
          "receiptUrl" = COALESCE(NULLIF(${receiptUrl}, ''), "receiptUrl"),
          "captureMethod" = COALESCE(NULLIF(${captureMethod}, ''), "captureMethod"),
          "stockDeductedAt" = ${now},
          "updatedAt" = ${now}
        WHERE "id" = ${orderId}
      `
    } else {
      await tx.$executeRaw`
        UPDATE "Order"
        SET
          "status" = 'paid',
          "paymentProvider" = 'infinitepay',
          "paymentId" = COALESCE(NULLIF(${paymentId}, ''), "paymentId"),
          "receiptUrl" = COALESCE(NULLIF(${receiptUrl}, ''), "receiptUrl"),
          "captureMethod" = COALESCE(NULLIF(${captureMethod}, ''), "captureMethod"),
          "updatedAt" = ${now}
        WHERE "id" = ${orderId}
      `
    }

    if (order.status !== nextStatus) {
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: nextStatus,
        },
      })
    }

    return {
      deductedStock: shouldDeductStock,
      statusChanged: order.status !== nextStatus,
    }
  })

  const releasedReservations = reservationId
    ? await releaseStockReservationGroup(reservationId)
    : 0
  const order = await getOrderControl(orderId)

  logPaymentCheck("order status after paid update", {
    orderId,
    status: order?.status,
    deductedStock: result.deductedStock,
    releasedReservations,
  })

  return {
    order,
    deductedStock: result.deductedStock,
    releasedReservations,
    statusChanged: result.statusChanged,
  }
}

async function updateOrderAsPendingOrFailed({
  orderId,
  status,
  paymentId,
  receiptUrl,
  captureMethod,
}: {
  orderId: string
  status: "pending" | "cancelled"
  paymentId: string
  receiptUrl: string
  captureMethod: string
}) {
  const prisma = getPrisma()
  const now = new Date()
  const existingOrder = await getOrderControl(orderId)
  const normalizedCurrentStatus = existingOrder
    ? normalizeOrderStatus(existingOrder.status)
    : ""
  const statusChanged = Boolean(
    existingOrder &&
    normalizedCurrentStatus !== status &&
    normalizedCurrentStatus !== "paid"
  )

  await prisma.$executeRaw`
    UPDATE "Order"
    SET
      "status" = CASE WHEN "status" = 'paid' THEN "status" ELSE ${status} END,
      "paymentProvider" = COALESCE(NULLIF("paymentProvider", ''), 'infinitepay'),
      "paymentId" = COALESCE(NULLIF(${paymentId}, ''), "paymentId"),
      "receiptUrl" = COALESCE(NULLIF(${receiptUrl}, ''), "receiptUrl"),
      "captureMethod" = COALESCE(NULLIF(${captureMethod}, ''), "captureMethod"),
      "updatedAt" = ${now}
    WHERE "id" = ${orderId}
  `

  const updatedOrder = await getOrderControl(orderId)

  if (updatedOrder && statusChanged) {
    await prisma.orderStatusHistory.create({
      data: {
        orderId,
        status,
      },
    })
  }

  const email = await sendOrderEmailIfStatusChanged({
    orderId,
    statusChanged,
  })

  return {
    order: updatedOrder,
    email,
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const orderNsu = normalizeText(body?.orderNsu ?? body?.order_nsu ?? body?.orderId)
  const slug = normalizeText(body?.slug)
  const receiptUrl = normalizeText(body?.receiptUrl ?? body?.receipt_url)
  const captureMethod = normalizeText(body?.captureMethod ?? body?.capture_method)
  const transactionId = normalizeText(body?.transactionId ?? body?.transaction_id)
  const transactionNsu = normalizeText(body?.transactionNsu ?? body?.transaction_nsu)
  const returnedPaymentId = transactionId || transactionNsu || slug

  logPaymentCheck("received params", {
    orderNsu,
    slug,
    receiptUrl: Boolean(receiptUrl),
    captureMethod,
    transactionId,
    transactionNsu,
  })

  const orderId = await findOrderId({
    orderNsu,
    slug,
    transactionId,
    transactionNsu,
  })

  if (!orderId) {
    return NextResponse.json(
      {
        message: "Pedido nao encontrado para confirmar o pagamento.",
        status: "failed",
      },
      {
        status: 404,
      }
    )
  }

  const order = await getOrderControl(orderId)

  if (!order) {
    return NextResponse.json(
      {
        message: "Pedido nao encontrado.",
        status: "failed",
      },
      {
        status: 404,
      }
    )
  }

  logPaymentCheck("matched order", {
    orderId,
    status: order.status,
    paymentId: order.paymentId,
    hasPaymentUrl: Boolean(order.paymentUrl),
  })

  if (order.status === "paid") {
    const releasedReservations = order.reservationId
      ? await releaseStockReservationGroup(order.reservationId)
      : 0

    logPaymentCheck("order already paid", {
      orderId,
      releasedReservations,
      deductedStock: false,
    })

    return NextResponse.json({
      status: "paid",
      orderId,
      deductedStock: false,
      releasedReservations,
    })
  }

  const handle = process.env.INFINITEPAY_HANDLE?.trim()
  const paymentSlug = slug || order.paymentId || ""
  const payment = handle && paymentSlug
    ? await checkInfinitePayPayment({
        handle,
        orderNsu: order.id,
        slug: paymentSlug,
      })
    : null

  let status = normalizePaymentStatus(payment)
  const hasTrustedReturnConfirmation = Boolean(
    (transactionId || transactionNsu) && receiptUrl
  )

  if (status !== "paid" && hasTrustedReturnConfirmation) {
    status = "paid"
    logPaymentCheck("using trusted return confirmation", {
      orderId,
      transactionId,
      transactionNsu,
      hasReceiptUrl: true,
    })
  }

  if (status === "paid") {
    try {
      const result = await markOrderAsPaidFromInfinitePay({
        orderId,
        paymentId: returnedPaymentId,
        receiptUrl,
        captureMethod,
      })
      const email = await sendOrderEmailIfStatusChanged({
        orderId,
        statusChanged: result.statusChanged,
      })

      return NextResponse.json({
        status: result.order?.status ?? "paid",
        orderId,
        payment,
        deductedStock: result.deductedStock,
        releasedReservations: result.releasedReservations,
        email,
      })
    } catch (error) {
      return NextResponse.json(
        {
          message: error instanceof Error
            ? error.message
            : "Nao foi possivel confirmar o pagamento.",
          status: "failed",
        },
        {
          status: 400,
        }
      )
    }
  }

  const nextStatus = status === "cancelled" ? "cancelled" : "pending"
  const result = await updateOrderAsPendingOrFailed({
    orderId,
    status: nextStatus,
    paymentId: returnedPaymentId,
    receiptUrl,
    captureMethod,
  })

  return NextResponse.json({
    status: result.order?.status ?? status,
    orderId,
    payment,
    deductedStock: false,
    email: result.email,
  })
}
