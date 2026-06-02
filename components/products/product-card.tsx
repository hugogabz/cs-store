"use client"

import Image from "next/image"
import { useState } from "react"
import { ProductDetailModal } from "@/components/products/product-detail-modal"
import { useCartStore } from "@/store/cart-store"
import { formatCurrency, toNumberPrice } from "@/utils/currency"
import { normalizeProductImageSrc } from "@/utils/images"
import { toast } from "sonner"

type ProductCardProps = {
  title: string
  description?: string | null
  category: string
  price: string | number
  image: string
}

export function ProductCard({
  title,
  description,
  category,
  price,
  image,
}: ProductCardProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const addItem = useCartStore((state) => state.addItem)
  const imageSrc = normalizeProductImageSrc(image)
  const numericPrice = toNumberPrice(price)

  return (
    <>
      <div className="group overflow-hidden rounded-2xl border border-[#E7E1D8] bg-white shadow-[0_10px_30px_rgba(26,26,26,0.04)] transition duration-300 hover:border-[#D8CBB9] hover:shadow-[0_14px_34px_rgba(26,26,26,0.07)]">
        <div className="relative h-40 overflow-hidden bg-[#F8F6F2] sm:h-44 md:h-52">
          <Image
            src={imageSrc}
            alt={title}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 44vw"
            className="object-cover transition duration-500 group-hover:scale-[1.01]"
          />
        </div>

        <div className="space-y-2.5 p-3.5 md:p-4">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#B89535] md:text-[11px]">
            {category}
          </span>

          <h3 className="min-h-11 text-base font-semibold leading-tight text-[#1A1A1A] md:text-lg">
            {title}
          </h3>

          <p className="text-sm font-semibold tracking-tight text-[#1A1A1A] md:text-base">
            {formatCurrency(numericPrice)}
          </p>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                addItem({
                  title,
                  price: numericPrice,
                  image: imageSrc,
                })

                toast.success("Produto adicionado", {
                  description: title,
                })
              }}
              className="w-full rounded-full bg-[#B89535] px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-[#A7832E]"
            >
              Comprar
            </button>

            <button
              type="button"
              onClick={() => setIsDetailOpen(true)}
              className="text-sm font-semibold text-[#6F6A63] transition hover:text-[#B89535]"
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
        title={title}
      />
    </>
  )
}
