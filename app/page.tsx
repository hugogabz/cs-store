import { Header } from "@/frontend/components/layout/header"
import { HeroSection } from "@/frontend/components/home/hero-section"
import { CategorySection } from "@/frontend/components/home/category-section"
import { Footer } from "@/frontend/components/layout/footer"
import { MobileMenu } from "@/frontend/components/layout/mobile-menu"
import { CartDrawer } from "@/frontend/components/layout/cart-drawer"
import { BenefitsSection } from "@/frontend/components/home/benefits-section"
import { getProducts } from "@/backend/services/products"
import { isSameCategory, storeCategories } from "@/shared/utils/categories"

export const dynamic = "force-dynamic"

export default async function Home() {
  const products = await getProducts()

  const featuredProducts = products.filter(
    (product) => product.featured
  )

  const productsByCategory = (category: string) =>
    products.filter(
      (product) => isSameCategory(product.category, category)
    )

  return (
    <>
      <Header />

      <main className="pb-6 md:pb-0">
        <HeroSection />

        <BenefitsSection />

        <CategorySection
          id="destaques"
          title="Produtos em destaque"
          subtitle="Uma seleção especial dos itens mais desejados da CS Store."
          products={featuredProducts}
          seeMoreHref="/categoria/destaques"
        />

        {storeCategories.map((category) => (
          <CategorySection
            key={category.id}
            id={category.id}
            title={category.title}
            subtitle={category.subtitle}
            products={productsByCategory(category.name)}
            seeMoreHref={`/categoria/${category.slug}`}
            subcategories={category.subcategories}
          />
        ))}
      </main>

      <Footer />
      <CartDrawer />
      <MobileMenu />
    </>
  )
}
