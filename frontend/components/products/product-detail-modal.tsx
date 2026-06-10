"use client"

import Image from "next/image"
import { X } from "lucide-react"
import { toast } from "sonner"
import { useCartStore } from "@/frontend/store/cart-store"
import { formatCurrency, toNumberPrice } from "@/shared/utils/currency"
import { normalizeProductImageSrc } from "@/shared/utils/images"

type ProductDetailModalProps = {
  category: string
  description?: string | null
  image: string
  isOpen: boolean
  onClose: () => void
  price: string | number
  productId?: string
  rating?: number
  ratingCount?: number
  stock: number
  title: string
}

export function ProductDetailModal({
  category,
  description,
  image,
  isOpen,
  onClose,
  price,
  productId,
  rating = 4.8,
  ratingCount = 0,
  stock = 0,
  title,
}: ProductDetailModalProps) {
  const addItem = useCartStore((state) => state.addItem)

  if (!isOpen) return null

  const imageSrc = normalizeProductImageSrc(image)
  const numericPrice = toNumberPrice(price)
  const availableStock = Math.max(0, Math.floor(Number(stock) || 0))
  const isUnavailable = availableStock === 0
  const displayRating = Math.min(5, Math.max(4, Number(rating) || 4.8))
  const displayRatingCount = Math.max(0, Math.floor(Number(ratingCount) || 0))
  const stockLabel = isUnavailable
    ? "Produto indisponível"
    : availableStock <= 5
      ? "Últimas unidades"
      : "Em estoque"

  return (
    <div
      className="fixed inset-0 z-[90] bg-black/45 p-3 pb-24 backdrop-blur-sm md:p-6"
      onClick={onClose}
    >
      <div
        className="mx-auto flex max-h-[calc(100dvh-108px)] max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-[0_24px_70px_rgba(0,0,0,0.18)] md:max-h-[calc(100dvh-48px)] md:grid md:grid-cols-[0.95fr_1.05fr]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative mx-auto aspect-square w-full max-w-[38dvh] shrink-0 overflow-hidden rounded-2xl bg-[#F8F6F2] md:max-h-none md:max-w-none md:self-center">
          <Image
            src={imageSrc}
            alt={title}
            fill
            sizes="(min-width: 768px) 45vw, 100vw"
            className="object-contain p-4 md:p-6"
          />
        </div>

        <div className="flex min-h-0 flex-col overflow-y-auto p-4 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#B89535]">
              {category}
            </span>

            <button
              onClick={onClose}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#E7E1D8] text-[#1A1A1A] transition hover:border-[#B89535] hover:text-[#B89535]"
              aria-label="Fechar detalhes do produto"
            >
              <X size={18} />
            </button>
          </div>

          <h2 className="mt-4 text-2xl font-semibold leading-tight text-[#1A1A1A] md:mt-5 md:text-4xl">
            {title}
          </h2>

          <p className="mt-3 text-xl font-semibold tracking-tight text-[#1A1A1A] md:mt-4 md:text-2xl">
            {formatCurrency(numericPrice)}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold tracking-[0.08em] text-[#B89535]">
              ★★★★★
            </span>

            <span className="text-sm text-[#5C5C5C]">
              {displayRating.toFixed(1)} ({displayRatingCount} avaliações)
            </span>
          </div>

          <div className="mt-5 rounded-2xl border border-[#E7E1D8] bg-[#F8F6F2] p-4">
            <p
              className={`text-sm font-semibold ${
                isUnavailable
                  ? "text-red-500"
                  : availableStock <= 5
                    ? "text-[#B89535]"
                    : "text-emerald-700"
              }`}
            >
              {stockLabel}
            </p>

            <p className="mt-1 text-sm text-[#5C5C5C]">
              Estoque: {availableStock} unidades
            </p>
          </div>

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
            disabled={isUnavailable}
            onClick={() => {
              const wasAdded = addItem({
                productId,
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
            className="sticky bottom-0 z-10 mt-6 w-full rounded-full bg-[#B89535] px-6 py-3.5 font-semibold text-black shadow-[0_-10px_24px_rgba(255,255,255,0.9)] transition hover:bg-[#A7832E] disabled:cursor-not-allowed disabled:bg-[#D8D2C8] disabled:text-[#6F6A63] md:static md:mt-8 md:shadow-none"
          >
            {isUnavailable ? "Produto indisponível" : "Adicionar ao carrinho"}
          </button>
        </div>
      </div>
    </div>
  )
}
