import type { PrismaClient } from "@prisma/client"
import { slugify } from "@/shared/utils/slugs"

export async function generateUniqueProductSlug(
  prisma: PrismaClient,
  title: string,
  currentProductId?: string
) {
  const baseSlug = slugify(title)
  let slug = baseSlug
  let counter = 2

  while (true) {
    const existingProduct = await prisma.product.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    })

    if (!existingProduct || existingProduct.id === currentProductId) {
      return slug
    }

    slug = `${baseSlug}-${counter}`
    counter += 1
  }
}
