import type { MetadataRoute } from "next"
import { getProducts } from "@/backend/services/products"
import { categoryPages } from "@/shared/utils/categories"

const siteUrl = "https://www.storecs.com.br"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts()
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
  ]

  const categoryRoutes: MetadataRoute.Sitemap = Object.keys(categoryPages).map(
    (slug) => ({
      url: `${siteUrl}/categoria/${slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: slug === "destaques" ? 0.8 : 0.7,
    })
  )

  const productRoutes: MetadataRoute.Sitemap = products
    .filter((product) => product.slug)
    .map((product) => ({
      url: `${siteUrl}/produto/${product.slug}`,
      lastModified: product.createdAt,
      changeFrequency: "weekly",
      priority: product.featured ? 0.8 : 0.6,
    }))

  return [...staticRoutes, ...categoryRoutes, ...productRoutes]
}
