"use client"

import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRef } from "react"
import { ProductCard } from "@/components/products/product-card"

type Product = {
  id?: string
  title: string
  category: string
  price: string | number
  image: string
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

    const cardWidth = carousel.clientWidth < 768
      ? carousel.clientWidth * 0.82
      : 360

    carousel.scrollBy({
      behavior: "smooth",
      left: direction === "left" ? -cardWidth : cardWidth,
    })
  }

  return (
    <section
      id={id}
      className="scroll-mt-24 bg-[#F8F6F2] px-4 py-14 md:px-8 md:py-20"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-5 md:mb-10 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#B28A22] md:text-sm">
              CS STORE
            </span>

            <h2 className="mt-4 text-3xl font-bold text-[#1A1A1A] md:text-5xl">
              {title}
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#5C5C5C] md:text-base">
              {subtitle}
            </p>
          </div>

          <Link
            href={seeMoreHref}
            className="inline-flex w-fit items-center rounded-full border border-[#D4AF37]/50 bg-white px-5 py-3 text-sm font-semibold text-[#8A6800] transition hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-black"
          >
            Ver mais
          </Link>
        </div>

        <div className="relative">
          {products.length > 0 && (
            <>
              <div className="pointer-events-none absolute left-0 top-0 z-10 hidden h-full w-16 bg-gradient-to-r from-[#F8F6F2] to-transparent md:block" />
              <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-20 bg-gradient-to-l from-[#F8F6F2] to-transparent" />

              <button
                type="button"
                onClick={() => scrollCarousel("left")}
                className="absolute -left-4 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#E7E1D8] bg-white text-[#1A1A1A] shadow-sm transition hover:border-[#D4AF37] hover:text-[#B28A22] md:flex"
                aria-label={`Ver produtos anteriores em ${title}`}
              >
                <ChevronLeft size={22} />
              </button>

              <button
                type="button"
                onClick={() => scrollCarousel("right")}
                className="absolute -right-4 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#E7E1D8] bg-white text-[#1A1A1A] shadow-sm transition hover:border-[#D4AF37] hover:text-[#B28A22] md:flex"
                aria-label={`Ver próximos produtos em ${title}`}
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}

          {products.length > 0 ? (
            <div
              ref={carouselRef}
              className="flex snap-x gap-4 overflow-x-auto scroll-smooth pb-4 pr-8 scrollbar-hide md:gap-6 md:px-2"
            >
              {products.map((product) => (
                <div
                  key={product.id ?? product.title}
                  className="min-w-[78%] snap-start sm:min-w-[48%] md:min-w-[340px] lg:min-w-[360px]"
                >
                  <ProductCard {...product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-[#D8CBB9] bg-white/70 p-8 text-sm text-[#6F6A63]">
              Nenhum produto cadastrado nesta seção ainda.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
