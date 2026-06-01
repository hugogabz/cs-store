"use client"

import Link from "next/link"
import { X } from "lucide-react"
import { useCartStore } from "@/store/cart-store"
import { formatCurrency, toNumberPrice } from "@/utils/currency"

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    increaseQuantity,
    decreaseQuantity,
  } = useCartStore()

  const total = items.reduce((acc, item) => {
    return acc + toNumberPrice(item.price) * item.quantity
  }, 0)

  return (
    <>
      <div
        onClick={closeCart}
        className={`fixed inset-0 z-40 bg-black/40 transition ${
          isOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
      />

      <div
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-neutral-200 p-6">
          <h2 className="text-2xl font-bold">
            Seu Carrinho
          </h2>

          <button
            onClick={closeCart}
            className="rounded-full p-2 transition hover:bg-neutral-100"
          >
            <X />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {items.length === 0 && (
            <p className="text-neutral-500">
              Seu carrinho está vazio.
            </p>
          )}

          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4"
            >
              <img
                src={item.image}
                alt={item.title}
                className="h-24 w-24 rounded-2xl object-cover"
              />

              <div className="flex flex-1 flex-col">
                <h3 className="font-semibold">
                  {item.title}
                </h3>

                <div className="mt-3 flex items-center gap-3">
                  <button
                    onClick={() => decreaseQuantity(item.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border"
                  >
                    -
                  </button>

                  <span className="font-medium">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() => increaseQuantity(item.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border"
                  >
                    +
                  </button>
                </div>

                <p className="mt-2 text-[#D4AF37]">
                  {formatCurrency(item.price)}
                </p>

                <button
                  onClick={() => removeItem(item.id)}
                  className="mt-auto text-left text-sm text-red-500"
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-neutral-200 p-6 pb-28 md:pb-6">
          <div className="mb-6 flex items-center justify-between">
            <span className="text-lg">
              Total
            </span>

            <span className="text-2xl font-bold">
              {formatCurrency(total)}
            </span>
          </div>

          <Link
            href="/checkout"
            className="block w-full rounded-full bg-[#D4AF37] py-4 text-center font-semibold text-black transition hover:scale-[1.02]"
          >
            Finalizar Compra
          </Link>
        </div>
      </div>
    </>
  )
}
