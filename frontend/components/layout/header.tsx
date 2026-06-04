"use client"

import { useState } from "react"
import { Search, ShoppingBag, User } from "lucide-react"
import { useCartStore } from "@/frontend/store/cart-store"
import { SearchModal } from "@/frontend/components/layout/search-modal"

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const openCart = useCartStore((state) => state.openCart)
  const items = useCartStore((state) => state.items)
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0)

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 md:px-8">
          <a
            href="#inicio"
            className="logo-font text-3xl font-bold text-[#B89535] transition hover:text-[#A7832E] md:text-4xl"
          >
            CS Store
          </a>

          <nav className="hidden gap-10 text-sm font-medium md:flex">
            <a href="#cabelos" className="transition hover:text-[#B89535]">
              Cabelos
            </a>

            <a href="#cosmeticos" className="transition hover:text-[#B89535]">
              Cosméticos
            </a>

            <a href="#acessorios" className="transition hover:text-[#B89535]">
              Acessórios
            </a>
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
