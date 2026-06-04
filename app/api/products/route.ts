import { NextResponse } from "next/server"
import { isAdminAuthenticated, unauthorizedResponse } from "@/backend/services/admin-auth"
import { getPrisma } from "@/backend/services/prisma"
import { getProducts } from "@/backend/services/products"
import { toNumberPrice } from "@/shared/utils/currency"
import { normalizeProductImageSrc } from "@/shared/utils/images"
import {
  normalizeOptionalNumber,
  normalizeRating,
  normalizeRatingCount,
  normalizeStock,
} from "@/shared/utils/product-meta"

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
      weight: normalizeOptionalNumber(body.weight),
      height: normalizeOptionalNumber(body.height),
      width: normalizeOptionalNumber(body.width),
      length: normalizeOptionalNumber(body.length),
    },
  })

  return NextResponse.json(product)
}
