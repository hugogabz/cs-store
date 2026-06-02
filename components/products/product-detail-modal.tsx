"use client"

import Image from "next/image"
import { X } from "lucide-react"
import { toast } from "sonner"
import { useCartStore } from "@/store/cart-store"
import { formatCurrency, toNumberPrice } from "@/utils/currency"
import { normalizeProductImageSrc } from "@/utils/images"

type ProductDetailModalProps = {
  category: string
  description?: string | null
  image: string
  isOpen: boolean
  onClose: () => void
  price: string | number
  title: string
}

export function ProductDetailModal({
  category,
  description,
  image,
  isOpen,
  onClose,
  price,
  title,
}: ProductDetailModalProps) {
  const addItem = useCartStore((state) => state.addItem)

  if (!isOpen) return null

  const imageSrc = normalizeProductImageSrc(image)
  const numericPrice = toNumberPrice(price)

  return (
    <div
      className="fixed inset-0 z-[90] bg-black/45 p-3 backdrop-blur-sm md:p-6"
      onClick={onClose}
    >
      <div
        className="mx-auto flex max-h-[calc(100dvh-24px)] max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-[0_24px_70px_rgba(0,0,0,0.18)] md:max-h-[calc(100dvh-48px)] md:grid md:grid-cols-[0.95fr_1.05fr]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative min-h-72 bg-[#F8F6F2] md:min-h-[520px]">
          <Image
            src={imageSrc}
            alt={title}
            fill
            sizes="(min-width: 768px) 45vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="flex min-h-0 flex-col overflow-y-auto p-5 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#B89535]">
              {category}
            </span>

            <button
              onClick={onClose}
              className="rounded-full border border-[#E7E1D8] p-2 text-[#1A1A1A] transition hover:border-[#B89535] hover:text-[#B89535]"
              aria-label="Fechar detalhes do produto"
            >
              <X size={18} />
            </button>
          </div>

          <h2 className="mt-5 text-3xl font-semibold leading-tight text-[#1A1A1A] md:text-4xl">
            {title}
          </h2>

          <p className="mt-4 text-2xl font-semibold tracking-tight text-[#1A1A1A]">
            {formatCurrency(numericPrice)}
          </p>

          <div className="mt-6 border-t border-[#E7E1D8] pt-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8A8A8A]">
              Descrição
            </h3>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#4F4A44] md:text-base">
              {description?.trim() ||
                "Este produto ainda não possui descrição cadastrada."}
            </p>
          </div>

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
            className="mt-8 rounded-full bg-[#B89535] px-6 py-3.5 font-semibold text-black transition hover:bg-[#A7832E]"
          >
            Adicionar ao carrinho
          </button>
        </div>
      </div>
    </div>
  )
}
