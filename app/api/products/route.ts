import { NextResponse } from "next/server"
import { isAdminAuthenticated, unauthorizedResponse } from "@/services/admin-auth"
import { getPrisma } from "@/services/prisma"
import { getProducts } from "@/services/products"
import { toNumberPrice } from "@/utils/currency"
import { normalizeProductImageSrc } from "@/utils/images"
import {
  normalizeRating,
  normalizeRatingCount,
  normalizeStock,
} from "@/utils/product-meta"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  if (
    searchParams.get("scope") === "admin" &&
    await isAdminAuthenticated()
  ) {
    const prisma = getPrisma()
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(
      products.map((product) => ({
        ...product,
        image: normalizeProductImageSrc(product.image),
      }))
    )
  }

  const products = await getProducts()

  return NextResponse.json(products)
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return unauthorizedResponse()
  }

  const prisma = getPrisma()
  const body = await request.json()

  const product = await prisma.product.create({
    data: {
      title: body.title,
      description: body.description?.trim() || null,
      category: body.category,
      price: toNumberPrice(body.price),
      image: normalizeProductImageSrc(body.image),
      featured: body.featured ?? false,
      stock: normalizeStock(body.stock),
      rating: normalizeRating(body.rating),
      ratingCount: normalizeRatingCount(body.ratingCount),
    },
  })

  return NextResponse.json(product)
}
