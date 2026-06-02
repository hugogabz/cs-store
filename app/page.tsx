import { Header } from "@/components/layout/header"
import { HeroSection } from "@/components/home/hero-section"
import { CategorySection } from "@/components/home/category-section"
import { Footer } from "@/components/layout/footer"
import { MobileMenu } from "@/components/layout/mobile-menu"
import { CartDrawer } from "@/components/layout/cart-drawer"
import { BenefitsSection } from "@/components/home/benefits-section"
import { getProducts } from "@/services/products"
import { normalizeSearchText } from "@/utils/search"

export const dynamic = "force-dynamic"

export default async function Home() {
  const products = await getProducts()

  const featuredProducts = products.filter(
    (product) => product.featured
  )

  const productsByCategory = (category: string) =>
    products.filter(
      (product) =>
        normalizeSearchText(product.category) === normalizeSearchText(category)
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
        />

        <CategorySection
          id="cabelos"
          title="Linha Premium para Cabelos"
          subtitle="Produtos sofisticados para cuidados capilares com acabamento profissional."
          products={hairProducts}
        />

        <CategorySection
          id="cosmeticos"
          title="Cosméticos Exclusivos"
          subtitle="Maquiagem e skincare com visual refinado e qualidade premium."
          products={cosmeticProducts}
        />

        <CategorySection
          id="acessorios"
          title="Acessórios Elegantes"
          subtitle="Peças modernas e sofisticadas para complementar seu estilo."
          products={accessoryProducts}
        />
      </main>

      <Footer />
      <CartDrawer />
      <MobileMenu />
    </>
  )
}
