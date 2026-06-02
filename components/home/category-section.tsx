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
}

export function CategorySection({
  id,
  title,
  subtitle,
  products,
}: CategorySectionProps) {
  return (
    <section
      id={id}
      className="scroll-mt-24 bg-[#F8F6F2] px-4 py-16 md:px-8 md:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 md:mb-14">
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

        <div className="relative">
          {products.length > 0 && (
            <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-[#F8F6F2] to-transparent" />
          )}

          {products.length > 0 ? (
            <div className="flex snap-x gap-4 overflow-x-auto scroll-smooth pb-4 scrollbar-hide md:grid md:grid-cols-2 md:gap-6 md:overflow-visible xl:grid-cols-3">
              {products.map((product) => (
                <div
                  key={product.id ?? product.title}
                  className="min-w-[78%] snap-start sm:min-w-[48%] md:min-w-0"
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
