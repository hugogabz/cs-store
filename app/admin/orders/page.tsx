"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { AdminNav } from "@/frontend/components/admin/admin-nav"
import { formatCurrency } from "@/shared/utils/currency"

type OrderItemSummary = {
  id: string
  title: string
  quantity: number
  price: number
}

type OrderSummary = {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  subtotal: number
  shippingPrice: number
  shippingMethod: string
  total: number
  status: string
  captureMethod: string | null
  createdAt: string
  items: OrderItemSummary[]
}

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  paid: "Pago",
  canceled: "Cancelado",
  cancelled: "Cancelado",
  shipped: "Enviado",
  delivered: "Entregue",
}

const statusClasses: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  paid: "bg-emerald-50 text-emerald-700",
  canceled: "bg-red-50 text-red-600",
  cancelled: "bg-red-50 text-red-600",
  shipped: "bg-blue-50 text-blue-700",
  delivered: "bg-slate-100 text-emerald-800",
}

function statusBadgeClass(status: string) {
  return statusClasses[status] ?? "bg-[#B89535]/15 text-[#8A6800]"
}

export default function AdminOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false

    void fetch("/api/admin/session")
      .then((response) => {
        if (!response.ok) {
          router.push("/admin-login")
          return null
        }

        return fetch("/api/orders")
      })
      .then((response) => response?.json())
      .then((data) => {
        if (!ignore && data) {
          setOrders(data)
        }
      })
      .catch(() => {
        if (!ignore) {
          toast.error("Nao foi possivel carregar os pedidos.")
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [router])

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8F6F2] px-4">
        <p className="text-[#5C5C5C]">Carregando pedidos...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F8F6F2] px-4 py-6 md:py-10">
      <div className="mx-auto max-w-6xl space-y-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-[#B89535]">
              CS Store
            </span>
            <h1 className="mt-2 text-3xl font-semibold text-[#1A1A1A] md:text-4xl">
              Pedidos
            </h1>
          </div>
        </div>

        <AdminNav />

        <section className="rounded-2xl border border-[#E7E1D8] bg-white p-4 shadow-[0_12px_34px_rgba(26,26,26,0.04)] md:p-6">
          <div className="space-y-4">
            {orders.map((order) => (
              <article
                key={order.id}
                className="rounded-2xl border border-[#E7E1D8] p-4 transition hover:border-[#D8CBB9] md:p-5"
              >
                <div className="grid gap-4 lg:grid-cols-[1.15fr_1.2fr_0.9fr_auto] lg:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B89535]">
                        #{order.id.slice(-8)}
                      </p>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(order.status)}`}>
                        {statusLabels[order.status] ?? order.status}
                      </span>
                    </div>

                    <h2 className="mt-3 font-semibold text-[#1A1A1A]">
                      {order.customerName}
                    </h2>
                    <p className="mt-1 text-sm text-[#6F6A63]">
                      {order.customerEmail}
                    </p>
                    <p className="mt-1 text-sm text-[#6F6A63]">
                      {order.customerPhone}
                    </p>
                    <p className="mt-3 text-xs text-[#8A8278]">
                      {new Date(order.createdAt).toLocaleString("pt-BR")}
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#F8F6F2] p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B89535]">
                      Produtos
                    </p>
                    <div className="mt-2 space-y-2">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between gap-3 text-sm text-[#5C5C5C]"
                        >
                          <span className="line-clamp-1">
                            {item.quantity}x {item.title}
                          </span>
                          <span className="shrink-0 font-medium text-[#1A1A1A]">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-[#5C5C5C]">
                    <div className="flex justify-between gap-4">
                      <span>Subtotal</span>
                      <span>{formatCurrency(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>Frete</span>
                      <span>{formatCurrency(order.shippingPrice)}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>Metodo</span>
                      <span className="text-right">{order.shippingMethod}</span>
                    </div>
                    {order.captureMethod && (
                      <div className="flex justify-between gap-4">
                        <span>Pagamento</span>
                        <span>{order.captureMethod}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-[#E7E1D8] pt-3 text-base font-semibold text-[#1A1A1A]">
                      <span>Total</span>
                      <span>{formatCurrency(order.total)}</span>
                    </div>
                  </div>

                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="rounded-full border border-[#E7E1D8] px-4 py-2 text-center text-sm font-semibold transition hover:border-[#B89535] hover:text-[#B89535]"
                  >
                    Ver detalhes
                  </Link>
                </div>
              </article>
            ))}

            {orders.length === 0 && (
              <div className="rounded-2xl border border-dashed border-[#D8CBB9] bg-[#F8F6F2] p-6 text-center text-[#5C5C5C]">
                Nenhum pedido encontrado.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
