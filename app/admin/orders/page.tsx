"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { formatCurrency } from "@/shared/utils/currency"

type OrderSummary = {
  id: string
  customerName: string
  customerEmail: string
  shippingPrice: number
  total: number
  status: string
  createdAt: string
}

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  paid: "Pago",
  canceled: "Cancelado",
  shipped: "Enviado",
  delivered: "Entregue",
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
          toast.error("Não foi possível carregar os pedidos.")
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

          <Link
            href="/admin"
            className="w-full rounded-full border border-[#E7E1D8] bg-white px-5 py-2.5 text-center text-sm font-semibold transition hover:border-[#B89535] hover:text-[#B89535] sm:w-auto"
          >
            Voltar ao admin
          </Link>
        </div>

        <section className="rounded-2xl border border-[#E7E1D8] bg-white p-5 shadow-[0_12px_34px_rgba(26,26,26,0.04)] md:p-7">
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="grid gap-4 rounded-2xl border border-[#E7E1D8] p-4 md:grid-cols-[1.2fr_1fr_0.8fr_0.8fr_auto] md:items-center"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B89535]">
                    #{order.id.slice(-8)}
                  </p>
                  <h2 className="mt-1 font-semibold text-[#1A1A1A]">
                    {order.customerName}
                  </h2>
                  <p className="mt-1 text-sm text-[#6F6A63]">
                    {order.customerEmail}
                  </p>
                </div>

                <div className="text-sm text-[#5C5C5C]">
                  <p>Total: {formatCurrency(order.total)}</p>
                  <p>Frete: {formatCurrency(order.shippingPrice)}</p>
                </div>

                <span className="w-fit rounded-full bg-[#B89535]/15 px-3 py-1 text-xs font-semibold text-[#8A6800]">
                  {statusLabels[order.status] ?? order.status}
                </span>

                <p className="text-sm text-[#6F6A63]">
                  {new Date(order.createdAt).toLocaleString("pt-BR")}
                </p>

                <Link
                  href={`/admin/orders/${order.id}`}
                  className="rounded-full border border-[#E7E1D8] px-4 py-2 text-center text-sm font-semibold transition hover:border-[#B89535] hover:text-[#B89535]"
                >
                  Ver detalhes
                </Link>
              </div>
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
