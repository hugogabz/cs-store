export const ORDER_STATUSES = [
  "pending",
  "paid",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const orderStatusLabels: Record<string, string> = {
  pending: "Aguardando pagamento",
  paid: "Pago",
  preparing: "Em preparação",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
  canceled: "Cancelado",
}

export const orderStatusClasses: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  paid: "bg-emerald-50 text-emerald-700",
  preparing: "bg-[#B89535]/15 text-[#8A6800]",
  shipped: "bg-blue-50 text-blue-700",
  delivered: "bg-slate-100 text-emerald-800",
  cancelled: "bg-red-50 text-red-600",
  canceled: "bg-red-50 text-red-600",
}

export const orderTimelineSteps = [
  {
    status: "pending",
    label: "Pedido recebido",
  },
  {
    status: "paid",
    label: "Pagamento aprovado",
  },
  {
    status: "preparing",
    label: "Em preparação",
  },
  {
    status: "shipped",
    label: "Enviado",
  },
  {
    status: "delivered",
    label: "Entregue",
  },
] as const

export function normalizeOrderStatus(status: string) {
  return status === "canceled" ? "cancelled" : status
}

export function isAllowedOrderStatus(status: string): status is OrderStatus {
  return ORDER_STATUSES.includes(status as OrderStatus)
}

export function orderStatusBadgeClass(status: string) {
  return orderStatusClasses[status] ?? "bg-[#B89535]/15 text-[#8A6800]"
}

export function orderStatusLabel(status: string) {
  return orderStatusLabels[status] ?? status
}

export function orderTimelineIndex(status: string) {
  const normalizedStatus = normalizeOrderStatus(status)

  if (normalizedStatus === "cancelled") {
    return -1
  }

  return orderTimelineSteps.findIndex((step) => step.status === normalizedStatus)
}
