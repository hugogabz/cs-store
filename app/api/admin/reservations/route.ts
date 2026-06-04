import { NextResponse } from "next/server"
import { isAdminAuthenticated, unauthorizedResponse } from "@/backend/services/admin-auth"
import { getPrisma } from "@/backend/services/prisma"

function serializeReservation(
  reservation: {
    id: string
    groupId: string
    productId: string
    quantity: number
    expiresAt: Date
    createdAt: Date
    product: {
      id: string
      title: string
      image: string
      stock: number
    }
  },
  now: Date
) {
  const expiresInMs = reservation.expiresAt.getTime() - now.getTime()
  const isActive = expiresInMs > 0

  return {
    id: reservation.id,
    groupId: reservation.groupId,
    productId: reservation.productId,
    quantity: reservation.quantity,
    expiresAt: reservation.expiresAt.toISOString(),
    createdAt: reservation.createdAt.toISOString(),
    status: isActive ? "active" : "expired",
    isActive,
    expiresInMs: Math.max(0, expiresInMs),
    product: reservation.product,
  }
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return unauthorizedResponse()
  }

  const prisma = getPrisma()
  const now = new Date()
  const reservations = await prisma.stockReservation.findMany({
    include: {
      product: {
        select: {
          id: true,
          title: true,
          image: true,
          stock: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return NextResponse.json(
    reservations.map((reservation) => serializeReservation(reservation, now))
  )
}

export async function DELETE(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return unauthorizedResponse()
  }

  const body = await request.json().catch(() => null)
  const id = typeof body?.id === "string" ? body.id : ""
  const groupId = typeof body?.groupId === "string" ? body.groupId : ""

  if (!id && !groupId) {
    return NextResponse.json(
      {
        message: "Informe a reserva que deseja liberar.",
      },
      {
        status: 400,
      }
    )
  }

  const prisma = getPrisma()
  const result = await prisma.stockReservation.deleteMany({
    where: id
      ? {
          id,
        }
      : {
          groupId,
        },
  })

  return NextResponse.json({
    removed: result.count,
  })
}

export async function POST(request: Request) {
  return DELETE(request)
}
