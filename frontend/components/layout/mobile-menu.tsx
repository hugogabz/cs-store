"use client"

import { useState } from "react"
import { ChevronDown, Grid2X2, House, ShoppingBag, User } from "lucide-react"
import { useCartStore } from "@/frontend/store/cart-store"
import { storeCategories } from "@/shared/utils/categories"

export function MobileMenu() {
  const [active, setActive] = useState("inicio")
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false)

  const openCart = useCartStore((state) => state.openCart)
  const closeCart = useCartStore((state) => state.closeCart)
  const items = useCartStore((state) => state.items)
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0)

  function handleNavigate(section: string) {
    setActive(section)
    setIsCategoryMenuOpen(false)
    closeCart()
  }

  function handleCart() {
    setActive("carrinho")
    setIsCategoryMenuOpen(false)
    openCart()
  }

  function handleProductsMenu() {
    setActive("produtos")
    closeCart()
    setIsCategoryMenuOpen((current) => !current)
  }

  const itemClass = (name: string) =>
    `relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold transition duration-300 ${
      active === name
        ? "bg-[#B89535]/12 text-[#8A6800]"
        : "text-neutral-500 hover:bg-neutral-50 hover:text-[#1A1A1A]"
    }`

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] border-t border-neutral-200 bg-white/95 shadow-[0_-10px_28px_rgba(0,0,0,0.08)] backdrop-blur md:hidden">
      {isCategoryMenuOpen && (
        <div className="mx-auto mb-2 max-h-[54dvh] max-w-md overflow-y-auto rounded-t-2xl border-x border-t border-[#E7E1D8] bg-white p-3 shadow-[0_-18px_50px_rgba(26,26,26,0.12)]">
          <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#B89535]">
            Categorias
          </p>

          <div className="space-y-2">
            {storeCategories.map((category) => (
              <details key={category.id} className="group rounded-2xl border border-[#E7E1D8]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-[#1A1A1A]">
                  <a
                    href={`#${category.id}`}
                    onClick={() => handleNavigate(category.id)}
                    className="min-w-0 flex-1"
                  >
                    {category.name}
                  </a>
                  {category.subcategories.length > 0 && (
                    <ChevronDown size={17} className="shrink-0 transition group-open:rotate-180" />
                  )}
                </summary>

                {category.subcategories.length > 0 && (
                  <div className="border-t border-[#E7E1D8] px-2 py-2">
                    {category.subcategories.map((subcategory) => (
                      <a
                        key={subcategory}
                        href={`/categoria/${category.slug}?subcategoria=${encodeURIComponent(subcategory)}`}
                        onClick={() => setIsCategoryMenuOpen(false)}
                        className="block rounded-xl px-3 py-2.5 text-sm text-[#5C5C5C] transition hover:bg-[#F8F6F2] hover:text-[#B89535]"
                      >
                        {subcategory}
                      </a>
                    ))}
                  </div>
                )}
              </details>
            ))}
          </div>
        </div>
      )}

      <div className="mx-auto grid h-[78px] max-w-md grid-cols-4 items-center gap-1 px-2 pb-[env(safe-area-inset-bottom)]">
        <a
          href="#inicio"
          onClick={() => handleNavigate("inicio")}
          className={itemClass("inicio")}
        >
          <House size={21} />
          Home
          {active === "inicio" && (
            <span className="absolute bottom-0 h-1 w-7 rounded-full bg-[#B89535]" />
          )}
        </a>

        <button
          type="button"
          onClick={handleProductsMenu}
          className={itemClass("produtos")}
        >
          <Grid2X2 size={21} />
          Produtos
          {active === "produtos" && (
            <span className="absolute bottom-0 h-1 w-7 rounded-full bg-[#B89535]" />
          )}
        </button>

        <button
          onClick={handleCart}
          className={itemClass("carrinho")}
        >
          <div className="relative">
            <ShoppingBag size={21} />

            {cartCount > 0 && (
              <span className="absolute -right-3 -top-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </div>

          Carrinho

          {active === "carrinho" && (
            <span className="absolute bottom-0 h-1 w-7 rounded-full bg-[#B89535]" />
          )}
        </button>

        <a
          href="/meus-pedidos"
          onClick={() => handleNavigate("conta")}
          className={itemClass("conta")}
        >
          <User size={21} />
          Pedidos
          {active === "conta" && (
            <span className="absolute bottom-0 h-1 w-7 rounded-full bg-[#B89535]" />
          )}
        </a>
      </div>
    </div>
  )
}
