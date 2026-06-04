"use client"

import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRef } from "react"
import { ProductCard } from "@/frontend/components/products/product-card"

type Product = {
  id?: string
  title: string
  description?: string | null
  category: string
  price: string | number
  image: string
  stock: number
  rating: number
  ratingCount: number
}

type CategorySectionProps = {
  id: string
  title: string
  subtitle: string
  products: Product[]
  seeMoreHref: string
}

export function CategorySection({
  id,
  title,
  subtitle,
  products,
  seeMoreHref,
}: CategorySectionProps) {
  const carouselRef = useRef<HTMLDivElement>(null)

  function scrollCarousel(direction: "left" | "right") {
    const carousel = carouselRef.current

    if (!carousel) return

    const scrollAmount = carousel.clientWidth < 768
      ? carousel.clientWidth * 0.82
      : carousel.clientWidth / 2

    carousel.scrollBy({
      behavior: "smooth",
      left: direction === "left" ? -scrollAmount : scrollAmount,
    })
  }

  return (
    <section
      id={id}
      className="scroll-mt-24 bg-[#F8F6F2] px-4 py-10 md:px-8 md:py-16"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 md:mb-9 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#B89535] md:text-sm">
              CS STORE
            </span>

            <h2 className="mt-3 text-2xl font-semibold text-[#1A1A1A] md:text-5xl">
              {title}
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#5C5C5C] md:mt-4 md:text-base">
              {subtitle}
            </p>
          </div>

          <Link
            href={seeMoreHref}
            className="inline-flex w-fit items-center rounded-full border border-[#B89535]/50 bg-white px-5 py-2.5 text-sm font-semibold text-[#8A6800] transition hover:border-[#B89535] hover:bg-[#B89535] hover:text-black"
          >
            Ver mais
          </Link>
        </div>

        <div className="relative">
          {products.length > 0 && (
            <>
              <div className="pointer-events-none absolute left-0 top-0 z-10 hidden h-full w-12 bg-gradient-to-r from-[#F8F6F2] to-transparent md:block" />
              <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-[#F8F6F2] to-transparent" />

              <button
                type="button"
                onClick={() => scrollCarousel("left")}
                className="absolute -left-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#E7E1D8] bg-white/95 text-[#1A1A1A] shadow-[0_10px_26px_rgba(26,26,26,0.08)] transition hover:border-[#B89535] hover:text-[#B89535] md:flex"
                aria-label={`Ver produtos anteriores em ${title}`}
              >
                <ChevronLeft size={21} />
              </button>

              <button
                type="button"
                onClick={() => scrollCarousel("right")}
                className="absolute -right-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#E7E1D8] bg-white/95 text-[#1A1A1A] shadow-[0_10px_26px_rgba(26,26,26,0.08)] transition hover:border-[#B89535] hover:text-[#B89535] md:flex"
                aria-label={`Ver próximos produtos em ${title}`}
              >
                <ChevronRight size={21} />
              </button>
            </>
          )}

          {products.length > 0 ? (
            <div
              ref={carouselRef}
              className="flex snap-x gap-3 overflow-x-auto scroll-smooth pb-4 pr-10 scrollbar-hide sm:gap-4 md:gap-5 md:px-2"
            >
              {products.map((product) => (
                <div
                  key={product.id ?? product.title}
                  className="flex min-w-[42%] snap-start sm:min-w-[31%] md:min-w-[calc((100%_-_40px)/3)] lg:min-w-[calc((100%_-_60px)/4)]"
                >
                  <ProductCard {...product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#D8CBB9] bg-white/70 p-8 text-sm text-[#6F6A63]">
              Nenhum produto cadastrado nesta seção ainda.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
