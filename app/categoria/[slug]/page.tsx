import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { MobileMenu } from "@/components/layout/mobile-menu"
import { CartDrawer } from "@/components/layout/cart-drawer"
import { ProductCard } from "@/components/products/product-card"
import { getProducts } from "@/services/products"
import {
  categoryPages,
  getCategoryNameBySlug,
  isCategorySlug,
  isSameCategory,
} from "@/utils/categories"

export const dynamic = "force-dynamic"

type CategoryPageProps = {
  params: Promise<{
    slug: string
  }>
}

export function generateStaticParams() {
  return Object.keys(categoryPages).map((slug) => ({
    slug,
  }))
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params

  if (!isCategorySlug(slug)) {
    return {
      title: "Categoria não encontrada",
    }
  }

  return {
    title: categoryPages[slug].title,
    description: categoryPages[slug].subtitle,
  }
}

export default async function CategoryPage({
  params,
}: CategoryPageProps) {
  const { slug } = await params

  if (!isCategorySlug(slug)) {
    notFound()
  }

  const categoryPage = categoryPages[slug]
  const products = await getProducts()

  const filteredProducts = products.filter((product) => {
    if (slug === "destaques") {
      return product.featured
    }

    return isSameCategory(product.category, getCategoryNameBySlug(slug))
  })

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#F8F6F2] px-4 py-8 md:px-8 md:py-12">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-[#E7E1D8] bg-white px-5 py-2.5 text-sm font-semibold text-[#1A1A1A] transition hover:border-[#B89535] hover:text-[#B89535]"
          >
            <ArrowLeft size={18} />
            Voltar para loja
          </Link>

          <section className="mt-8 rounded-2xl border border-[#E7E1D8] bg-white p-6 shadow-[0_12px_34px_rgba(26,26,26,0.04)] md:p-9">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#B89535] md:text-sm">
              CS STORE
            </span>

            <h1 className="mt-4 text-4xl font-semibold text-[#1A1A1A] md:text-6xl">
              {categoryPage.title}
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#5C5C5C] md:text-base">
              {categoryPage.subtitle}
            </p>
          </section>

          <section className="mt-8">
            {filteredProducts.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#D8CBB9] bg-white/80 p-8 text-center">
                <h2 className="text-2xl font-semibold text-[#1A1A1A]">
                  Nenhum produto encontrado.
                </h2>
                <p className="mt-3 text-sm text-[#6F6A63]">
                  Cadastre produtos no admin para preencher esta categoria.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
      <CartDrawer />
      <MobileMenu />
    </>
  )
}
