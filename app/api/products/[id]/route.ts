import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

  await prisma.product.delete({
    where: {
      id,
    },
  })

  return NextResponse.json({
    message: "Produto excluído com sucesso",
  })
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const body = await request.json()

  const product = await prisma.product.update({
    where: {
      id,
    },
    data: {
      title: body.title,
      category: body.category,
      price: Number(body.price),
      image: body.image,
      featured: body.featured ?? false,
    },
  })

  return NextResponse.json(product)
}