import { getPrisma } from "@/services/prisma"
import { normalizeProductImageSrc } from "@/utils/images"

export type Product = {
  id: string
  title: string
  category: string
  price: number
  image: string
  featured: boolean
  createdAt: Date
}

export async function getProducts(): Promise<Product[]> {
  const prisma = getPrisma()

  const products = await prisma.product.findMany({
    orderBy: {
      createdAt: "desc",
    },
  })

  return products.map((product) => ({
    ...product,
    image: normalizeProductImageSrc(product.image),
  }))
}
