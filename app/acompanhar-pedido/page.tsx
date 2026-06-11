"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { Header } from "@/frontend/components/layout/header"
import { Footer } from "@/frontend/components/layout/footer"
import { MobileMenu } from "@/frontend/components/layout/mobile-menu"
import { CartDrawer } from "@/frontend/components/layout/cart-drawer"

export default function TrackOrderLookupPage() {
  const router = useRouter()
  const [orderId, setOrderId] = useState("")

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const cleanOrderId = orderId.trim()

    if (!cleanOrderId) return

    router.push(`/pedido/${encodeURIComponent(cleanOrderId)}`)
  }

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#F8F6F2] px-4 pb-28 pt-10 md:px-8 md:py-16">
        <section className="mx-auto max-w-xl rounded-2xl border border-[#E7E1D8] bg-white p-6 text-center shadow-[0_12px_34px_rgba(26,26,26,0.04)] md:p-9">
          <span className="text-sm font-semibold uppercase tracking-[0.3em] text-[#B89535]">
            CS Store
          </span>

          <h1 className="mt-4 text-3xl font-semibold text-[#1A1A1A] md:text-4xl">
            Acompanhar pedido
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-[#6F6A63]">
            Informe o número do pedido para consultar o status de envio.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4 text-left">
            <label className="block text-sm font-semibold text-[#1A1A1A]">
              Número do pedido
            </label>

            <input
              value={orderId}
              onChange={(event) => setOrderId(event.target.value)}
              placeholder="Ex: clx..."
              className="w-full rounded-xl border border-[#E7E1D8] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#B89535]"
            />

            <button
              type="submit"
              className="w-full rounded-full bg-[#B89535] px-6 py-3 font-semibold text-black transition hover:bg-[#A7832E]"
            >
              Consultar pedido
            </button>
          </form>

          <Link
            href="/"
            className="mt-5 inline-block text-sm font-semibold text-[#6F6A63] transition hover:text-[#B89535]"
          >
            Voltar para loja
          </Link>
        </section>
      </main>

      <Footer />
      <CartDrawer />
      <MobileMenu />
    </>
  )
}
