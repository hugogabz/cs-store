"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, CreditCard, Lock, ShieldCheck, Truck } from "lucide-react"
import { useCartStore } from "@/store/cart-store"
import { formatCurrency, toNumberPrice } from "@/utils/currency"
import { normalizeProductImageSrc } from "@/utils/images"

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items)

  const total = items.reduce((acc, item) => {
    return acc + toNumberPrice(item.price) * Math.max(1, item.quantity)
  }, 0)

  const formattedTotal = formatCurrency(total)
  const cartCount = items.reduce(
    (acc, item) => acc + Math.max(1, item.quantity),
    0
  )

  return (
    <main className="min-h-screen bg-[#F8F6F2] px-4 py-6 md:py-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="logo-font text-3xl font-bold text-[#B28A22] md:text-4xl"
          >
            CS Store
          </Link>

          <Link
            href="/"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-[#E7E1D8] bg-white px-5 py-3 text-sm font-semibold text-[#1A1A1A] transition hover:border-[#D4AF37] hover:text-[#B28A22]"
          >
            <ArrowLeft size={18} />
            Voltar para loja
          </Link>
        </div>

        <div className="mt-6 rounded-[28px] bg-white p-5 shadow-sm md:mt-8 md:rounded-[32px] md:p-8">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#B28A22]">
            Checkout seguro
          </span>

          <h1 className="mt-3 text-3xl font-bold text-[#1A1A1A] md:text-5xl">
            Finalize sua compra
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#5C5C5C] md:text-base">
            Preencha seus dados para deixar o pedido pronto para a futura etapa
            de pagamento.
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-[#F8F6F2] p-4">
              <Truck className="mb-3 text-[#B28A22]" />
              <p className="text-sm font-semibold">Entrega rápida</p>
            </div>

            <div className="rounded-2xl bg-[#F8F6F2] p-4">
              <ShieldCheck className="mb-3 text-[#B28A22]" />
              <p className="text-sm font-semibold">Compra protegida</p>
            </div>

            <div className="rounded-2xl bg-[#F8F6F2] p-4">
              <Lock className="mb-3 text-[#B28A22]" />
              <p className="text-sm font-semibold">Dados seguros</p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.12fr_0.88fr] lg:items-start">
          <section className="space-y-6">
            <form className="space-y-6">
              <div className="rounded-[28px] bg-white p-5 shadow-sm md:rounded-[32px] md:p-8">
                <div className="border-b border-[#E7E1D8] pb-5">
                  <h2 className="text-2xl font-bold text-[#1A1A1A]">
                    Dados pessoais
                  </h2>
                  <p className="mt-2 text-sm text-[#6F6A63]">
                    Informações para identificar o pedido e contato.
                  </p>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <input
                    placeholder="Nome completo"
                    className="rounded-2xl border border-[#E7E1D8] px-4 py-4 outline-none transition focus:border-[#D4AF37]"
                  />

                  <input
                    placeholder="E-mail"
                    type="email"
                    className="rounded-2xl border border-[#E7E1D8] px-4 py-4 outline-none transition focus:border-[#D4AF37]"
                  />

                  <input
                    placeholder="Telefone"
                    className="rounded-2xl border border-[#E7E1D8] px-4 py-4 outline-none transition focus:border-[#D4AF37]"
                  />

                  <input
                    placeholder="CPF"
                    className="rounded-2xl border border-[#E7E1D8] px-4 py-4 outline-none transition focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="rounded-[28px] bg-white p-5 shadow-sm md:rounded-[32px] md:p-8">
                <div className="border-b border-[#E7E1D8] pb-5">
                  <h2 className="text-2xl font-bold text-[#1A1A1A]">
                    Endereço de entrega
                  </h2>
                  <p className="mt-2 text-sm text-[#6F6A63]">
                    Dados usados para cálculo de frete e envio no próximo passo.
                  </p>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <input
                    placeholder="CEP"
                    className="rounded-2xl border border-[#E7E1D8] px-4 py-4 outline-none transition focus:border-[#D4AF37]"
                  />

                  <input
                    placeholder="Cidade"
                    className="rounded-2xl border border-[#E7E1D8] px-4 py-4 outline-none transition focus:border-[#D4AF37]"
                  />

                  <input
                    placeholder="Endereço"
                    className="rounded-2xl border border-[#E7E1D8] px-4 py-4 outline-none transition focus:border-[#D4AF37] md:col-span-2"
                  />

                  <input
                    placeholder="Número"
                    className="rounded-2xl border border-[#E7E1D8] px-4 py-4 outline-none transition focus:border-[#D4AF37]"
                  />

                  <input
                    placeholder="Complemento"
                    className="rounded-2xl border border-[#E7E1D8] px-4 py-4 outline-none transition focus:border-[#D4AF37]"
                  />
                </div>
              </div>
            </form>
          </section>

          <aside className="h-fit rounded-[28px] bg-white p-5 shadow-sm lg:sticky lg:top-28 md:rounded-[32px] md:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-[#1A1A1A]">
                  Resumo do pedido
                </h2>
                <p className="mt-1 text-sm text-[#6F6A63]">
                  Confira itens e total.
                </p>
              </div>

              <span className="shrink-0 rounded-full bg-[#D4AF37]/15 px-4 py-2 text-sm font-semibold text-[#B28A22]">
                {cartCount} itens
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {items.map((item) => {
                const quantity = Math.max(1, item.quantity)
                const itemTotal = toNumberPrice(item.price) * quantity

                return (
                  <div
                    key={item.id}
                    className="flex gap-4 rounded-3xl border border-[#E7E1D8] p-3 md:p-4"
                  >
                    <Image
                      src={normalizeProductImageSrc(item.image)}
                      alt={item.title}
                      width={96}
                      height={96}
                      className="h-20 w-20 shrink-0 rounded-2xl object-cover md:h-24 md:w-24"
                    />

                    <div className="flex min-w-0 flex-1 flex-col">
                      <h3 className="line-clamp-2 font-semibold leading-tight text-[#1A1A1A]">
                        {item.title}
                      </h3>

                      <p className="mt-2 text-sm text-[#5C5C5C]">
                        Quantidade: {quantity}
                      </p>

                      <p className="mt-auto font-bold text-[#B28A22]">
                        {formatCurrency(itemTotal)}
                      </p>
                    </div>
                  </div>
                )
              })}

              {items.length === 0 && (
                <div className="rounded-3xl border border-dashed border-[#D8CBB9] bg-[#F8F6F2] p-6 text-center">
                  <p className="font-semibold text-[#1A1A1A]">
                    Seu carrinho está vazio.
                  </p>
                  <p className="mt-2 text-sm text-[#6F6A63]">
                    Volte para a loja e adicione produtos antes de continuar.
                  </p>
                  <Link
                    href="/"
                    className="mt-5 inline-flex rounded-full bg-[#D4AF37] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#C89B2C]"
                  >
                    Escolher produtos
                  </Link>
                </div>
              )}
            </div>

            <div className="mt-8 space-y-4 border-t border-[#E7E1D8] pt-6">
              <div className="flex justify-between text-[#5C5C5C]">
                <span>Subtotal</span>
                <span>{formattedTotal}</span>
              </div>

              <div className="flex justify-between text-[#5C5C5C]">
                <span>Frete</span>
                <span>Calculado depois</span>
              </div>

              <div className="flex justify-between border-t border-[#E7E1D8] pt-5 text-xl font-bold text-[#1A1A1A]">
                <span>Total</span>
                <span>{formattedTotal}</span>
              </div>
            </div>

            <button
              disabled={items.length === 0}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-[#D4AF37] py-4 font-semibold text-black transition hover:bg-[#C89B2C] disabled:cursor-not-allowed disabled:opacity-50"
              type="button"
            >
              <CreditCard size={20} />
              Ir para pagamento
            </button>

            <p className="mt-4 text-center text-xs leading-relaxed text-[#8A8A8A]">
              Integração de pagamento ainda não habilitada. Este botão está
              preparado para receber o gateway no próximo passo.
            </p>
          </aside>
        </div>
      </div>
    </main>
  )
}
