"use client"

import { Download } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { AdminNav } from "@/frontend/components/admin/admin-nav"
import { formatCurrency } from "@/shared/utils/currency"

type ReportPeriod = "today" | "7d" | "30d" | "all"

type ReportSummary = {
  totalOrders: number
  paidOrders: number
  pendingOrders: number
  canceledOrders: number
  totalRevenue: number
  productsSold: number
  registeredProducts: number
  totalStock: number
}

type BestSellingProduct = {
  productId: string | null
  title: string
  quantitySold: number
  revenue: number
  stock: number
}

type StockControlProduct = {
  productId: string
  title: string
  stock: number
  status: "out" | "low" | "available"
  quantitySold: number
  revenue: number
}

type ReportData = {
  period: ReportPeriod
  periodLabel: string
  summary: ReportSummary
  bestSellingProducts: BestSellingProduct[]
  stockControl: StockControlProduct[]
}

const periods: { label: string; value: ReportPeriod }[] = [
  {
    label: "Hoje",
    value: "today",
  },
  {
    label: "Ultimos 7 dias",
    value: "7d",
  },
  {
    label: "Ultimos 30 dias",
    value: "30d",
  },
  {
    label: "Todo periodo",
    value: "all",
  },
]

const stockLabels: Record<StockControlProduct["status"], string> = {
  out: "Sem estoque",
  low: "Estoque baixo",
  available: "Disponivel",
}

const stockClasses: Record<StockControlProduct["status"], string> = {
  out: "bg-red-50 text-red-600",
  low: "bg-yellow-50 text-yellow-700",
  available: "bg-emerald-50 text-emerald-700",
}

