import { NextResponse } from "next/server"
import { getPrisma } from "@/backend/services/prisma"

type InfinitePayCheckResponse = {
  paid?: boolean
  status?: string
  canceled?: boolean
  cancelled?: boolean
}

function normalizePaymentStatus(data: InfinitePayCheckResponse) {
  if (data.paid) return "paid"
  if (data.cancelled || data.canceled) return "cancelled"

  const status = String(data.status ?? "").toLowerCase()

  if (["paid", "approved", "completed"].includes(status)) return "paid"
  if (["cancelled", "canceled", "cancelado"].includes(status)) return "cancelled"

  return "pending"
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const orderId = typeof body?.orderId === "string" ? body.orderId : ""

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

  const handle = process.env.INFINITEPAY_HANDLE?.trim()

  if (!handle) {
    return NextResponse.json(
      {
        message: "Configure INFINITEPAY_HANDLE para consultar o pagamento.",
      },
      {
        status: 500,
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

  if (!order.paymentId) {
    return NextResponse.json(
      {
        message: "Pedido ainda não possui identificador de pagamento.",
      },
      {
        status: 400,
      }
    )
  }

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
        order_nsu: order.id,
        slug: order.paymentId,
      }),
    }
  ).catch(() => null)

  if (!response) {
    return NextResponse.json(
      {
        message: "Falha ao consultar pagamento na InfinitePay.",
      },
      {
        status: 502,
      }
    )
  }

  const data = (await response.json().catch(() => null)) as
    | InfinitePayCheckResponse
    | null

  if (!response.ok || !data) {
    return NextResponse.json(
      {
        message: "Não foi possível consultar o pagamento InfinitePay.",
      },
      {
        status: 502,
      }
    )
  }

  const status = normalizePaymentStatus(data)
  const updatedOrder = await prisma.order.update({
    where: {
      id: order.id,
    },
    data: {
      status,
    },
  })

  return NextResponse.json({
    status: updatedOrder.status,
    payment: data,
  })
}
