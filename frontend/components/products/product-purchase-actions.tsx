"use client"

import { ShoppingBag } from "lucide-react"
import { toast } from "sonner"
import { useCartStore } from "@/frontend/store/cart-store"
import { formatCurrency } from "@/shared/utils/currency"

type ProductPurchaseActionsProps = {
  image: string
  price: number
  productId: string
  stock: number
  title: string
}

export function ProductPurchaseActions({
  image,
  price,
  productId,
  stock,
  title,
}: ProductPurchaseActionsProps) {
  const addItem = useCartStore((state) => state.addItem)
  const availableStock = Math.max(0, Math.floor(Number(stock) || 0))
  const isUnavailable = availableStock === 0

  return (
    <div className="rounded-2xl border border-[#E7E1D8] bg-white p-4 shadow-[0_12px_34px_rgba(26,26,26,0.04)]">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-[#6F6A63]">Total</span>
        <span className="text-xl font-semibold text-[#1A1A1A]">
          {formatCurrency(price)}
        </span>
      </div>

      <button
        type="button"
        disabled={isUnavailable}
        onClick={() => {
          const wasAdded = addItem({
            productId,
            title,
            price,
            image,
            stock: availableStock,
          })

          if (!wasAdded) {
            toast.error("Estoque insuficiente")
            return
          }

          toast.success("Produto adicionado", {
            description: title,
          })
        }}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#B89535] px-6 py-3.5 font-semibold text-black transition hover:bg-[#A7832E] disabled:cursor-not-allowed disabled:bg-[#D8D2C8] disabled:text-[#6F6A63]"
      >
        <ShoppingBag size={19} />
        {isUnavailable ? "Produto indisponível" : "Adicionar ao carrinho"}
      </button>
    </div>
  )
}
