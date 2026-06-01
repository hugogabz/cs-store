"use client"

import { Search, X } from "lucide-react"
import { useState } from "react"
import {
  accessoryProducts,
  cosmeticProducts,
  featuredProducts,
  hairProducts,
} from "@/data/products"

const allProducts = [
  ...featuredProducts,
  ...hairProducts,
  ...cosmeticProducts,
  ...accessoryProducts,
]

type SearchModalProps = {
  isOpen: boolean
  onClose: () => void
}

export function SearchModal({
  isOpen,
  onClose,
}: SearchModalProps) {
  const [search, setSearch] = useState("")

  const normalizedSearch = search
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")

  const filteredProducts = allProducts.filter((product) => {
    const searchableText = `
      ${product.title}
      ${product.category}
      ${product.price}
    `
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")

    return searchableText.includes(normalizedSearch)
  })

  const productsToShow =
    normalizedSearch.length === 0
      ? allProducts
      : filteredProducts

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[80] bg-black/40 p-4 backdrop-blur-sm">
      <div className="mx-auto mt-24 max-w-2xl rounded-[32px] bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center gap-4">
          <Search className="text-[#B28A22]" />

          <input
            autoFocus
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar produtos..."
            className="flex-1 bg-transparent text-lg outline-none"
          />

          <button
            onClick={onClose}
            className="rounded-full p-2 transition hover:bg-neutral-100"
          >
            <X />
          </button>
        </div>

        <div className="max-h-[420px] space-y-4 overflow-y-auto">
          {productsToShow.map((product, index) => (
            <div
              key={`${product.title}-${product.category}-${index}`}
              className="flex items-center gap-4 rounded-2xl p-3 transition hover:bg-[#F8F6F2]"
            >
              <img
                src={product.image}
                alt={product.title}
                className="h-16 w-16 rounded-2xl object-cover"
              />

              <div>
                <h3 className="font-semibold text-[#1A1A1A]">
                  {product.title}
                </h3>

                <p className="text-sm text-[#B28A22]">
                  {product.category} • {product.price}
                </p>
              </div>
            </div>
          ))}

          {productsToShow.length === 0 && (
            <p className="py-10 text-center text-neutral-500">
              Nenhum produto encontrado.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}