"use client"

import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { AdminNav } from "@/frontend/components/admin/admin-nav"
import { formatCurrency } from "@/shared/utils/currency"
import { normalizeProductImageSrc } from "@/shared/utils/images"

type OrderItem = {
  id: string
  title: string
  image: string
  price: number
  quantity: number
}

type OrderDetails = {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerCpf: string | null
  cep: string
  address: string
  city: string | null
  state: string | null
  subtotal: number
  shippingPrice: number
  shippingMethod: string
  total: number
  status: string
  paymentProvider: string | null
  paymentId: string | null
  paymentUrl: string | null
  receiptUrl: string | null
  captureMethod: string | null
  createdAt: string
  items: OrderItem[]
}

const orderStatuses = ["pending", "paid", "shipped", "delivered", "canceled"]

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
  delivered: "bg-[#B89535]/15 text-[#8A6800]",
}

function statusBadgeClass(status: string) {
  return statusClasses[status] ?? "bg-[#B89535]/15 text-[#8A6800]"
}

export default function AdminOrderDetailsPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  async function loadOrder() {
    const response = await fetch(`/api/orders/${params.id}`)

    if (response.status === 401) {
      router.push("/admin-login")
      return
    }

    if (!response.ok) {
      throw new Error("Pedido nao encontrado.")
    }

    const data = await response.json()
    setOrder(data)
  }

  useEffect(() => {
    let ignore = false

    void fetch("/api/admin/session")
      .then((response) => {
        if (!response.ok) {
          router.push("/admin-login")
          return null
        }

        return fetch(`/api/orders/${params.id}`)
      })
      .then((response) => response?.json())
      .then((data) => {
        if (!ignore && data) {
          setOrder(data)
        }
      })
      .catch(() => {
        if (!ignore) {
          toast.error("Nao foi possivel carregar o pedido.")
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
  }, [params.id, router])

  async function updateStatus(status: string) {
    setUpdatingStatus(true)

    try {
      const response = await fetch(`/api/orders/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
        }),
      })

      if (response.status === 401) {
        router.push("/admin-login")
        return
      }

      if (!response.ok) {
        throw new Error("Nao foi possivel atualizar o status.")
      }

      await loadOrder()
      toast.success("Status atualizado.")
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Nao foi possivel atualizar o status."
      )
    } finally {
      setUpdatingStatus(false)
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8F6F2] px-4">
        <p className="text-[#5C5C5C]">Carregando pedido...</p>
      </main>
    )
  }

  if (!order) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8F6F2] px-4">
        <p className="text-[#5C5C5C]">Pedido nao encontrado.</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F8F6F2] px-4 py-6 md:py-10">
      <div className="mx-auto max-w-6xl space-y-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-[#B89535]">
              Pedido #{order.id.slice(-8)}
            </span>
            <h1 className="mt-2 text-3xl font-semibold text-[#1A1A1A] md:text-4xl">
              {order.customerName}
            </h1>
            <p className="mt-2 text-sm text-[#6F6A63]">
              Criado em {new Date(order.createdAt).toLocaleString("pt-BR")}
            </p>
          </div>

          <Link
            href="/admin/orders"
            className="w-full rounded-full border border-[#E7E1D8] bg-white px-5 py-2.5 text-center text-sm font-semibold transition hover:border-[#B89535] hover:text-[#B89535] sm:w-auto"
          >
            Voltar aos pedidos
          </Link>
        </div>

        <AdminNav />

        <section className="grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-[#E7E1D8] bg-white p-5">
            <h2 className="text-xl font-semibold text-[#1A1A1A]">
              Cliente
            </h2>
            <div className="mt-4 space-y-2 text-sm text-[#5C5C5C]">
              <p>Nome: {order.customerName}</p>
              <p>E-mail: {order.customerEmail}</p>
              <p>Telefone: {order.customerPhone}</p>
              <p>CPF: {order.customerCpf ?? "Nao informado"}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E7E1D8] bg-white p-5">
            <h2 className="text-xl font-semibold text-[#1A1A1A]">
              Entrega
            </h2>
            <div className="mt-4 space-y-2 text-sm text-[#5C5C5C]">
              <p>CEP: {order.cep}</p>
              <p>Endereco: {order.address}</p>
              <p>Cidade: {order.city ?? "Nao informada"}</p>
              <p>Estado: {order.state ?? "Nao informado"}</p>
              <p>Metodo de frete: {order.shippingMethod}</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[#E7E1D8] bg-white p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-[#1A1A1A]">
              Itens comprados
            </h2>
            <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(order.status)}`}>
              {statusLabels[order.status] ?? order.status}
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="grid gap-4 rounded-xl border border-[#E7E1D8] p-3 sm:grid-cols-[72px_1fr_auto] sm:items-center"
              >
                <Image
                  src={normalizeProductImageSrc(item.image)}
                  alt={item.title}
                  width={72}
                  height={72}
                  className="h-[72px] w-[72px] rounded-xl bg-[#F8F6F2] object-cover"
                />

                <div>
                  <p className="font-semibold text-[#1A1A1A]">{item.title}</p>
                  <p className="mt-1 text-sm text-[#6F6A63]">
                    {item.quantity} unidade(s) x {formatCurrency(item.price)}
                  </p>
                </div>

                <p className="font-semibold text-[#B89535]">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
          <div className="rounded-2xl border border-[#E7E1D8] bg-white p-5">
            <h2 className="text-xl font-semibold text-[#1A1A1A]">
              Status do pedido
            </h2>

            <p className={`mt-3 w-fit rounded-full px-3 py-1 text-sm font-semibold ${statusBadgeClass(order.status)}`}>
              {statusLabels[order.status] ?? order.status}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {orderStatuses.map((status) => (
                <button
                  key={status}
                  type="button"
                  disabled={updatingStatus || order.status === status}
                  onClick={() => void updateStatus(status)}
                  className="rounded-full border border-[#E7E1D8] px-4 py-2 text-sm font-semibold transition hover:border-[#B89535] hover:text-[#B89535] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {statusLabels[status]}
                </button>
              ))}
            </div>

            <div className="mt-5 space-y-2 rounded-xl bg-[#F8F6F2] p-4 text-sm text-[#6F6A63]">
              <p>paymentProvider: {order.paymentProvider ?? "Ainda nao definido"}</p>
              <p>paymentId: {order.paymentId ?? "Ainda nao gerado"}</p>
              <p className="break-all">paymentUrl: {order.paymentUrl ?? "Ainda nao gerado"}</p>
              <p className="break-all">receiptUrl: {order.receiptUrl ?? "Ainda nao recebido"}</p>
              <p>Metodo de pagamento: {order.captureMethod ?? "Ainda nao recebido"}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E7E1D8] bg-white p-5">
            <h2 className="text-xl font-semibold text-[#1A1A1A]">
              Resumo
            </h2>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between text-[#5C5C5C]">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#5C5C5C]">
                <span>Frete</span>
                <span>{formatCurrency(order.shippingPrice)}</span>
              </div>
              <div className="flex justify-between text-[#5C5C5C]">
                <span>Metodo de frete</span>
                <span className="text-right">{order.shippingMethod}</span>
              </div>
              <div className="flex justify-between border-t border-[#E7E1D8] pt-4 text-lg font-semibold text-[#1A1A1A]">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>

            {order.paymentUrl && (
              <a
                href={order.paymentUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 block rounded-full bg-[#B89535] px-5 py-3 text-center text-sm font-semibold text-black transition hover:bg-[#A7832E]"
              >
                Abrir link de pagamento
              </a>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
