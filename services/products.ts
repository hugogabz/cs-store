import { getPrisma } from "@/services/prisma"

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

  return prisma.product.findMany({
    orderBy: {
      createdAt: "desc",
    },
  })
}
