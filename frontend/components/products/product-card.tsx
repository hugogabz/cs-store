"use client"

import Image from "next/image"
import { useState } from "react"
import { ProductDetailModal } from "@/frontend/components/products/product-detail-modal"
import { useCartStore } from "@/frontend/store/cart-store"
import { formatCurrency, toNumberPrice } from "@/shared/utils/currency"
import { normalizeProductImageSrc } from "@/shared/utils/images"
import { toast } from "sonner"

type ProductCardProps = {
  id?: string
  title: string
  description?: string | null
  category: string
  price: string | number
  image: string
  stock: number
  rating?: number
  ratingCount?: number
}

export function ProductCard({
  id,
  title,
  description,
  category,
  price,
  image,
  stock = 0,
  rating = 4.8,
  ratingCount = 0,
}: ProductCardProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const addItem = useCartStore((state) => state.addItem)
  const imageSrc = normalizeProductImageSrc(image)
  const numericPrice = toNumberPrice(price)
  const availableStock = Math.max(0, Math.floor(Number(stock) || 0))
  const isUnavailable = availableStock === 0
  const stockLabel = isUnavailable
    ? "Produto indisponível"
    : availableStock <= 5
      ? "Últimas unidades"
      : "Em estoque"

  return (
    <>
      <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#E7E1D8] bg-white shadow-[0_8px_24px_rgba(26,26,26,0.035)] transition duration-300 hover:border-[#D8CBB9] hover:shadow-[0_12px_30px_rgba(26,26,26,0.06)]">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#F8F6F2]">
          <Image
            src={imageSrc}
            alt={title}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 44vw"
            className="object-contain p-2.5 transition duration-500 group-hover:scale-[1.01] md:p-3"
          />
        </div>

        <div className="flex flex-1 flex-col space-y-2 p-3 md:space-y-2.5 md:p-4">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#B89535] md:text-[11px]">
            {category}
          </span>

          <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-tight text-[#1A1A1A] md:min-h-11 md:text-lg">
            {title}
          </h3>

          <p className="text-sm font-semibold tracking-tight text-[#1A1A1A] md:text-base">
            {formatCurrency(numericPrice)}
          </p>

          <p
            className={`text-xs font-semibold ${
              isUnavailable
                ? "text-red-500"
                : availableStock <= 5
                  ? "text-[#B89535]"
                  : "text-emerald-700"
            }`}
          >
            {stockLabel}
          </p>

          <div className="mt-auto flex flex-col gap-2 pt-1">
            <button
              disabled={isUnavailable}
              onClick={() => {
                const wasAdded = addItem({
                  productId: id,
                  title,
                  price: numericPrice,
                  image: imageSrc,
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
              className="w-full rounded-full bg-[#B89535] px-3 py-2.5 text-xs font-semibold text-black transition hover:bg-[#A7832E] disabled:cursor-not-allowed disabled:bg-[#D8D2C8] disabled:text-[#6F6A63] md:px-4 md:text-sm"
            >
              {isUnavailable ? "Indisponível" : "Comprar"}
            </button>

            <button
              type="button"
              onClick={() => setIsDetailOpen(true)}
              className="py-1 text-xs font-semibold text-[#6F6A63] transition hover:text-[#B89535] md:text-sm"
            >
              Ver detalhes
            </button>
          </div>
        </div>
      </div>

      <ProductDetailModal
        category={category}
        description={description}
        image={imageSrc}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        price={numericPrice}
        rating={rating}
        ratingCount={ratingCount}
        stock={availableStock}
        productId={id}
        title={title}
      />
    </>
  )
}
