"use client"

import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { AdminNav } from "@/frontend/components/admin/admin-nav"
import { formatCurrency } from "@/shared/utils/currency"
import { normalizeProductImageSrc } from "@/shared/utils/images"
import {
  ORDER_STATUSES,
  orderStatusBadgeClass,
  orderStatusLabel,
} from "@/shared/utils/order-status"

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
  trackingCode: string | null
  createdAt: string
  updatedAt: string
  items: OrderItem[]
  statusHistory: {
    id: string
    status: string
    trackingCode: string | null
    createdAt: string
  }[]
}

export default function AdminOrderDetailsPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState("pending")
  const [trackingCode, setTrackingCode] = useState("")

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
    setSelectedStatus(data.status)
    setTrackingCode(data.trackingCode ?? "")
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
          setSelectedStatus(data.status)
          setTrackingCode(data.trackingCode ?? "")
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

  async function updateStatus(status = selectedStatus) {
    setUpdatingStatus(true)

    try {
      const response = await fetch(`/api/orders/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          trackingCode,
        }),
      })

      if (response.status === 401) {
        router.push("/admin-login")
        return
      }

      if (!response.ok) {
        throw new Error("Nao foi possivel atualizar o status.")
      }

      const data = await response.json().catch(() => null)

      await loadOrder()
      if (data?.email?.sent) {
        toast.success("Status atualizado e e-mail enviado ao cliente.")
      } else if (data?.email?.attempted && !data?.email?.sent) {
        toast.warning("Status atualizado, mas não foi possível enviar o e-mail.")
      } else {
        toast.success("Pedido atualizado.")
      }
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

  async function runOrderAction({
    action,
    successMessage,
  }: {
    action: "mark-paid-test" | "mark-canceled-test"
    successMessage: string
  }) {
    setUpdatingStatus(true)

    try {
      const response = await fetch(`/api/orders/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
        }),
      })

      if (response.status === 401) {
        router.push("/admin-login")
        return
      }

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.message ?? "Nao foi possivel atualizar o pedido.")
      }

      await loadOrder()
      const releasedReservations = Number(data?.releasedReservations ?? 0)
      const orderMessage = releasedReservations > 0
        ? `${successMessage} Reserva liberada.`
        : successMessage

      if (data?.email?.sent) {
        toast.success(`${orderMessage} Status atualizado e e-mail enviado ao cliente.`)
      } else if (data?.email?.attempted && !data?.email?.sent) {
        toast.warning(`${orderMessage} Status atualizado, mas não foi possível enviar o e-mail.`)
      } else {
        toast.success(orderMessage)
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Nao foi possivel atualizar o pedido."
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
            <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${orderStatusBadgeClass(order.status)}`}>
              {orderStatusLabel(order.status)}
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

            <p className={`mt-3 w-fit rounded-full px-3 py-1 text-sm font-semibold ${orderStatusBadgeClass(order.status)}`}>
              {orderStatusLabel(order.status)}
            </p>

            <p className="mt-3 text-sm text-[#6F6A63]">
              Última atualização: {new Date(order.updatedAt).toLocaleString("pt-BR")}
            </p>

            <div className="mt-5 grid gap-3 rounded-2xl border border-[#E7E1D8] bg-[#F8F6F2] p-4 sm:grid-cols-[1fr_auto]">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#1A1A1A]">
                  Status atual
                </label>
                <select
                  value={selectedStatus}
                  onChange={(event) => setSelectedStatus(event.target.value)}
                  className="w-full rounded-xl border border-[#E7E1D8] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#B89535]"
                >
                  {ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {orderStatusLabel(status)}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                disabled={updatingStatus}
                onClick={() => void updateStatus()}
                className="self-end rounded-full bg-[#B89535] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#A7832E] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Salvar status
              </button>
            </div>

            {selectedStatus === "shipped" && (
              <div className="mt-4">
                <label className="mb-2 block text-sm font-semibold text-[#1A1A1A]">
                  Código de rastreio
                </label>
                <input
                  value={trackingCode}
                  onChange={(event) => setTrackingCode(event.target.value)}
                  placeholder="Informe o código de rastreio"
                  className="w-full rounded-xl border border-[#E7E1D8] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#B89535]"
                />
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={updatingStatus || order.status === "paid"}
                onClick={() =>
                  void runOrderAction({
                    action: "mark-paid-test",
                    successMessage: "Pedido marcado como pago em modo teste.",
                  })
                }
                className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Marcar como pago (teste)
              </button>

              <button
                type="button"
                disabled={
                  updatingStatus ||
                  order.status === "canceled" ||
                  order.status === "cancelled"
                }
                onClick={() =>
                  void runOrderAction({
                    action: "mark-canceled-test",
                    successMessage: "Pedido marcado como cancelado.",
                  })
                }
                className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Marcar como cancelado
              </button>
            </div>

            <div className="mt-5 space-y-2 rounded-xl bg-[#F8F6F2] p-4 text-sm text-[#6F6A63]">
              <p>paymentProvider: {order.paymentProvider ?? "Ainda nao definido"}</p>
              <p>paymentId: {order.paymentId ?? "Ainda nao gerado"}</p>
              <p className="break-all">paymentUrl: {order.paymentUrl ?? "Ainda nao gerado"}</p>
              <p className="break-all">receiptUrl: {order.receiptUrl ?? "Ainda nao recebido"}</p>
              <p>Metodo de pagamento: {order.captureMethod ?? "Ainda nao recebido"}</p>
            </div>

            <div className="mt-5 rounded-2xl border border-[#E7E1D8] p-4">
              <h3 className="font-semibold text-[#1A1A1A]">
                Histórico de atualização
              </h3>

              <div className="mt-4 space-y-3">
                {order.statusHistory.map((history) => (
                  <div
                    key={history.id}
                    className="rounded-xl bg-[#F8F6F2] p-3 text-sm text-[#5C5C5C]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${orderStatusBadgeClass(history.status)}`}>
                        {orderStatusLabel(history.status)}
                      </span>
                      <span>
                        {new Date(history.createdAt).toLocaleString("pt-BR")}
                      </span>
                    </div>
                    {history.trackingCode && (
                      <p className="mt-2 break-all">
                        Rastreio: {history.trackingCode}
                      </p>
                    )}
                  </div>
                ))}

                {order.statusHistory.length === 0 && (
                  <p className="text-sm text-[#6F6A63]">
                    Nenhuma atualização registrada ainda.
                  </p>
                )}
              </div>
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
