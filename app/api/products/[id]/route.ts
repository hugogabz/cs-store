import { NextResponse } from "next/server"
import { isAdminAuthenticated, unauthorizedResponse } from "@/backend/services/admin-auth"
import { generateUniqueProductSlug } from "@/backend/services/product-slugs"
import { getPrisma } from "@/backend/services/prisma"
import { toNumberPrice } from "@/shared/utils/currency"
import { normalizeProductImageSrc } from "@/shared/utils/images"
import {
  normalizeOptionalNumber,
  normalizeRating,
  normalizeRatingCount,
  normalizeStock,
} from "@/shared/utils/product-meta"

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
  const slug = await generateUniqueProductSlug(prisma, body.title, id)

  const product = await prisma.product.update({
    where: {
      id,
    },
    data: {
      title: body.title,
      slug,
      description: body.description?.trim() || null,
      category: body.category,
      subcategory: body.subcategory?.trim() || null,
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
