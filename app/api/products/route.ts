import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  const products = await prisma.product.findMany({
    orderBy: {
      createdAt: "desc",
    },
  })

  return NextResponse.json(products)
}

export async function POST(request: Request) {
  const body = await request.json()

  const product = await prisma.product.create({
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