function escapeCsvCell(value: string | number) {
  const text = String(value)

  if (/[",\n]/.test(text)) {
    return `"${text.replaceAll("\"", "\"\"")}"`
  }

  return text
}

function downloadCsv(rows: StockControlProduct[]) {
  const header = ["Produto", "Quantidade vendida", "Receita", "Estoque atual"]
  const csvRows = rows.map((product) => [
    product.title,
    product.quantitySold,
    product.revenue.toFixed(2),
    product.stock,
  ])
  const csv = [header, ...csvRows]
    .map((row) => row.map(escapeCsvCell).join(","))
    .join("\n")
  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8",
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.href = url
  link.download = "relatorio-cs-store.csv"
  link.click()
  URL.revokeObjectURL(url)
}

export default function AdminReportsPage() {
  const router = useRouter()
  const [period, setPeriod] = useState<ReportPeriod>("30d")
  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)

  const summaryCards = useMemo(() => {
    if (!report) {
      return []
    }

    return [
      {
        label: "Total de pedidos",
        value: report.summary.totalOrders,
      },
      {
        label: "Pedidos pagos",
        value: report.summary.paidOrders,
      },
      {
        label: "Pedidos pendentes",
        value: report.summary.pendingOrders,
      },
      {
        label: "Pedidos cancelados",
        value: report.summary.canceledOrders,
      },
      {
        label: "Faturamento total",
        value: formatCurrency(report.summary.totalRevenue),
      },
      {
        label: "Produtos vendidos",
        value: report.summary.productsSold,
      },
      {
        label: "Produtos cadastrados",
        value: report.summary.registeredProducts,
      },
      {
        label: "Estoque disponivel",
        value: report.summary.totalStock,
      },
    ]
  }, [report])

  useEffect(() => {
    let ignore = false

    void fetch("/api/admin/session")
      .then((response) => {
        if (!response.ok) {
          router.push("/admin-login")
          return null
        }

        return fetch(`/api/admin/reports?period=${period}`)
      })
      .then((response) => response?.json())
      .then((data) => {
        if (!ignore && data) {
          setReport(data)
        }
      })
      .catch(() => {
        if (!ignore) {
          toast.error("Nao foi possivel carregar os relatorios.")
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
  }, [period, router])

  return (
    <main className="min-h-screen bg-[#F8F6F2] px-4 py-6 md:py-10">
      <div className="mx-auto max-w-6xl space-y-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-[#B89535]">
              CS Store
            </span>
            <h1 className="mt-2 text-3xl font-semibold text-[#1A1A1A] md:text-4xl">
              Relatorios
            </h1>
          </div>

          <button
            type="button"
            onClick={() => report && downloadCsv(report.stockControl)}
            disabled={!report || loading}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#B89535] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#A7852F] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={17} />
            Exportar relatorio CSV
          </button>
        </div>

        <AdminNav />

        <section className="rounded-2xl border border-[#E7E1D8] bg-white p-4 shadow-[0_12px_34px_rgba(26,26,26,0.04)] md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#1A1A1A]">
                Visao geral
              </h2>
              <p className="mt-1 text-sm text-[#6F6A63]">
                Faturamento e produtos vendidos consideram apenas pedidos pagos.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex">
              {periods.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPeriod(option.value)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    period === option.value
                      ? "bg-[#B89535] text-black"
                      : "border border-[#E7E1D8] text-[#1A1A1A] hover:border-[#B89535] hover:text-[#B89535]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="mt-6 rounded-2xl border border-dashed border-[#D8CBB9] bg-[#F8F6F2] p-6 text-center text-[#5C5C5C]">
              Carregando relatorios...
            </div>
          ) : (
            <>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {summaryCards.map((card) => (
                  <article
                    key={card.label}
                    className="rounded-2xl border border-[#E7E1D8] bg-[#F8F6F2] p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B89535]">
                      {card.label}
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-[#1A1A1A]">
                      {card.value}
                    </p>
                  </article>
                ))}
              </div>

              <div className="mt-8 grid gap-5 xl:grid-cols-2">
                <section className="rounded-2xl border border-[#E7E1D8]">
                  <div className="border-b border-[#E7E1D8] p-4">
                    <h2 className="font-semibold text-[#1A1A1A]">
                      Produtos mais vendidos
                    </h2>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-[#F8F6F2] text-xs uppercase tracking-[0.18em] text-[#8A8278]">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Produto</th>
                          <th className="px-4 py-3 font-semibold">
                            Quantidade vendida
                          </th>
                          <th className="px-4 py-3 font-semibold">
                            Receita gerada
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E7E1D8]">
                        {report?.bestSellingProducts.map((product) => (
                          <tr key={product.productId ?? product.title}>
                            <td className="px-4 py-4 font-medium text-[#1A1A1A]">
                              {product.title}
                            </td>
                            <td className="px-4 py-4 text-[#5C5C5C]">
                              {product.quantitySold}
                            </td>
                            <td className="px-4 py-4 font-semibold text-[#1A1A1A]">
                              {formatCurrency(product.revenue)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {report?.bestSellingProducts.length === 0 && (
                    <div className="p-6 text-center text-sm text-[#5C5C5C]">
                      Nenhum produto vendido neste periodo.
                    </div>
                  )}
                </section>

                <section className="rounded-2xl border border-[#E7E1D8]">
                  <div className="border-b border-[#E7E1D8] p-4">
                    <h2 className="font-semibold text-[#1A1A1A]">
                      Controle de estoque
                    </h2>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-[#F8F6F2] text-xs uppercase tracking-[0.18em] text-[#8A8278]">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Produto</th>
                          <th className="px-4 py-3 font-semibold">
                            Estoque atual
                          </th>
                          <th className="px-4 py-3 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E7E1D8]">
                        {report?.stockControl.map((product) => (
                          <tr key={product.productId}>
                            <td className="px-4 py-4 font-medium text-[#1A1A1A]">
                              {product.title}
                            </td>
                            <td className="px-4 py-4 text-[#5C5C5C]">
                              {product.stock}
                            </td>
                            <td className="px-4 py-4">
                              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${stockClasses[product.status]}`}>
                                {stockLabels[product.status]}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {report?.stockControl.length === 0 && (
                    <div className="p-6 text-center text-sm text-[#5C5C5C]">
                      Nenhum produto cadastrado.
                    </div>
                  )}
                </section>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  )
}
