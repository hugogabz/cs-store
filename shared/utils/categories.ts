import { normalizeSearchText } from "@/shared/utils/search"

export type StoreCategory = {
  id: string
  slug: string
  name: string
  title: string
  subtitle: string
  subcategories: string[]
}

export const storeCategories = [
  {
    id: "cabelos",
    slug: "cabelos",
    name: "Cabelos",
    title: "Cabelos",
    subtitle: "Entrelace, Crochet Braids e cuidados capilares com curadoria premium.",
    subcategories: ["Entrelace", "Crochet Braids"],
  },
  {
    id: "rabos",
    slug: "rabos",
    name: "Rabos",
    title: "Rabos",
    subtitle: "Modelos elegantes para producoes versateis e acabamento sofisticado.",
    subcategories: [],
  },
  {
    id: "acessorios",
    slug: "acessorios",
    name: "Acessórios",
    title: "Acessórios",
    subtitle: "Peças selecionadas para complementar seu estilo.",
    subcategories: [],
  },
  {
    id: "cosmeticos",
    slug: "cosmeticos",
    name: "Cosméticos",
    title: "Cosméticos",
    subtitle: "Produtos para tranças de fibra e cabelo cacheado natural.",
    subcategories: ["Para Tranças de Fibra", "Para Cabelo Cacheado Natural"],
  },
  {
    id: "trancas",
    slug: "trancas",
    name: "Tranças",
    title: "Tranças",
    subtitle: "Opções para tranças com beleza, presença e acabamento profissional.",
    subcategories: [],
  },
] as const satisfies StoreCategory[]

export const categoryPages = {
  destaques: {
    title: "Produtos em destaque",
    subtitle: "Seleção especial dos itens mais desejados da CS Store.",
  },
  cabelos: storeCategories[0],
  rabos: storeCategories[1],
  acessorios: storeCategories[2],
  cosmeticos: storeCategories[3],
  trancas: storeCategories[4],
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

export function isSameSubcategory(
  productSubcategory: string | null | undefined,
  subcategory: string
) {
  return normalizeSearchText(productSubcategory ?? "") === normalizeSearchText(subcategory)
}

export function getCategoryNameBySlug(slug: Exclude<CategorySlug, "destaques">) {
  return categoryPages[slug].name
}

export function getCategoryByName(category: string) {
  const normalizedCategory = normalizeSearchText(category)

  return storeCategories.find(
    (item) => normalizeSearchText(item.name) === normalizedCategory
  )
}

export function getCategoryBySlug(slug: string) {
  return storeCategories.find((category) => category.slug === slug)
}

export function getSubcategoriesForCategory(category: string) {
  return getCategoryByName(category)?.subcategories ?? []
}

export function getProductSubcategoryLabel(
  category: string,
  subcategory?: string | null
) {
  const cleanSubcategory = subcategory?.trim()

  if (cleanSubcategory && !isSameCategory(cleanSubcategory, category)) {
    return cleanSubcategory
  }

  return null
}
