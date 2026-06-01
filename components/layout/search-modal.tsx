"use client"

import Image from "next/image"
import { Search, X } from "lucide-react"
import { useEffect, useState } from "react"

type Product = {
  id: string
  title: string
  category: string
  price: number
  image: string
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

  useEffect(() => {
    if (!isOpen || products.length > 0) return

    let ignore = false

    void fetch("/api/products")
      .then((response) => response.json())
      .then((data) => {
        if (!ignore) {
          setProducts(data)
        }
      })

    return () => {
      ignore = true
    }
  }, [isOpen, products.length])

  const normalizedSearch = search
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")

  const filteredProducts = products.filter((product) => {
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
      ? products
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
          {productsToShow.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-4 rounded-2xl p-3 transition hover:bg-[#F8F6F2]"
            >
              <Image
                src={product.image}
                alt={product.title}
                width={64}
                height={64}
                className="h-16 w-16 rounded-2xl object-cover"
              />

              <div>
                <h3 className="font-semibold text-[#1A1A1A]">
                  {product.title}
                </h3>

                <p className="text-sm text-[#B28A22]">
                  {product.category}{" "}
                  {product.price.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
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
