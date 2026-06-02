import { CreditCard, ShieldCheck, Sparkles, Truck } from "lucide-react"

const benefits = [
  {
    icon: Truck,
    title: "Entrega rápida",
    description: "Receba seus produtos com agilidade e segurança.",
  },
  {
    icon: CreditCard,
    title: "Pagamento seguro",
    description: "Compra protegida com tecnologia confiável.",
  },
  {
    icon: Sparkles,
    title: "Produtos selecionados",
    description: "Curadoria especial de beleza, cabelo e acessórios.",
  },
  {
    icon: ShieldCheck,
    title: "Compra protegida",
    description: "Experiência segura do início ao fim.",
  },
]

export function BenefitsSection() {
  return (
    <section className="bg-white px-4 py-14 md:px-8 md:py-16">
      <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-4">
        {benefits.map((benefit) => {
          const Icon = benefit.icon

          return (
            <div
              key={benefit.title}
              className="rounded-2xl border border-[#E7E1D8] bg-[#F8F6F2] p-6 transition hover:shadow-[0_12px_30px_rgba(26,26,26,0.05)]"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#B89535]/15 text-[#B89535]">
                <Icon size={24} />
              </div>

              <h3 className="mb-2 text-lg font-semibold text-[#1A1A1A]">
                {benefit.title}
              </h3>

              <p className="text-sm leading-relaxed text-[#5C5C5C]">
                {benefit.description}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
