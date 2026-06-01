import { NextResponse } from "next/server"
import { getPrisma } from "@/services/prisma"
import { getProducts } from "@/services/products"

export async function GET() {
  const products = await getProducts()

  return NextResponse.json(products)
}

export async function POST(request: Request) {
  const prisma = getPrisma()
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
