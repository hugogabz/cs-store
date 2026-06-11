"use client"

import { useState } from "react"
import { ChevronDown, Search, ShoppingBag, User } from "lucide-react"
import { useCartStore } from "@/frontend/store/cart-store"
import { SearchModal } from "@/frontend/components/layout/search-modal"
import { storeCategories } from "@/shared/utils/categories"

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const openCart = useCartStore((state) => state.openCart)
  const items = useCartStore((state) => state.items)
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0)

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:h-20 md:px-8">
          <a
            href="#inicio"
            className="logo-font text-2xl font-bold text-[#B89535] transition hover:text-[#A7832E] md:text-4xl"
          >
            CS Store
          </a>

          <button
            onClick={() => setIsSearchOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#E7E1D8] text-[#1A1A1A] transition hover:border-[#B89535] hover:text-[#B89535] md:hidden"
            aria-label="Buscar produtos"
          >
            <Search size={20} />
          </button>

          <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
            {storeCategories.map((category) => (
              <div key={category.id} className="group relative">
                <a
                  href={`#${category.id}`}
                  className="inline-flex items-center gap-1.5 py-7 transition hover:text-[#B89535]"
                >
                  {category.name}
                  {category.subcategories.length > 0 && (
                    <ChevronDown size={15} className="transition group-hover:rotate-180" />
                  )}
                </a>

                {category.subcategories.length > 0 && (
                  <div className="pointer-events-none absolute left-1/2 top-full w-64 -translate-x-1/2 translate-y-2 rounded-2xl border border-[#E7E1D8] bg-white p-2 opacity-0 shadow-[0_18px_50px_rgba(26,26,26,0.12)] transition duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
                    <a
                      href={`#${category.id}`}
                      className="block rounded-xl px-4 py-3 font-semibold text-[#1A1A1A] transition hover:bg-[#F8F6F2] hover:text-[#B89535]"
                    >
                      Todos em {category.name}
                    </a>

                    {category.subcategories.map((subcategory) => (
                      <a
                        key={subcategory}
                        href={`/categoria/${category.slug}?subcategoria=${encodeURIComponent(subcategory)}`}
                        className="block rounded-xl px-4 py-3 text-[#5C5C5C] transition hover:bg-[#F8F6F2] hover:text-[#B89535]"
                      >
                        {subcategory}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="hidden items-center gap-4 md:flex">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="rounded-full p-3 transition hover:bg-neutral-100 hover:text-[#B89535]"
              aria-label="Buscar produtos"
            >
              <Search size={20} />
            </button>

            <button
              className="rounded-full p-3 transition hover:bg-neutral-100 hover:text-[#B89535]"
              aria-label="Área do cliente"
            >
              <User size={20} />
            </button>

            <button
              onClick={openCart}
              className="relative rounded-full bg-[#B89535] p-3 text-black transition hover:bg-[#A7832E]"
              aria-label="Abrir carrinho"
            >
              <ShoppingBag size={20} />

              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-xs text-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  )
}
