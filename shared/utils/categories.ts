import { normalizeSearchText } from "@/shared/utils/search"

export const categoryPages = {
  destaques: {
    title: "Produtos em destaque",
    subtitle: "Seleção especial dos itens mais desejados da CS Store.",
  },
  cabelos: {
    category: "Cabelos",
    title: "Produtos para Cabelos",
    subtitle: "Cuidados capilares com acabamento premium e rotina sofisticada.",
  },
  cosmeticos: {
    category: "Cosméticos",
    title: "Cosméticos",
    subtitle: "Maquiagem e skincare com curadoria moderna e elegante.",
  },
  acessorios: {
    category: "Acessórios",
    title: "Acessórios",
    subtitle: "Peças selecionadas para complementar seu estilo.",
  },
} as const

export type CategorySlug = keyof typeof categoryPages

export function isCategorySlug(slug: string): slug is CategorySlug {
  return slug in categoryPages
}

export function isSameCategory(
  productCategory: string,
  category: string
) {
  return normalizeSearchText(productCategory) === normalizeSearchText(category)
}

export function getCategoryNameBySlug(slug: Exclude<CategorySlug, "destaques">) {
  return categoryPages[slug].category
}
