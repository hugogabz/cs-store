"use client"

import Image from "next/image"
import Link from "next/link"
import { CreditCard, Lock, ShieldCheck, Truck } from "lucide-react"
import { useCartStore } from "@/store/cart-store"
import { formatCurrency, toNumberPrice } from "@/utils/currency"
import { normalizeProductImageSrc } from "@/utils/images"

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items)

  const total = items.reduce((acc, item) => {
    return acc + toNumberPrice(item.price) * item.quantity
  }, 0)

  const formattedTotal = formatCurrency(total)

  return (
    <main className="min-h-screen bg-[#F8F6F2] px-4 py-8 md:py-12">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/"
          className="logo-font text-3xl font-bold text-[#B28A22] md:text-4xl"
        >
          CS Store
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="space-y-6">
            <div className="rounded-[32px] bg-white p-6 shadow-xl md:p-8">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#B28A22]">
                Checkout seguro
              </span>

              <h1 className="mt-3 text-3xl font-bold text-[#1A1A1A] md:text-5xl">
                Finalize sua compra
              </h1>

              <p className="mt-4 max-w-2xl text-[#5C5C5C]">
                Preencha seus dados para continuar para o pagamento seguro.
              </p>

              <div className="mt-8 grid gap-3 md:grid-cols-3">
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

            <form className="rounded-[32px] bg-white p-6 shadow-xl md:p-8">
              <h2 className="text-2xl font-bold text-[#1A1A1A]">
                Dados pessoais
              </h2>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
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

              <h2 className="mt-10 text-2xl font-bold text-[#1A1A1A]">
                Endereço de entrega
              </h2>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
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
            </form>
          </section>

          <aside className="h-fit rounded-[32px] bg-white p-6 shadow-xl lg:sticky lg:top-28 md:p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#1A1A1A]">
                Resumo
              </h2>

              <span className="rounded-full bg-[#D4AF37]/15 px-4 py-2 text-sm font-semibold text-[#B28A22]">
                {items.length} itens
              </span>
            </div>

            <div className="mt-6 space-y-5">
              {items.map((item) => {
                const itemTotal = toNumberPrice(item.price) * item.quantity

                return (
                  <div
                    key={item.id}
                    className="flex gap-4 rounded-3xl border border-[#E7E1D8] p-4"
                    >
                      <Image
                      src={normalizeProductImageSrc(item.image)}
                      alt={item.title}
                      width={96}
                      height={96}
                      className="h-24 w-24 rounded-2xl object-cover"
                    />

                    <div className="flex flex-1 flex-col">
                      <h3 className="font-semibold leading-tight text-[#1A1A1A]">
                        {item.title}
                      </h3>

                      <p className="mt-2 text-sm text-[#5C5C5C]">
                        Quantidade: {item.quantity}
                      </p>

                      <p className="mt-auto font-bold text-[#B28A22]">
                        {formatCurrency(itemTotal)}
                      </p>
                    </div>
                  </div>
                )
              })}

              {items.length === 0 && (
                <div className="rounded-3xl border border-[#E7E1D8] bg-[#F8F6F2] p-6 text-center text-[#5C5C5C]">
                  Seu carrinho está vazio.
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
            >
              <CreditCard size={20} />
              Ir para pagamento
            </button>

            <p className="mt-4 text-center text-xs leading-relaxed text-[#8A8A8A]">
              Pagamento seguro via gateway integrado. Seus dados são protegidos
              durante todo o processo.
            </p>
          </aside>
        </div>
      </div>
    </main>
  )
}
