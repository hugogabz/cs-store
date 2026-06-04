import { NextResponse } from "next/server"
import { getPrisma } from "@/backend/services/prisma"

type InfinitePayCheckResponse = {
  paid?: boolean
  status?: string
  canceled?: boolean
  cancelled?: boolean
  success?: boolean
  approved?: boolean
}

function normalizeText(value: unknown) {
  return String(value ?? "").trim()
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
  ).catch(() => null)

  if (!response || !response.ok) {
    return null
  }

  return (await response.json().catch(() => null)) as
    | InfinitePayCheckResponse
    | null
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const orderId = normalizeText(body?.orderId ?? body?.orderNsu ?? body?.order_nsu)
  const slug = normalizeText(body?.slug)
  const receiptUrl = normalizeText(body?.receiptUrl ?? body?.receipt_url)
  const captureMethod = normalizeText(body?.captureMethod ?? body?.capture_method)
  const transactionNsu = normalizeText(body?.transactionNsu ?? body?.transaction_nsu)

  if (!orderId) {
    return NextResponse.json(
      {
        message: "Informe o pedido para consultar o pagamento.",
      },
      {
        status: 400,
      }
    )
  }

  const prisma = getPrisma()
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
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

  const handle = process.env.INFINITEPAY_HANDLE?.trim()
  const paymentSlug = slug || order.paymentId || ""
  const payment = handle && paymentSlug
    ? await checkInfinitePayPayment({
        handle,
        orderNsu: order.id,
        slug: paymentSlug,
      })
    : null

  const status = normalizePaymentStatus(payment)
  const updatedOrder = await prisma.order.update({
    where: {
      id: order.id,
    },
    data: {
      status,
      paymentProvider: "infinitepay",
      paymentId: transactionNsu || paymentSlug || order.paymentId,
      receiptUrl: receiptUrl || order.receiptUrl,
      captureMethod: captureMethod || order.captureMethod,
    },
  })

  return NextResponse.json({
    status: updatedOrder.status,
    orderId: updatedOrder.id,
    payment,
  })
}
