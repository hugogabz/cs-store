"use client"

import Image from "next/image"
import { useCartStore } from "@/store/cart-store"
import { formatCurrency, toNumberPrice } from "@/utils/currency"
import { normalizeProductImageSrc } from "@/utils/images"
import { toast } from "sonner"

type ProductCardProps = {
  title: string
  category: string
  price: string | number
  image: string
}

export function ProductCard({
  title,
  category,
  price,
  image,
}: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem)
  const imageSrc = normalizeProductImageSrc(image)
  const numericPrice = toNumberPrice(price)

  return (
    <div className="group overflow-hidden rounded-2xl border border-[#E7E1D8] bg-white shadow-[0_10px_30px_rgba(26,26,26,0.04)] transition duration-300 hover:border-[#D8CBB9] hover:shadow-[0_14px_34px_rgba(26,26,26,0.07)]">
      <div className="relative h-52 overflow-hidden bg-[#F8F6F2] md:h-60">
        <Image
          src={imageSrc}
          alt={title}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 78vw"
          className="object-cover transition duration-500 group-hover:scale-[1.01]"
        />
      </div>

      <div className="space-y-3 p-4 md:p-5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#B89535]">
          {category}
        </span>

        <h3 className="min-h-12 text-lg font-semibold leading-tight text-[#1A1A1A] md:text-xl">
          {title}
        </h3>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-base font-semibold tracking-tight text-[#1A1A1A] md:text-lg">
            {formatCurrency(numericPrice)}
          </p>

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
            className="w-full rounded-full bg-[#B89535] px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-[#A7832E] sm:w-auto md:px-5"
          >
            Comprar
          </button>
        </div>
      </div>
    </div>
  )
}
