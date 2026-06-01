import { CategorySection } from "@/components/home/category-section"
import { featuredProducts } from "@/data/products"

export function ProductSection() {
  return (
    <CategorySection
      id="destaques"
      title="Produtos em destaque"
      subtitle="Uma seleção especial dos itens mais desejados da CS Store."
      products={featuredProducts}
    />
  )
}