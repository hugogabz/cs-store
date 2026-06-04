"use client"

import { useState } from "react"
import { Grid2X2, House, Mail, ShoppingBag } from "lucide-react"
import { useCartStore } from "@/frontend/store/cart-store"

export function MobileMenu() {
  const [active, setActive] = useState("inicio")

  const openCart = useCartStore((state) => state.openCart)
  const closeCart = useCartStore((state) => state.closeCart)
  const items = useCartStore((state) => state.items)
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0)

  function handleNavigate(section: string) {
    setActive(section)
    closeCart()
  }

  function handleCart() {
    setActive("carrinho")
    openCart()
  }

  const itemClass = (name: string) =>
    `relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold transition duration-300 ${
      active === name
        ? "bg-[#B89535]/12 text-[#8A6800]"
        : "text-neutral-500 hover:bg-neutral-50 hover:text-[#1A1A1A]"
    }`

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] border-t border-neutral-200 bg-white/95 shadow-[0_-10px_28px_rgba(0,0,0,0.08)] backdrop-blur md:hidden">
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

        <a
          href="#destaques"
          onClick={() => handleNavigate("produtos")}
          className={itemClass("produtos")}
        >
          <Grid2X2 size={21} />
          Produtos
          {active === "produtos" && (
            <span className="absolute bottom-0 h-1 w-7 rounded-full bg-[#B89535]" />
          )}
        </a>

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
          href="#footer"
          onClick={() => handleNavigate("conta")}
          className={itemClass("conta")}
        >
          <Mail size={21} />
          Contato
          {active === "conta" && (
            <span className="absolute bottom-0 h-1 w-7 rounded-full bg-[#B89535]" />
          )}
        </a>
      </div>
    </div>
  )
}
