import Link from "next/link"
import { notFound } from "next/navigation"
import { Header } from "@/frontend/components/layout/header"
import { Footer } from "@/frontend/components/layout/footer"
import { MobileMenu } from "@/frontend/components/layout/mobile-menu"
import { CartDrawer } from "@/frontend/components/layout/cart-drawer"
import { getPrisma } from "@/backend/services/prisma"
import {
  orderStatusBadgeClass,
  orderStatusLabel,
  orderTimelineIndex,
  orderTimelineSteps,
} from "@/shared/utils/order-status"

export const dynamic = "force-dynamic"

type OrderTrackingPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function OrderTrackingPage({
  params,
}: OrderTrackingPageProps) {
  const { id } = await params
  const prisma = getPrisma()
  const order = await prisma.order.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      status: true,
      trackingCode: true,
      updatedAt: true,
      createdAt: true,
    },
  })

  if (!order) {
    notFound()
  }

  const currentStepIndex = orderTimelineIndex(order.status)
  const isCancelled = order.status === "cancelled" || order.status === "canceled"

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#F8F6F2] px-4 pb-28 pt-10 md:px-8 md:py-16">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/acompanhar-pedido"
            className="inline-flex rounded-full border border-[#E7E1D8] bg-white px-5 py-2.5 text-sm font-semibold text-[#1A1A1A] transition hover:border-[#B89535] hover:text-[#B89535]"
          >
            Consultar outro pedido
          </Link>

          <section className="mt-7 rounded-2xl border border-[#E7E1D8] bg-white p-5 shadow-[0_12px_34px_rgba(26,26,26,0.04)] md:p-8">
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-[#B89535]">
              Pedido #{order.id.slice(-8)}
            </span>

            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-3xl font-semibold text-[#1A1A1A] md:text-5xl">
                  Acompanhe seu pedido
                </h1>
                <p className="mt-3 text-sm text-[#6F6A63]">
                  Última atualização em{" "}
                  {new Date(order.updatedAt).toLocaleString("pt-BR")}
                </p>
              </div>

              <span className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${orderStatusBadgeClass(order.status)}`}>
                {orderStatusLabel(order.status)}
              </span>
            </div>

            {order.trackingCode && (
              <div className="mt-6 rounded-2xl border border-[#E7E1D8] bg-[#F8F6F2] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B89535]">
                  Código de rastreio
                </p>
                <p className="mt-2 break-all text-lg font-semibold text-[#1A1A1A]">
                  {order.trackingCode}
                </p>
              </div>
            )}

            {isCancelled ? (
              <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-5 text-red-700">
                Este pedido foi cancelado. Caso tenha dúvidas, fale com a CS Store.
              </div>
            ) : (
              <div className="mt-8 space-y-4">
                {orderTimelineSteps.map((step, index) => {
                  const isCompleted = index <= currentStepIndex
                  const isCurrent = index === currentStepIndex

                  return (
                    <div key={step.status} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold ${
                            isCompleted
                              ? "border-[#B89535] bg-[#B89535] text-black"
                              : "border-[#E7E1D8] bg-white text-[#8A8278]"
                          }`}
                        >
                          {index + 1}
                        </div>
                        {index < orderTimelineSteps.length - 1 && (
                          <div
                            className={`h-9 w-px ${
                              index < currentStepIndex
                                ? "bg-[#B89535]"
                                : "bg-[#E7E1D8]"
                            }`}
                          />
                        )}
                      </div>

                      <div className="pb-5">
                        <p className="font-semibold text-[#1A1A1A]">
                          {step.label}
                        </p>
                        <p className="mt-1 text-sm text-[#6F6A63]">
                          {isCurrent
                            ? "Etapa atual do pedido."
                            : isCompleted
                              ? "Etapa concluída."
                              : "Aguardando atualização."}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
      <CartDrawer />
      <MobileMenu />
    </>
  )
}
