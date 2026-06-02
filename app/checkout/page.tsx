"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, CreditCard, Lock, ShieldCheck, Truck } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useCartStore } from "@/store/cart-store"
import { formatCurrency, toNumberPrice } from "@/utils/currency"
import { normalizeProductImageSrc } from "@/utils/images"

const inputClass =
  "rounded-xl border border-[#E7E1D8] bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#B89535]"

type ReservationState = {
  reservationId: string
  expiresAt: string
}

type ShippingOption = {
  id: string
  name: string
  company: string
  price: number
  deliveryTime: number
}

function formatReservationTime(seconds: number) {
  const safeSeconds = Math.max(0, seconds)
  const minutes = Math.floor(safeSeconds / 60)
  const remainingSeconds = safeSeconds % 60

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`
}

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items)
  const [reservation, setReservation] = useState<ReservationState | null>(null)
  const [secondsRemaining, setSecondsRemaining] = useState(0)
  const [reserving, setReserving] = useState(false)
  const [cepDestino, setCepDestino] = useState("")
  const [calculatingShipping, setCalculatingShipping] = useState(false)
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([])
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null)

  const subtotal = items.reduce((acc, item) => {
    return acc + toNumberPrice(item.price) * Math.max(1, item.quantity)
  }, 0)

  const shippingTotal = selectedShipping?.price ?? 0
  const finalTotal = subtotal + shippingTotal
  const formattedSubtotal = formatCurrency(subtotal)
  const formattedShipping = selectedShipping
    ? formatCurrency(shippingTotal)
    : "Calculado depois"
  const formattedTotal = formatCurrency(finalTotal)
  const cartCount = items.reduce(
    (acc, item) => acc + Math.max(1, item.quantity),
    0
  )
  const hasActiveReservation = Boolean(reservation && secondsRemaining > 0)

  useEffect(() => {
    if (!reservation) return

    const currentReservation = reservation

    function updateCountdown() {
      const expiresAt = new Date(currentReservation.expiresAt).getTime()
      const seconds = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000))

      setSecondsRemaining(seconds)
    }

    updateCountdown()
    const interval = window.setInterval(updateCountdown, 1000)

    return () => window.clearInterval(interval)
  }, [reservation])

  async function handleReserveStock() {
    if (items.length === 0) {
      toast.error("Carrinho vazio. Adicione produtos antes de reservar.")
      return
    }

    if (hasActiveReservation) {
      toast.info("Os produtos já estão reservados.")
      return
    }

    const hasInvalidProduct = items.some((item) => !item.productId)

    if (hasInvalidProduct) {
      toast.error("Produto inválido no carrinho. Remova e adicione novamente.")
      return
    }

    setReserving(true)

    try {
      const response = await fetch("/api/stock/reserve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            title: item.title,
            quantity: Math.max(1, item.quantity),
          })),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.message ?? "Não foi possível reservar o estoque.")
      }

      setReservation({
        reservationId: data.reservationId,
        expiresAt: data.expiresAt,
      })

      toast.success("Seus produtos estão reservados por 15 minutos.")
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível reservar o estoque."
      )
    } finally {
      setReserving(false)
    }
  }

  async function handleCalculateShipping() {
    if (items.length === 0) {
      toast.error("Carrinho vazio. Adicione produtos antes de calcular o frete.")
      return
    }

    if (!cepDestino.trim()) {
      toast.error("Informe o CEP de entrega.")
      return
    }

    const hasInvalidProduct = items.some((item) => !item.productId)

    if (hasInvalidProduct) {
      toast.error("Produto inválido no carrinho. Remova e adicione novamente.")
      return
    }

    setCalculatingShipping(true)

    try {
      const response = await fetch("/api/shipping/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cepDestino,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: Math.max(1, item.quantity),
          })),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.message ?? "Não foi possível calcular o frete.")
      }

      setShippingOptions(data.options ?? [])
      setSelectedShipping(null)
      toast.success("Frete calculado com sucesso.")
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível calcular o frete."
      )
    } finally {
      setCalculatingShipping(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#F8F6F2] px-4 py-6 md:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="logo-font text-3xl font-bold text-[#B89535] md:text-4xl"
          >
            CS Store
          </Link>

          <Link
            href="/"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-[#E7E1D8] bg-white px-5 py-2.5 text-sm font-semibold text-[#1A1A1A] transition hover:border-[#B89535] hover:text-[#B89535]"
          >
            <ArrowLeft size={18} />
            Voltar para loja
          </Link>
        </div>

        <div className="mt-7 rounded-2xl border border-[#E7E1D8] bg-white p-5 shadow-[0_12px_34px_rgba(26,26,26,0.04)] md:p-8">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#B89535]">
            Checkout seguro
          </span>

          <h1 className="mt-3 text-3xl font-semibold text-[#1A1A1A] md:text-5xl">
            Finalize sua compra
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#5C5C5C] md:text-base">
            Preencha seus dados para deixar o pedido pronto para a futura etapa
            de pagamento.
          </p>

          <div className="mt-7 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl bg-[#F8F6F2] p-4">
              <Truck className="mb-3 text-[#B89535]" />
              <p className="text-sm font-semibold">Entrega rápida</p>
            </div>

            <div className="rounded-xl bg-[#F8F6F2] p-4">
              <ShieldCheck className="mb-3 text-[#B89535]" />
              <p className="text-sm font-semibold">Compra protegida</p>
            </div>

            <div className="rounded-xl bg-[#F8F6F2] p-4">
              <Lock className="mb-3 text-[#B89535]" />
              <p className="text-sm font-semibold">Dados seguros</p>
            </div>
          </div>
        </div>

        <div className="mt-7 grid gap-7 lg:grid-cols-[1.12fr_0.88fr] lg:items-start">
          <section>
            <form className="space-y-7">
              <div className="rounded-2xl border border-[#E7E1D8] bg-white p-5 shadow-[0_12px_34px_rgba(26,26,26,0.04)] md:p-7">
                <div className="border-b border-[#E7E1D8] pb-5">
                  <h2 className="text-2xl font-semibold text-[#1A1A1A]">
                    Dados pessoais
                  </h2>
                  <p className="mt-2 text-sm text-[#6F6A63]">
                    Informações para identificar o pedido e contato.
                  </p>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <input placeholder="Nome completo" className={inputClass} />
                  <input placeholder="E-mail" type="email" className={inputClass} />
                  <input placeholder="Telefone" className={inputClass} />
                  <input placeholder="CPF" className={inputClass} />
                </div>
              </div>

              <div className="rounded-2xl border border-[#E7E1D8] bg-white p-5 shadow-[0_12px_34px_rgba(26,26,26,0.04)] md:p-7">
                <div className="border-b border-[#E7E1D8] pb-5">
                  <h2 className="text-2xl font-semibold text-[#1A1A1A]">
                    Endereço de entrega
                  </h2>
                  <p className="mt-2 text-sm text-[#6F6A63]">
                    Dados usados para cálculo de frete e envio no próximo passo.
                  </p>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-3 sm:flex-row md:col-span-2">
                    <input
                      value={cepDestino}
                      onChange={(event) => setCepDestino(event.target.value)}
                      placeholder="CEP"
                      inputMode="numeric"
                      className={`${inputClass} min-w-0 flex-1`}
                    />

                    <button
                      type="button"
                      disabled={calculatingShipping || items.length === 0}
                      onClick={handleCalculateShipping}
                      className="rounded-full border border-[#B89535]/50 px-5 py-3 text-sm font-semibold text-[#8A6800] transition hover:border-[#B89535] hover:bg-[#B89535] hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {calculatingShipping ? "Calculando..." : "Calcular frete"}
                    </button>
                  </div>

                  <input placeholder="Cidade" className={inputClass} />
                  <input
                    placeholder="Endereço"
                    className={`${inputClass} md:col-span-2`}
                  />
                  <input placeholder="Número" className={inputClass} />
                  <input placeholder="Complemento" className={inputClass} />
                </div>

                {shippingOptions.length > 0 && (
                  <div className="mt-6 border-t border-[#E7E1D8] pt-6">
                    <h3 className="text-lg font-semibold text-[#1A1A1A]">
                      Opções de frete
                    </h3>
                    <p className="mt-1 text-sm text-[#6F6A63]">
                      Escolha uma opção para incluir no total do pedido.
                    </p>

                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      {shippingOptions.map((option) => {
                        const isSelected = selectedShipping?.id === option.id

                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => setSelectedShipping(option)}
                            className={`rounded-2xl border bg-white p-4 text-left transition ${
                              isSelected
                                ? "border-[#B89535] shadow-[0_12px_30px_rgba(184,149,53,0.12)]"
                                : "border-[#E7E1D8] hover:border-[#B89535]/60"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="font-semibold text-[#1A1A1A]">
                                  {option.name} — {option.company}
                                </p>
                              </div>

                              <span className="font-semibold text-[#B89535]">
                                {formatCurrency(option.price)}
                              </span>
                            </div>

                            <p className="mt-3 text-sm text-[#6F6A63]">
                              Prazo: {option.deliveryTime} dias
                            </p>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </form>
          </section>

          <aside className="h-fit rounded-2xl border border-[#E7E1D8] bg-white p-5 shadow-[0_12px_34px_rgba(26,26,26,0.04)] lg:sticky lg:top-28 md:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-[#1A1A1A]">
                  Resumo do pedido
                </h2>
                <p className="mt-1 text-sm text-[#6F6A63]">
                  Confira itens e total.
                </p>
              </div>

              <span className="shrink-0 rounded-full bg-[#B89535]/15 px-4 py-2 text-sm font-semibold text-[#8A6800]">
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
                    className="flex gap-4 rounded-2xl border border-[#E7E1D8] p-3"
                  >
                    <Image
                      src={normalizeProductImageSrc(item.image)}
                      alt={item.title}
                      width={88}
                      height={88}
                      className="h-20 w-20 shrink-0 rounded-xl object-cover md:h-[88px] md:w-[88px]"
                    />

                    <div className="flex min-w-0 flex-1 flex-col">
                      <h3 className="line-clamp-2 font-semibold leading-tight text-[#1A1A1A]">
                        {item.title}
                      </h3>

                      <p className="mt-2 text-sm text-[#5C5C5C]">
                        Quantidade: {quantity}
                      </p>

                      <p className="mt-auto font-semibold text-[#B89535]">
                        {formatCurrency(itemTotal)}
                      </p>
                    </div>
                  </div>
                )
              })}

              {items.length === 0 && (
                <div className="rounded-2xl border border-dashed border-[#D8CBB9] bg-[#F8F6F2] p-6 text-center">
                  <p className="font-semibold text-[#1A1A1A]">
                    Seu carrinho está vazio.
                  </p>
                  <p className="mt-2 text-sm text-[#6F6A63]">
                    Volte para a loja e adicione produtos antes de continuar.
                  </p>
                  <Link
                    href="/"
                    className="mt-5 inline-flex rounded-full bg-[#B89535] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-[#A7832E]"
                  >
                    Escolher produtos
                  </Link>
                </div>
              )}
            </div>

            <div className="mt-8 space-y-4 border-t border-[#E7E1D8] pt-6">
              <div className="flex justify-between text-[#5C5C5C]">
                <span>Subtotal</span>
                <span>{formattedSubtotal}</span>
              </div>

              <div className="flex justify-between text-[#5C5C5C]">
                <span>Frete selecionado</span>
                <span>{formattedShipping}</span>
              </div>

              <div className="flex justify-between border-t border-[#E7E1D8] pt-5 text-xl font-semibold text-[#1A1A1A]">
                <span>Total final</span>
                <span>{formattedTotal}</span>
              </div>
            </div>

            <button
              disabled={items.length === 0 || reserving}
              onClick={handleReserveStock}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-[#B89535] py-3.5 font-semibold text-black transition hover:bg-[#A7832E] disabled:cursor-not-allowed disabled:opacity-50"
              type="button"
            >
              <CreditCard size={20} />
              {reserving
                ? "Reservando..."
                : hasActiveReservation
                  ? "Pagamento em breve"
                  : "Ir para pagamento"}
            </button>

            {reservation && (
              <div className="mt-4 rounded-2xl border border-[#E7E1D8] bg-[#F8F6F2] p-4 text-sm">
                {hasActiveReservation ? (
                  <>
                    <p className="font-semibold text-[#1A1A1A]">
                      Seus produtos estão reservados por 15 minutos.
                    </p>
                    <p className="mt-2 text-[#6F6A63]">
                      Tempo restante:{" "}
                      <span className="font-semibold text-[#B89535]">
                        {formatReservationTime(secondsRemaining)}
                      </span>
                    </p>
                  </>
                ) : (
                  <p className="font-semibold text-red-500">
                    A reserva expirou. Calcule novamente antes de pagar.
                  </p>
                )}
              </div>
            )}

            <p className="mt-4 text-center text-xs leading-relaxed text-[#8A8A8A]">
              Integração de pagamento ainda não habilitada. No próximo passo,
              este fluxo chamará o Mercado Pago; ao pagamento aprovado, o
              estoque será baixado e as reservas deste pedido serão removidas.
            </p>
          </aside>
        </div>
      </div>
    </main>
  )
}
