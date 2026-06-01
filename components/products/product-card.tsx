"use client"

import { useCartStore } from "@/store/cart-store"
import { formatCurrency, toNumberPrice } from "@/utils/currency"
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

  return (
    <div className="group overflow-hidden rounded-3xl border border-[#E7E1D8] bg-white shadow-sm transition hover:shadow-lg">
      <div className="overflow-hidden bg-[#F8F6F2]">
        <img
          src={image}
          alt={title}
          className="h-64 w-full object-cover transition duration-300 group-hover:scale-[1.03] md:h-80"
        />
      </div>

      <div className="space-y-3 p-5 md:p-6">
        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#B28A22]">
          {category}
        </span>

        <h3 className="min-h-[56px] text-xl font-semibold leading-tight text-[#1A1A1A] md:text-2xl">
          {title}
        </h3>

        <div className="flex items-center justify-between gap-3">
          <p className="text-lg font-bold text-[#1A1A1A] md:text-xl">
            {formatCurrency(price)}
          </p>

          <button
            onClick={() => {
              addItem({
                title,
                price: toNumberPrice(price),
                image,
              })

              toast.success("Produto adicionado", {
                description: title,
              })
            }}
            className="rounded-full bg-[#D4AF37] px-4 py-2 text-sm font-semibold text-black transition hover:bg-[#C89B2C] md:px-5"
          >
            Comprar
          </button>
        </div>
      </div>
    </div>
  )
}
