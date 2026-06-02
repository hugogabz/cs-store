"use client"

import Image from "next/image"
import Link from "next/link"
import { X } from "lucide-react"
import { toast } from "sonner"
import { useCartStore } from "@/store/cart-store"
import { formatCurrency, toNumberPrice } from "@/utils/currency"
import { normalizeProductImageSrc } from "@/utils/images"

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
    return acc + toNumberPrice(item.price) * Math.max(1, item.quantity)
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
        <div className="flex items-center justify-between border-b border-neutral-200 p-5 md:p-6">
          <div>
            <h2 className="text-2xl font-bold text-[#1A1A1A]">
              Seu carrinho
            </h2>
            <p className="mt-1 text-sm text-[#6F6A63]">
              Revise os produtos antes do checkout.
            </p>
          </div>

          <button
            onClick={closeCart}
            className="rounded-full p-2 transition hover:bg-neutral-100"
            aria-label="Fechar carrinho"
          >
            <X />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5 md:p-6">
          {items.length === 0 && (
            <div className="rounded-3xl border border-dashed border-[#D8CBB9] bg-[#F8F6F2] p-6 text-center">
              <p className="font-semibold text-[#1A1A1A]">
                Seu carrinho está vazio.
              </p>
              <p className="mt-2 text-sm text-[#6F6A63]">
                Adicione produtos da loja para revisar seu pedido aqui.
              </p>
              <button
                onClick={closeCart}
                className="mt-5 rounded-full bg-[#D4AF37] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#C89B2C]"
              >
                Continuar comprando
              </button>
            </div>
          )}

          {items.map((item) => {
            const quantity = Math.max(1, item.quantity)
            const stock = Number(item.stock)
            const hasLimitedStock = Number.isFinite(stock)
            const isAtStockLimit = hasLimitedStock && quantity >= stock

            return (
              <div
                key={item.id}
                className="flex gap-4 rounded-3xl border border-[#E7E1D8] p-3"
              >
                <Image
                  src={normalizeProductImageSrc(item.image)}
                  alt={item.title}
                  width={96}
                  height={96}
                  className="h-24 w-24 shrink-0 rounded-2xl object-cover"
                />

                <div className="flex min-w-0 flex-1 flex-col">
                  <h3 className="line-clamp-2 font-semibold text-[#1A1A1A]">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm font-semibold text-[#B28A22]">
                    {formatCurrency(item.price)}
                  </p>

                  {hasLimitedStock && (
                    <p className="mt-1 text-xs text-[#6F6A63]">
                      Estoque: {Math.max(0, stock)} unidades
                    </p>
                  )}

                  <div className="mt-3 flex items-center gap-3">
                    <button
                      onClick={() => decreaseQuantity(item.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E7E1D8] transition hover:border-[#D4AF37]"
                      aria-label={`Diminuir quantidade de ${item.title}`}
                    >
                      -
                    </button>

                    <span className="min-w-5 text-center font-medium">
                      {quantity}
                    </span>

                    <button
                      onClick={() => {
                        const wasIncreased = increaseQuantity(item.id)

                        if (!wasIncreased) {
                          toast.error("Estoque insuficiente")
                        }
                      }}
                      className={`flex h-8 w-8 items-center justify-center rounded-full border border-[#E7E1D8] transition hover:border-[#D4AF37] ${
                        isAtStockLimit ? "cursor-not-allowed opacity-40" : ""
                      }`}
                      aria-label={`Aumentar quantidade de ${item.title}`}
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="mt-3 text-left text-sm text-red-500 transition hover:text-red-600"
                  >
                    Remover
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="border-t border-neutral-200 p-5 pb-28 md:p-6">
          <div className="mb-5 flex items-center justify-between">
            <span className="text-lg text-[#5C5C5C]">
              Total
            </span>

            <span className="text-2xl font-bold text-[#1A1A1A]">
              {formatCurrency(total)}
            </span>
          </div>

          <Link
            href="/checkout"
            onClick={closeCart}
            className="block w-full rounded-full bg-[#D4AF37] py-4 text-center font-semibold text-black transition hover:bg-[#C89B2C]"
          >
            Finalizar Compra
          </Link>
        </div>
      </div>
    </>
  )
}
