import { NextResponse } from "next/server"
import { getPrisma } from "@/backend/services/prisma"

type InfinitePayLinkResponse = {
  id?: string
  slug?: string
  url?: string
  link?: string
  payment_url?: string
  paymentUrl?: string
  checkout_url?: string
}

function toCents(value: number) {
  return Math.round(value * 100)
}

function getPaymentUrl(data: InfinitePayLinkResponse) {
  return (
    data.paymentUrl ??
    data.payment_url ??
    data.checkout_url ??
    data.url ??
    data.link ??
    ""
  )
}

function getPaymentId(data: InfinitePayLinkResponse) {
  return data.id ?? data.slug ?? null
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const orderId = typeof body?.orderId === "string" ? body.orderId : ""

  if (!orderId) {
    return NextResponse.json(
      {
        message: "Informe o pedido para gerar o pagamento.",
      },
      {
        status: 400,
      }
    )
  }

  const handle = process.env.INFINITEPAY_HANDLE?.trim()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "")

  if (!handle || !siteUrl) {
    return NextResponse.json(
      {
        message:
          "Configure INFINITEPAY_HANDLE e NEXT_PUBLIC_SITE_URL para gerar o pagamento.",
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
    include: {
      items: true,
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

  if (order.items.length === 0) {
    return NextResponse.json(
      {
        message: "Pedido sem itens para pagamento.",
      },
      {
        status: 400,
      }
    )
  }

  if (order.paymentUrl) {
    return NextResponse.json({
      paymentUrl: order.paymentUrl,
    })
  }

  const payload = {
    handle,
    order_nsu: order.id,
    items: [
      ...order.items.map((item) => ({
        quantity: item.quantity,
        price: toCents(item.price),
        description: item.title,
      })),
      {
        quantity: 1,
        price: toCents(order.shippingPrice),
        description: order.shippingMethod,
      },
    ],
    redirect_url: `${siteUrl}/checkout/success?orderId=${order.id}`,
  }

  const response = await fetch("https://api.checkout.infinitepay.io/links", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  }).catch(() => null)

  if (!response) {
    return NextResponse.json(
      {
        message: "Falha ao conectar com a InfinitePay.",
      },
      {
        status: 502,
      }
    )
  }

  const data = (await response.json().catch(() => null)) as
    | InfinitePayLinkResponse
    | null

  if (!response.ok || !data) {
    return NextResponse.json(
      {
        message: "Não foi possível criar o checkout InfinitePay.",
      },
      {
        status: 502,
      }
    )
  }

  const paymentUrl = getPaymentUrl(data)

  if (!paymentUrl) {
    return NextResponse.json(
      {
        message: "InfinitePay não retornou um link de pagamento.",
      },
      {
        status: 502,
      }
    )
  }

  await prisma.order.update({
    where: {
      id: order.id,
    },
    data: {
      paymentProvider: "infinitepay",
      paymentId: getPaymentId(data),
      paymentUrl,
    },
  })

  return NextResponse.json({
    paymentUrl,
  })
}
