"use client"

import Image from "next/image"
import { Search, ShoppingBag, X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { useCartStore } from "@/frontend/store/cart-store"
import { formatCurrency, toNumberPrice } from "@/shared/utils/currency"
import { normalizeProductImageSrc } from "@/shared/utils/images"
import { normalizeSearchText } from "@/shared/utils/search"

type Product = {
  id: string
  title: string
  description: string | null
  category: string
  price: number
  image: string
  stock: number
  rating: number
  ratingCount: number
}

type SearchModalProps = {
  isOpen: boolean
  onClose: () => void
}

export function SearchModal({
  isOpen,
  onClose,
}: SearchModalProps) {
  const [search, setSearch] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const addItem = useCartStore((state) => state.addItem)

  useEffect(() => {
    if (!isOpen || products.length > 0) return

    let ignore = false

    void fetch("/api/products")
      .then((response) => response.json())
      .then((data: Product[]) => {
        if (!ignore) {
          setProducts(data)
        }
      })
      .catch(() => {
        if (!ignore) {
          toast.error("Não foi possível carregar a busca.")
        }
      })

    return () => {
      ignore = true
    }
  }, [isOpen, products.length])

  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  const uniqueProducts = useMemo(
    () => Array.from(new Map(products.map((product) => [product.id, product])).values()),
    [products]
  )

  const normalizedSearch = normalizeSearchText(search)

  const productsToShow = useMemo(() => {
    if (!normalizedSearch) return uniqueProducts

    return uniqueProducts.filter((product) => {
      const searchableText = normalizeSearchText(`
        ${product.title}
        ${product.description ?? ""}
        ${product.category}
        ${product.price}
        ${formatCurrency(product.price)}
      `)

      return searchableText.includes(normalizedSearch)
    })
  }, [normalizedSearch, uniqueProducts])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[80] bg-black/45 p-3 backdrop-blur-sm md:p-4"
      onClick={onClose}
    >
      <div
        className="mx-auto flex max-h-[calc(100dvh-32px)] max-w-2xl flex-col rounded-2xl bg-white p-4 shadow-[0_24px_70px_rgba(0,0,0,0.18)] md:mt-24 md:max-h-[640px] md:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center gap-3 border-b border-[#E7E1D8] pb-4 md:mb-6 md:gap-4">
          <Search className="shrink-0 text-[#B89535]" />

          <input
            autoFocus
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome, descrição, categoria ou preço..."
            className="min-w-0 flex-1 bg-transparent text-base outline-none md:text-lg"
          />

          <button
            onClick={onClose}
            className="rounded-full p-2 transition hover:bg-neutral-100"
            aria-label="Fechar busca"
          >
            <X />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
          {productsToShow.map((product) => {
            const imageSrc = normalizeProductImageSrc(product.image)
            const numericPrice = toNumberPrice(product.price)
            const availableStock = Math.max(0, Math.floor(Number(product.stock) || 0))
            const isUnavailable = availableStock === 0

            return (
              <div
                key={product.id}
                className="flex gap-3 rounded-2xl border border-transparent p-2 transition hover:border-[#E7E1D8] hover:bg-[#F8F6F2] md:items-center md:gap-4 md:p-3"
              >
                <Image
                  src={imageSrc}
                  alt={product.title}
                  width={72}
                  height={72}
                  className="h-16 w-16 shrink-0 rounded-xl object-cover md:h-[72px] md:w-[72px]"
                />

                <div className="min-w-0 flex-1">
                  <h3 className="line-clamp-2 font-semibold text-[#1A1A1A]">
                    {product.title}
                  </h3>

                  <p className="mt-1 text-sm text-[#B89535]">
                    {product.category} • {formatCurrency(numericPrice)}
                  </p>

                  <p
                    className={`mt-1 text-xs font-semibold ${
                      isUnavailable
                        ? "text-red-500"
                        : availableStock <= 5
                          ? "text-[#B89535]"
                          : "text-emerald-700"
                    }`}
                  >
                    {isUnavailable
                      ? "Produto indisponível"
                      : availableStock <= 5
                        ? "Últimas unidades"
                        : "Em estoque"}
                  </p>
                </div>

                <button
                  disabled={isUnavailable}
                  onClick={() => {
                    const wasAdded = addItem({
                      productId: product.id,
                      title: product.title,
                      price: numericPrice,
                      image: imageSrc,
                      stock: availableStock,
                    })

                    if (!wasAdded) {
                      toast.error("Estoque insuficiente")
                      return
                    }

                    toast.success("Produto adicionado", {
                      description: product.title,
                    })
                  }}
                  className="self-center rounded-full bg-[#B89535] p-3 text-black transition hover:bg-[#A7832E] disabled:cursor-not-allowed disabled:bg-[#D8D2C8] disabled:text-[#6F6A63] md:px-4"
                  aria-label={`Adicionar ${product.title} ao carrinho`}
                >
                  <ShoppingBag size={18} />
                </button>
              </div>
            )
          })}

          {productsToShow.length === 0 && (
            <div className="rounded-2xl bg-[#F8F6F2] px-6 py-10 text-center">
              <p className="font-semibold text-[#1A1A1A]">
                Nenhum produto encontrado.
              </p>
              <p className="mt-2 text-sm text-[#6F6A63]">
                Tente buscar por categoria, nome do produto ou valor.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
