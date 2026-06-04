import { NextResponse } from "next/server"
import { isAdminAuthenticated, unauthorizedResponse } from "@/backend/services/admin-auth"
import { getPrisma } from "@/backend/services/prisma"

const ALLOWED_ORDER_STATUSES = [
  "pending",
  "paid",
  "canceled",
  "cancelled",
  "shipped",
  "delivered",
]

type RouteContext = {
  params: Promise<{
    id: string
  }>
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
  const status = String(body?.status ?? "")

  if (!ALLOWED_ORDER_STATUSES.includes(status)) {
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
  const order = await prisma.order.update({
    where: {
      id,
    },
    data: {
      status,
    },
    include: {
      items: true,
    },
  }).catch(() => null)

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
