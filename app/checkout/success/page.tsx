"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useMemo, useState } from "react"

type ConfirmationState = "checking" | "paid" | "pending" | "failed"

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
  const [confirmationState, setConfirmationState] =
    useState<ConfirmationState>("checking")

  const returnData = useMemo(() => {
    return {
      receiptUrl: searchParams.get("receipt_url"),
      orderNsu: searchParams.get("order_nsu") ?? searchParams.get("orderId"),
      slug: searchParams.get("slug"),
      captureMethod: searchParams.get("capture_method"),
      transactionNsu: searchParams.get("transaction_nsu"),
    }
  }, [searchParams])

  const captureMethodLabel = getCaptureMethodLabel(returnData.captureMethod)

  useEffect(() => {
    if (!returnData.orderNsu) {
      queueMicrotask(() => setConfirmationState("pending"))
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
          setConfirmationState("paid")
          return
        }

        if (["cancelled", "canceled", "failed"].includes(data?.status)) {
          setConfirmationState("failed")
          return
        }

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
  }, [returnData])

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
      ? "Recebemos a confirmação da InfinitePay e seu pedido já foi atualizado."
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
          {returnData.orderNsu && (
            <p>
              <span className="font-semibold text-[#1A1A1A]">Pedido:</span>{" "}
              {returnData.orderNsu}
            </p>
          )}

          {captureMethodLabel && (
            <p>
              <span className="font-semibold text-[#1A1A1A]">Pagamento:</span>{" "}
              {captureMethodLabel}
            </p>
          )}

          {returnData.transactionNsu && (
            <p>
              <span className="font-semibold text-[#1A1A1A]">Transação:</span>{" "}
              {returnData.transactionNsu}
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
