import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Star } from "lucide-react"
import { notFound } from "next/navigation"
import { CartDrawer } from "@/frontend/components/layout/cart-drawer"
import { Footer } from "@/frontend/components/layout/footer"
import { Header } from "@/frontend/components/layout/header"
import { MobileMenu } from "@/frontend/components/layout/mobile-menu"
import { ProductCard } from "@/frontend/components/products/product-card"
import { ProductPurchaseActions } from "@/frontend/components/products/product-purchase-actions"
import { getProductBySlug, getProducts } from "@/backend/services/products"
import { getProductSubcategoryLabel, isSameCategory } from "@/shared/utils/categories"
import { formatCurrency } from "@/shared/utils/currency"

export const dynamic = "force-dynamic"

type ProductPageProps = {
  params: Promise<{
    slug: string
  }>
}

function productDescription(description: string | null) {
  return (
    description?.trim() ||
    "Produto selecionado pela CS Store para beleza, cuidado e acabamento premium."
  )
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    return {
      title: "Produto não encontrado | CS Store",
    }
  }

  const description = productDescription(product.description)
  const url = `https://www.storecs.com.br/produto/${product.slug ?? slug}`

  return {
    title: product.title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${product.title} | CS Store`,
      description,
      url,
      siteName: "CS Store",
      locale: "pt_BR",
      type: "website",
      images: [
        {
          url: product.image,
          alt: product.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.title} | CS Store`,
      description,
      images: [product.image],
    },
  }
}

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  const products = await getProducts()
  const relatedProducts = products
    .filter((item) => {
      return item.id !== product.id && isSameCategory(item.category, product.category)
    })
    .slice(0, 8)
  const subcategoryLabel = getProductSubcategoryLabel(
    product.category,
    product.subcategory
  )
  const availableStock = Math.max(0, Math.floor(Number(product.stock) || 0))
  const isUnavailable = availableStock === 0
  const displayRating = Math.min(5, Math.max(4, Number(product.rating) || 4.8))
  const displayRatingCount = Math.max(
    0,
    Math.floor(Number(product.ratingCount) || 0)
  )
  const stockLabel = isUnavailable
    ? "Produto indisponível"
    : availableStock <= 5
      ? "Últimas unidades"
      : "Em estoque"

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#F8F6F2] px-4 pb-28 pt-8 md:px-8 md:py-12">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-[#E7E1D8] bg-white px-5 py-2.5 text-sm font-semibold text-[#1A1A1A] transition hover:border-[#B89535] hover:text-[#B89535]"
          >
            <ArrowLeft size={18} />
            Voltar para loja
          </Link>

          <section className="mt-8 grid gap-8 rounded-2xl border border-[#E7E1D8] bg-white p-4 shadow-[0_12px_34px_rgba(26,26,26,0.04)] md:grid-cols-[0.95fr_1.05fr] md:p-8">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#F8F6F2]">
              <Image
                src={product.image}
                alt={product.title}
                fill
                priority
                sizes="(min-width: 1024px) 48vw, 100vw"
                className="object-contain p-5 md:p-8"
              />
            </div>

            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#B89535]">
                {subcategoryLabel
                  ? `${product.category} / ${subcategoryLabel}`
                  : product.category}
              </span>

              <h1 className="mt-4 text-3xl font-semibold leading-tight text-[#1A1A1A] md:text-5xl">
                {product.title}
              </h1>

              <p className="mt-4 text-2xl font-semibold tracking-tight text-[#1A1A1A]">
                {formatCurrency(product.price)}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span className="inline-flex text-[#B89535]">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      size={18}
                      fill="currentColor"
                      strokeWidth={0}
                    />
                  ))}
                </span>
                <span className="text-sm text-[#5C5C5C]">
                  {displayRating.toFixed(1)} ({displayRatingCount} avaliações)
                </span>
              </div>

              <div className="mt-6 rounded-2xl border border-[#E7E1D8] bg-[#F8F6F2] p-4">
                <p
                  className={`text-sm font-semibold ${
                    isUnavailable
                      ? "text-red-500"
                      : availableStock <= 5
                        ? "text-[#B89535]"
                        : "text-emerald-700"
                  }`}
                >
                  {stockLabel}
                </p>

                <p className="mt-1 text-sm text-[#5C5C5C]">
                  Estoque: {availableStock} unidades
                </p>
              </div>

              <div className="mt-7 border-t border-[#E7E1D8] pt-6">
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8A8A8A]">
                  Descrição
                </h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#4F4A44] md:text-base">
                  {productDescription(product.description)}
                </p>
              </div>

              <div className="mt-auto pt-7">
                <ProductPurchaseActions
                  image={product.image}
                  price={product.price}
                  productId={product.id}
                  stock={availableStock}
                  title={product.title}
                />
              </div>
            </div>
          </section>

          {relatedProducts.length > 0 && (
            <section className="mt-12">
              <div className="mb-6">
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#B89535]">
                  CS STORE
                </span>
                <h2 className="mt-3 text-3xl font-semibold text-[#1A1A1A]">
                  Produtos relacionados
                </h2>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.map((item) => (
                  <ProductCard key={item.id} {...item} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
      <CartDrawer />
      <MobileMenu />
    </>
  )
}
