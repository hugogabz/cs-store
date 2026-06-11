"use client"

import { useState } from "react"
import { Header } from "@/frontend/components/layout/header"
import { Footer } from "@/frontend/components/layout/footer"
import { MobileMenu } from "@/frontend/components/layout/mobile-menu"
import { CartDrawer } from "@/frontend/components/layout/cart-drawer"
import { formatCurrency } from "@/shared/utils/currency"

type LookupOrderItem = {
  id: string
  title: string
  quantity: number
  price: number
}

type LookupOrder = {
  orderNumber: string
  status: string
  total: number
  trackingCode: string | null
  createdAt: string
  updatedAt: string
  items: LookupOrderItem[]
}

const customerStatusLabels: Record<string, string> = {
  pending: "Aguardando pagamento",
  paid: "Pagamento aprovado",
  preparing: "Em preparação",
  shipped: "Pedido enviado",
  delivered: "Pedido entregue",
  cancelled: "Pedido cancelado",
  canceled: "Pedido cancelado",
}

const customerStatusClasses: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  paid: "bg-emerald-50 text-emerald-700",
  preparing: "bg-[#B89535]/15 text-[#8A6800]",
  shipped: "bg-blue-50 text-blue-700",
  delivered: "bg-emerald-50 text-emerald-800",
  cancelled: "bg-red-50 text-red-600",
  canceled: "bg-red-50 text-red-600",
}

function statusLabel(status: string) {
  return customerStatusLabels[status] ?? status
}

function statusClass(status: string) {
  return customerStatusClasses[status] ?? "bg-[#B89535]/15 text-[#8A6800]"
}

export default function MyOrdersPage() {
  const [email, setEmail] = useState("")
  const [orderNumber, setOrderNumber] = useState("")
  const [order, setOrder] = useState<LookupOrder | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setOrder(null)

    if (!email.trim() || !orderNumber.trim()) {
      setError("Digite o e-mail e o número do pedido.")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/orders/lookup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          orderNumber,
        }),
      })
      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.message ?? "Pedido não encontrado.")
      }

      setOrder(data)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Pedido não encontrado."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#F8F6F2] px-4 pb-28 pt-8 md:px-8 md:py-14">
        <div className="mx-auto max-w-4xl">
          <section className="rounded-2xl border border-[#E7E1D8] bg-white p-5 shadow-[0_12px_34px_rgba(26,26,26,0.04)] md:p-8">
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-[#B89535]">
              Meus Pedidos
            </span>

            <div className="mt-4 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <div>
                <h1 className="text-3xl font-semibold text-[#1A1A1A] md:text-5xl">
                  Consultar Pedido
                </h1>

                <p className="mt-4 text-sm leading-relaxed text-[#6F6A63] md:text-base">
                  Digite o e-mail utilizado na compra e o número do pedido.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#1A1A1A]">
                      E-mail
                    </label>
                    <input
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      type="email"
                      autoComplete="email"
                      placeholder="seuemail@exemplo.com"
                      className="w-full rounded-xl border border-[#E7E1D8] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#B89535]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#1A1A1A]">
                      Número do pedido
                    </label>
                    <input
                      value={orderNumber}
                      onChange={(event) => setOrderNumber(event.target.value.toUpperCase())}
                      placeholder="CS-1001"
                      className="w-full rounded-xl border border-[#E7E1D8] bg-white px-4 py-3 text-sm uppercase outline-none transition focus:border-[#B89535]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-full bg-[#B89535] px-6 py-3 font-semibold text-black transition hover:bg-[#A7832E] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Consultando..." : "Consultar Pedido"}
                  </button>
                </form>

                {error && (
                  <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600">
                    {error}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-[#E7E1D8] bg-[#F8F6F2] p-4 md:p-5">
                {!order && !loading && (
                  <div className="flex min-h-72 items-center justify-center rounded-xl border border-dashed border-[#D8CBB9] bg-white p-6 text-center text-sm leading-relaxed text-[#6F6A63]">
                    O resumo do pedido aparecerá aqui depois da consulta.
                  </div>
                )}

                {loading && (
                  <div className="flex min-h-72 items-center justify-center rounded-xl bg-white p-6 text-center text-sm font-medium text-[#6F6A63]">
                    Buscando pedido...
                  </div>
                )}

                {order && (
                  <div className="space-y-4">
                    <div className="rounded-xl bg-white p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#B89535]">
                            Pedido
                          </p>
                          <h2 className="mt-1 text-2xl font-semibold text-[#1A1A1A]">
                            #{order.orderNumber}
                          </h2>
                        </div>

                        <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusClass(order.status)}`}>
                          {statusLabel(order.status)}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3 text-sm text-[#5C5C5C] sm:grid-cols-2">
                        <p>
                          <span className="font-semibold text-[#1A1A1A]">Data:</span>{" "}
                          {new Date(order.createdAt).toLocaleString("pt-BR")}
                        </p>
                        <p>
                          <span className="font-semibold text-[#1A1A1A]">Total:</span>{" "}
                          {formatCurrency(order.total)}
                        </p>
                        <p className="sm:col-span-2">
                          <span className="font-semibold text-[#1A1A1A]">Última atualização:</span>{" "}
                          {new Date(order.updatedAt).toLocaleString("pt-BR")}
                        </p>
                      </div>
                    </div>

                    {order.trackingCode && (
                      <div className="rounded-xl border border-[#E7E1D8] bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#B89535]">
                          Código de rastreio
                        </p>
                        <p className="mt-2 break-all text-lg font-semibold text-[#1A1A1A]">
                          {order.trackingCode}
                        </p>
                      </div>
                    )}

                    <div className="rounded-xl bg-white p-4">
                      <h3 className="font-semibold text-[#1A1A1A]">
                        Produtos comprados
                      </h3>

                      <div className="mt-4 space-y-3">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-start justify-between gap-3 border-b border-[#EEE8DD] pb-3 last:border-0 last:pb-0"
                          >
                            <div>
                              <p className="font-medium text-[#1A1A1A]">
                                {item.title}
                              </p>
                              <p className="mt-1 text-sm text-[#6F6A63]">
                                Quantidade: {item.quantity}
                              </p>
                            </div>

                            <p className="shrink-0 text-sm font-semibold text-[#B89535]">
                              {formatCurrency(item.price * item.quantity)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
      <CartDrawer />
      <MobileMenu />
    </>
  )
}
