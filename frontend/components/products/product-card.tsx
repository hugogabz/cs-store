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
      <div className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-[#E7E1D8] bg-white shadow-[0_10px_30px_rgba(26,26,26,0.04)] transition duration-300 hover:border-[#D8CBB9] hover:shadow-[0_14px_34px_rgba(26,26,26,0.07)]">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#F8F6F2]">
          <Image
            src={imageSrc}
            alt={title}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 44vw"
            className="object-contain p-3 transition duration-500 group-hover:scale-[1.01] md:p-4"
          />
        </div>

        <div className="flex flex-1 flex-col p-4 md:p-5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#B89535]">
            {category}
          </span>

          <h3 className="mt-2.5 line-clamp-2 min-h-12 text-base font-semibold leading-tight text-[#1A1A1A] md:text-lg">
            {title}
          </h3>

          <div className="mt-auto pt-5">
            <p className="text-base font-semibold tracking-tight text-[#1A1A1A] md:text-lg">
              {formatCurrency(numericPrice)}
            </p>

            <p
              className={`mt-2 text-xs font-semibold ${
                isUnavailable
                  ? "text-red-500"
                  : availableStock <= 5
                    ? "text-[#B89535]"
                    : "text-emerald-700"
              }`}
            >
              {stockLabel}
            </p>
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
              className="mt-4 w-full rounded-full bg-[#B89535] px-4 py-3 text-sm font-semibold text-black transition hover:bg-[#A7832E] disabled:cursor-not-allowed disabled:bg-[#D8D2C8] disabled:text-[#6F6A63]"
            >
              {isUnavailable ? "Indisponível" : "Comprar"}
            </button>

            <button
              type="button"
              onClick={() => setIsDetailOpen(true)}
              className="mt-2 w-full py-1.5 text-sm font-semibold text-[#6F6A63] transition hover:text-[#B89535]"
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
