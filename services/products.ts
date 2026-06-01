export type Product = {
  id: string
  title: string
  category: string
  price: number
  image: string
  featured: boolean
  createdAt: string
}

export async function getProducts(): Promise<Product[]> {
  const response = await fetch("http://localhost:3000/api/products", {
    cache: "no-store",
  })

  return response.json()
}