"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { AdminNav } from "@/frontend/components/admin/admin-nav"
import { normalizeProductImageSrc } from "@/shared/utils/images"

type Reservation = {
  id: string
  groupId: string
  productId: string
  quantity: number
  expiresAt: string
  createdAt: string
  status: "active" | "expired"
  isActive: boolean
  expiresInMs: number
  product: {
    id: string
    title: string
    image: string
    stock: number
  }
}

const statusLabels: Record<Reservation["status"], string> = {
  active: "Reserva ativa",
  expired: "Expirada",
}

const statusClasses: Record<Reservation["status"], string> = {
  active: "bg-emerald-50 text-emerald-700",
  expired: "bg-red-50 text-red-600",
}

function formatRemainingTime(expiresInMs: number) {
  if (expiresInMs <= 0) {
    return "Expirada"
  }

  const totalSeconds = Math.ceil(expiresInMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  if (minutes <= 0) {
    return `${seconds}s`
  }

  return `${minutes}min ${String(seconds).padStart(2, "0")}s`
}

export default function AdminReservationsPage() {
  const router = useRouter()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [releasingId, setReleasingId] = useState<string | null>(null)

  const totals = useMemo(() => {
    return reservations.reduce(
      (acc, reservation) => {
        if (reservation.isActive) {
          acc.active += 1
        } else {
          acc.expired += 1
        }

        return acc
      },
      {
        active: 0,
        expired: 0,
      }
    )
  }, [reservations])

  async function loadReservations() {
    const response = await fetch("/api/admin/reservations")

    if (response.status === 401) {
      router.push("/admin-login")
      return
    }

    if (!response.ok) {
      throw new Error("Nao foi possivel carregar as reservas.")
    }

    const data = await response.json()
    setReservations(data)
  }

  useEffect(() => {
    let ignore = false

    void fetch("/api/admin/session")
      .then((response) => {
        if (!response.ok) {
          router.push("/admin-login")
          return null
        }

        return fetch("/api/admin/reservations")
      })
      .then((response) => response?.json())
      .then((data) => {
        if (!ignore && data) {
          setReservations(data)
        }
      })
      .catch(() => {
        if (!ignore) {
          toast.error("Nao foi possivel carregar as reservas.")
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

  async function releaseReservation(id: string) {
    setReleasingId(id)

    try {
      const response = await fetch("/api/admin/reservations", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
        }),
      })

      if (response.status === 401) {
        router.push("/admin-login")
        return
      }

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.message ?? "Nao foi possivel liberar a reserva.")
      }

      await loadReservations()
      toast.success("Reserva liberada.")
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Nao foi possivel liberar a reserva."
      )
    } finally {
      setReleasingId(null)
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8F6F2] px-4">
        <p className="text-[#5C5C5C]">Carregando reservas...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F8F6F2] px-4 py-6 md:py-10">
      <div className="mx-auto max-w-6xl space-y-7">
        <div>
          <span className="text-sm font-semibold uppercase tracking-[0.3em] text-[#B89535]">
            CS Store
          </span>
          <h1 className="mt-2 text-3xl font-semibold text-[#1A1A1A] md:text-4xl">
            Reservas de estoque
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#5C5C5C] md:text-base">
            Acompanhe as reservas criadas no checkout e libere manualmente
            quando necessario.
          </p>
        </div>

        <AdminNav />

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#E7E1D8] bg-white p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#B89535]">
              Ativas
            </p>
            <p className="mt-2 text-3xl font-semibold text-[#1A1A1A]">
              {totals.active}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E7E1D8] bg-white p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#B89535]">
              Expiradas
            </p>
            <p className="mt-2 text-3xl font-semibold text-[#1A1A1A]">
              {totals.expired}
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-[#E7E1D8] bg-white p-4 shadow-[0_12px_34px_rgba(26,26,26,0.04)] md:p-6">
          <div className="space-y-4">
            {reservations.map((reservation) => (
              <article
                key={reservation.id}
                className="grid gap-4 rounded-2xl border border-[#E7E1D8] p-4 md:grid-cols-[76px_1fr_auto] md:items-center"
              >
                <Image
                  src={normalizeProductImageSrc(reservation.product.image)}
                  alt={reservation.product.title}
                  width={76}
                  height={76}
                  className="h-[76px] w-[76px] rounded-xl bg-[#F8F6F2] object-cover"
                />

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-[#1A1A1A]">
                      {reservation.product.title}
                    </h2>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[reservation.status]}`}>
                      {statusLabels[reservation.status]}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-2 text-sm text-[#5C5C5C] sm:grid-cols-2 lg:grid-cols-4">
                    <p>Quantidade: {reservation.quantity}</p>
                    <p>Estoque total: {reservation.product.stock}</p>
                    <p>
                      Criada:{" "}
                      {new Date(reservation.createdAt).toLocaleString("pt-BR")}
                    </p>
                    <p>
                      Expira:{" "}
                      {new Date(reservation.expiresAt).toLocaleString("pt-BR")}
                    </p>
                  </div>

                  <p className="mt-2 text-sm font-semibold text-[#B89535]">
                    Tempo restante: {formatRemainingTime(reservation.expiresInMs)}
                  </p>
                </div>

                {reservation.isActive ? (
                  <button
                    type="button"
                    disabled={releasingId === reservation.id}
                    onClick={() => void releaseReservation(reservation.id)}
                    className="rounded-full border border-[#E7E1D8] px-4 py-2 text-sm font-semibold transition hover:border-[#B89535] hover:text-[#B89535] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {releasingId === reservation.id
                      ? "Liberando..."
                      : "Liberar reserva"}
                  </button>
                ) : (
                  <span className="rounded-full border border-red-100 px-4 py-2 text-center text-sm font-semibold text-red-500">
                    Expirada
                  </span>
                )}
              </article>
            ))}

            {reservations.length === 0 && (
              <div className="rounded-2xl border border-dashed border-[#D8CBB9] bg-[#F8F6F2] p-6 text-center text-[#5C5C5C]">
                Nenhuma reserva encontrada.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
