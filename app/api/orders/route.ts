import { NextResponse } from "next/server"
import { isAdminAuthenticated, unauthorizedResponse } from "@/backend/services/admin-auth"
import { getPrisma } from "@/backend/services/prisma"

type OrderRequestItem = {
  productId?: unknown
  title?: unknown
  image?: unknown
  price?: unknown
  quantity?: unknown
}

function normalizeText(value: unknown) {
  return String(value ?? "").trim()
}

function normalizeOptionalText(value: unknown) {
  const text = normalizeText(value)

  return text || null
}

function normalizePrice(value: unknown) {
  const price = Number(value)

  if (!Number.isFinite(price) || price < 0) {
    return 0
  }

  return price
}

function normalizeQuantity(value: unknown) {
  const quantity = Number.parseInt(String(value ?? "0"), 10)

  if (!Number.isFinite(quantity) || quantity <= 0) {
    return 0
  }

  return quantity
}

function normalizeOrderItems(items: unknown) {
  if (!Array.isArray(items)) {
    return []
  }

  return (items as OrderRequestItem[])
    .map((item) => ({
      productId: normalizeOptionalText(item.productId),
      title: normalizeText(item.title),
      image: normalizeText(item.image),
      price: normalizePrice(item.price),
      quantity: normalizeQuantity(item.quantity),
    }))
    .filter((item) => item.title && item.quantity > 0)
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return unauthorizedResponse()
  }

  const prisma = getPrisma()
  const orders = await prisma.order.findMany({
    include: {
      items: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return NextResponse.json(orders)
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const items = normalizeOrderItems(body?.items)

  if (items.length === 0) {
    return NextResponse.json(
      {
        message: "Carrinho vazio. Adicione produtos antes de criar o pedido.",
      },
      {
        status: 400,
      }
    )
  }

  const customerName = normalizeText(body?.customerName)
  const customerEmail = normalizeText(body?.customerEmail)
  const customerPhone = normalizeText(body?.customerPhone)
  const customerCpf = normalizeOptionalText(body?.customerCpf)
  const cep = normalizeText(body?.cep)
  const address = normalizeText(body?.address)
  const city = normalizeOptionalText(body?.city)
  const state = normalizeOptionalText(body?.state)
  const shippingMethod = normalizeText(body?.shippingMethod)
  const shippingPrice = normalizePrice(body?.shippingPrice)

  if (!customerName || !customerEmail || !customerPhone || !cep || !address) {
    return NextResponse.json(
      {
        message: "Preencha nome, e-mail, telefone, CEP e endereço.",
      },
      {
        status: 400,
      }
    )
  }

  if (!shippingMethod) {
    return NextResponse.json(
      {
        message: "Selecione uma opção de frete antes de criar o pedido.",
      },
      {
        status: 400,
      }
    )
  }

  const subtotal = items.reduce((acc, item) => {
    return acc + item.price * item.quantity
  }, 0)
  const total = subtotal + shippingPrice

  const prisma = getPrisma()
  const order = await prisma.order.create({
    data: {
      customerName,
      customerEmail,
      customerPhone,
      customerCpf,
      cep,
      address,
      city,
      state,
      subtotal,
      shippingPrice,
      shippingMethod,
      total,
      status: "pending",
      // Future InfinitePay step:
      // create the checkout/payment link with total products + shipping.
      // Save paymentUrl and paymentId when the provider returns them.
      // A future webhook will update status to "paid".
      paymentProvider: null,
      paymentId: null,
      paymentUrl: null,
      items: {
        create: items.map((item) => ({
          productId: item.productId,
          title: item.title,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
        })),
      },
    },
    include: {
      items: true,
    },
  })

  return NextResponse.json({
    orderId: order.id,
    order,
  })
}
