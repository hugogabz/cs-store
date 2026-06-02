"use client"

import { useState } from "react"
import { House, Grid2X2, ShoppingBag, User } from "lucide-react"
import { useCartStore } from "@/store/cart-store"

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
    `relative flex flex-col items-center gap-1 text-xs transition duration-300 ${
      active === name
        ? "scale-105 text-[#B89535]"
        : "text-neutral-500"
    }`

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] border-t border-neutral-200 bg-white shadow-[0_-12px_30px_rgba(0,0,0,0.08)] md:hidden">
      <div className="flex h-[76px] items-center justify-around bg-white px-2">
        <a
          href="#inicio"
          onClick={() => handleNavigate("inicio")}
          className={itemClass("inicio")}
        >
          <House size={21} />
          Home
          {active === "inicio" && (
            <span className="absolute -bottom-2 h-1 w-8 rounded-full bg-[#B89535]" />
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
            <span className="absolute -bottom-2 h-1 w-8 rounded-full bg-[#B89535]" />
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
            <span className="absolute -bottom-2 h-1 w-8 rounded-full bg-[#B89535]" />
          )}
        </button>

        <a
          href="#footer"
          onClick={() => handleNavigate("conta")}
          className={itemClass("conta")}
        >
          <User size={21} />
          Conta
          {active === "conta" && (
            <span className="absolute -bottom-2 h-1 w-8 rounded-full bg-[#B89535]" />
          )}
        </a>
      </div>
    </div>
  )
}
