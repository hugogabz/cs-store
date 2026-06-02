import { NextResponse } from "next/server"
import { isAdminAuthenticated, unauthorizedResponse } from "@/services/admin-auth"
import { getPrisma } from "@/services/prisma"
import { toNumberPrice } from "@/utils/currency"
import { normalizeProductImageSrc } from "@/utils/images"
import {
  normalizeOptionalNumber,
  normalizeRating,
  normalizeRatingCount,
  normalizeStock,
} from "@/utils/product-meta"

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return unauthorizedResponse()
  }

  const prisma = getPrisma()
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
  if (!(await isAdminAuthenticated())) {
    return unauthorizedResponse()
  }

  const prisma = getPrisma()
  const { id } = await context.params
  const body = await request.json()

  const product = await prisma.product.update({
    where: {
      id,
    },
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
