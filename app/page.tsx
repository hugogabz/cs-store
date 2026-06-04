import { Header } from "@/frontend/components/layout/header"
import { HeroSection } from "@/frontend/components/home/hero-section"
import { CategorySection } from "@/frontend/components/home/category-section"
import { Footer } from "@/frontend/components/layout/footer"
import { MobileMenu } from "@/frontend/components/layout/mobile-menu"
import { CartDrawer } from "@/frontend/components/layout/cart-drawer"
import { BenefitsSection } from "@/frontend/components/home/benefits-section"
import { getProducts } from "@/backend/services/products"
import { isSameCategory } from "@/shared/utils/categories"

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

  const hairProducts = productsByCategory("Cabelos")
  const cosmeticProducts = productsByCategory("Cosméticos")
  const accessoryProducts = productsByCategory("Acessórios")

  return (
    <>
      <Header />

      <main>
        <HeroSection />

        <BenefitsSection />

        <CategorySection
          id="destaques"
          title="Produtos em destaque"
          subtitle="Uma seleção especial dos itens mais desejados da CS Store."
          products={featuredProducts}
          seeMoreHref="/categoria/destaques"
        />

        <CategorySection
          id="cabelos"
          title="Linha Premium para Cabelos"
          subtitle="Produtos sofisticados para cuidados capilares com acabamento profissional."
          products={hairProducts}
          seeMoreHref="/categoria/cabelos"
        />

        <CategorySection
          id="cosmeticos"
          title="Cosméticos Exclusivos"
          subtitle="Maquiagem e skincare com visual refinado e qualidade premium."
          products={cosmeticProducts}
          seeMoreHref="/categoria/cosmeticos"
        />

        <CategorySection
          id="acessorios"
          title="Acessórios Elegantes"
          subtitle="Peças modernas e sofisticadas para complementar seu estilo."
          products={accessoryProducts}
          seeMoreHref="/categoria/acessorios"
        />
      </main>

      <Footer />
      <CartDrawer />
      <MobileMenu />
    </>
  )
}
