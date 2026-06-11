import { NextResponse } from "next/server"
import { getPrisma } from "@/backend/services/prisma"

function normalizeText(value: unknown) {
  return String(value ?? "").trim()
}

function normalizeEmail(value: unknown) {
  return normalizeText(value).toLowerCase()
}

function normalizeOrderNumber(value: unknown) {
  return normalizeText(value).toUpperCase()
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const email = normalizeEmail(body?.email)
  const orderNumber = normalizeOrderNumber(body?.orderNumber)

  if (!email || !orderNumber) {
    return NextResponse.json(
      {
        message: "Informe e-mail e número do pedido.",
      },
      {
        status: 400,
      }
    )
  }

  const prisma = getPrisma()
  const order = await prisma.order.findFirst({
    where: {
      orderNumber,
      customerEmail: {
        equals: email,
        mode: "insensitive",
      },
    },
    select: {
      orderNumber: true,
      status: true,
      total: true,
      trackingCode: true,
      createdAt: true,
      updatedAt: true,
      items: {
        select: {
          id: true,
          title: true,
          quantity: true,
          price: true,
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
