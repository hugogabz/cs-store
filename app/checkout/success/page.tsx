"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useMemo, useState } from "react"
import { useCartStore } from "@/frontend/store/cart-store"

type ConfirmationState = "checking" | "paid" | "pending" | "failed"

const CHECKOUT_STORAGE_KEY = "cs-store-checkout-reservation"
const CART_STORAGE_KEY = "cs-store-cart"
const CHECKOUT_ORDER_KEY = "cs-store-checkout-order-id"

const captureMethodLabels: Record<string, string> = {
  credit: "Cartão",
  credit_card: "Cartão",
  debit: "Cartão",
  debit_card: "Cartão",
  pix: "Pix",
}

function getCaptureMethodLabel(value: string | null) {
  if (!value) return ""

  const normalizedValue = value.toLowerCase()

  return captureMethodLabels[normalizedValue] ?? value
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const clearCart = useCartStore((state) => state.clearCart)
  const [confirmationState, setConfirmationState] =
    useState<ConfirmationState>("checking")
  const [confirmedOrderId, setConfirmedOrderId] = useState("")
  const [confirmedOrderNumber, setConfirmedOrderNumber] = useState("")

  const returnData = useMemo(() => {
    return {
      receiptUrl: searchParams.get("receipt_url"),
      orderNsu:
        searchParams.get("order_nsu") ??
        searchParams.get("orderId") ??
        (typeof window !== "undefined"
          ? window.localStorage.getItem(CHECKOUT_ORDER_KEY)
          : null),
      slug: searchParams.get("slug"),
      captureMethod: searchParams.get("capture_method"),
      transactionId: searchParams.get("transaction_id"),
      transactionNsu: searchParams.get("transaction_nsu"),
    }
  }, [searchParams])

  const captureMethodLabel = getCaptureMethodLabel(returnData.captureMethod)

  useEffect(() => {
    const hasPaymentIdentifier = Boolean(
      returnData.orderNsu ||
        returnData.slug ||
        returnData.transactionId ||
        returnData.transactionNsu
    )

    if (!hasPaymentIdentifier) {
      queueMicrotask(() => {
        setConfirmedOrderId(returnData.orderNsu ?? "")
        setConfirmationState("pending")
      })
      return
    }

    let ignore = false

    void fetch("/api/payment/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(returnData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (ignore) return

        if (data?.status === "paid") {
          setConfirmedOrderId(data?.orderId ?? returnData.orderNsu ?? "")
          setConfirmedOrderNumber(data?.orderNumber ?? "")
          clearCart()
          window.localStorage.removeItem(CART_STORAGE_KEY)
          window.localStorage.removeItem(CHECKOUT_STORAGE_KEY)
          window.localStorage.removeItem(CHECKOUT_ORDER_KEY)
          setConfirmationState("paid")
          return
        }

        if (["cancelled", "canceled", "failed"].includes(data?.status)) {
          setConfirmedOrderId(data?.orderId ?? returnData.orderNsu ?? "")
          setConfirmedOrderNumber(data?.orderNumber ?? "")
          setConfirmationState("failed")
          return
        }

        setConfirmedOrderId(data?.orderId ?? returnData.orderNsu ?? "")
        setConfirmedOrderNumber(data?.orderNumber ?? "")
        setConfirmationState("pending")
      })
      .catch(() => {
        if (!ignore) {
          setConfirmationState("failed")
        }
      })

    return () => {
      ignore = true
    }
  }, [clearCart, returnData])

  const title =
    confirmationState === "paid"
      ? "Pagamento confirmado!"
      : confirmationState === "failed"
        ? "Não conseguimos confirmar o pagamento"
        : confirmationState === "pending"
          ? "Pagamento em análise"
          : "Estamos confirmando seu pagamento..."

  const description =
    confirmationState === "paid"
      ? "Compra finalizada com sucesso. Recebemos a confirmação da InfinitePay e seu pedido já foi atualizado."
      : confirmationState === "failed"
        ? "A confirmação não retornou como aprovada. Se você pagou, acompanhe o pedido ou tente novamente em instantes."
        : "Estamos verificando sua compra. Isso pode levar alguns instantes."

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8F6F2] px-4 py-10">
      <section className="w-full max-w-xl rounded-2xl border border-[#E7E1D8] bg-white p-8 text-center shadow-[0_12px_34px_rgba(26,26,26,0.04)]">
        <span className="text-sm font-semibold uppercase tracking-[0.3em] text-[#B89535]">
          CS Store
        </span>

        <h1 className="mt-4 text-3xl font-semibold text-[#1A1A1A]">
          {title}
        </h1>

        <p className="mt-3 text-[#6F6A63]">{description}</p>

        <div className="mt-6 space-y-2 rounded-2xl bg-[#F8F6F2] p-4 text-left text-sm text-[#5C5C5C]">
          {(confirmedOrderId || returnData.orderNsu) && (
            <p>
              <span className="font-semibold text-[#1A1A1A]">Pedido:</span>{" "}
              {confirmedOrderNumber || confirmedOrderId || returnData.orderNsu}
            </p>
          )}

          {captureMethodLabel && (
            <p>
              <span className="font-semibold text-[#1A1A1A]">Pagamento:</span>{" "}
              {captureMethodLabel}
            </p>
          )}

          {(returnData.transactionId || returnData.transactionNsu) && (
            <p>
              <span className="font-semibold text-[#1A1A1A]">Transação:</span>{" "}
              {returnData.transactionId || returnData.transactionNsu}
            </p>
          )}
        </div>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex rounded-full bg-[#B89535] px-6 py-3 font-semibold text-black transition hover:bg-[#A7832E]"
          >
            Voltar para loja
          </Link>

          {returnData.receiptUrl && (
            <a
              href={returnData.receiptUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-full border border-[#E7E1D8] px-6 py-3 font-semibold text-[#1A1A1A] transition hover:border-[#B89535] hover:text-[#B89535]"
            >
              Ver comprovante
            </a>
          )}

          {(confirmedOrderId || returnData.orderNsu) && (
            <Link
              href="/meus-pedidos"
              className="inline-flex rounded-full border border-[#E7E1D8] px-6 py-3 font-semibold text-[#1A1A1A] transition hover:border-[#B89535] hover:text-[#B89535]"
            >
              Acompanhar Pedido
            </Link>
          )}
        </div>
      </section>
    </main>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#F8F6F2] px-4 py-10">
          <section className="w-full max-w-xl rounded-2xl border border-[#E7E1D8] bg-white p-8 text-center shadow-[0_12px_34px_rgba(26,26,26,0.04)]">
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-[#B89535]">
              CS Store
            </span>
            <h1 className="mt-4 text-3xl font-semibold text-[#1A1A1A]">
              Estamos confirmando seu pagamento...
            </h1>
          </section>
        </main>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  )
}
