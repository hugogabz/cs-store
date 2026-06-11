import { Resend } from "resend"
import { formatCurrency } from "@/shared/utils/currency"
import { orderStatusLabel } from "@/shared/utils/order-status"

type OrderStatusEmailItem = {
  title: string
  price: number
  quantity: number
}

export type OrderStatusEmailOrder = {
  id: string
  customerName: string
  customerEmail: string | null
  total: number
  status: string
  trackingCode?: string | null
  items: OrderStatusEmailItem[]
}

export type OrderStatusEmailResult = {
  attempted: boolean
  sent: boolean
  skipped: boolean
  message: string
  id?: string
}

const subjectByStatus: Record<string, string> = {
  pending: "Recebemos seu pedido na CS Store",
  paid: "Pagamento aprovado - CS Store",
  preparing: "Seu pedido está em preparação - CS Store",
  shipped: "Seu pedido foi enviado - CS Store",
  delivered: "Pedido entregue - CS Store",
  cancelled: "Pedido cancelado - CS Store",
  canceled: "Pedido cancelado - CS Store",
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://www.storecs.com.br")
    .trim()
    .replace(/\/$/, "")
}

function buildOrderStatusEmailHtml(order: OrderStatusEmailOrder) {
  const orderUrl = `${siteUrl()}/pedido/${order.id}`
  const statusLabel = orderStatusLabel(order.status)
  const itemsHtml = order.items
    .map((item) => {
      const quantity = Math.max(1, Number(item.quantity) || 1)
      const price = Number(item.price) || 0

      return `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee8dd; color: #1a1a1a;">
            ${escapeHtml(item.title)}
            <div style="margin-top: 4px; color: #6f6a63; font-size: 13px;">
              ${quantity} unidade(s) x ${formatCurrency(price)}
            </div>
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee8dd; color: #1a1a1a; text-align: right; font-weight: 600;">
            ${formatCurrency(price * quantity)}
          </td>
        </tr>
      `
    })
    .join("")

  return `
    <div style="margin: 0; padding: 0; background: #f8f6f2; font-family: Arial, sans-serif; color: #1a1a1a;">
      <div style="max-width: 640px; margin: 0 auto; padding: 32px 18px;">
        <div style="background: #ffffff; border: 1px solid #e7e1d8; border-radius: 18px; overflow: hidden;">
          <div style="padding: 28px 26px; border-bottom: 1px solid #eee8dd;">
            <div style="color: #b89535; font-size: 12px; font-weight: 700; letter-spacing: 0.24em; text-transform: uppercase;">
              CS Store
            </div>
            <h1 style="margin: 12px 0 0; font-size: 26px; line-height: 1.25;">
              ${escapeHtml(statusLabel)}
            </h1>
            <p style="margin: 12px 0 0; color: #6f6a63; line-height: 1.6;">
              Olá, ${escapeHtml(order.customerName)}. Seu pedido
              <strong>#${escapeHtml(order.id.slice(-8))}</strong> foi atualizado.
            </p>
          </div>

          <div style="padding: 26px;">
            <div style="padding: 16px; background: #f8f6f2; border-radius: 14px;">
              <div style="font-size: 13px; color: #6f6a63;">Status atual</div>
              <div style="margin-top: 4px; font-size: 18px; font-weight: 700; color: #1a1a1a;">
                ${escapeHtml(statusLabel)}
              </div>
              ${
                order.trackingCode
                  ? `<div style="margin-top: 12px; color: #1a1a1a;"><strong>Código de rastreio:</strong> ${escapeHtml(order.trackingCode)}</div>`
                  : ""
              }
            </div>

            <h2 style="margin: 26px 0 10px; font-size: 18px;">Produtos</h2>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
              ${itemsHtml}
            </table>

            <div style="margin-top: 20px; text-align: right; font-size: 18px; font-weight: 700;">
              Total: ${formatCurrency(Number(order.total) || 0)}
            </div>

            <div style="margin-top: 28px; text-align: center;">
              <a href="${orderUrl}" style="display: inline-block; background: #b89535; color: #111111; text-decoration: none; padding: 13px 22px; border-radius: 999px; font-weight: 700;">
                Acompanhar pedido
              </a>
            </div>
          </div>
        </div>

        <p style="margin: 18px 0 0; color: #8b857d; font-size: 12px; text-align: center;">
          Você recebeu este e-mail porque realizou uma compra na CS Store.
        </p>
      </div>
    </div>
  `
}

export async function sendOrderStatusEmail(
  order: OrderStatusEmailOrder
): Promise<OrderStatusEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const from = process.env.EMAIL_FROM?.trim()
  const to = order.customerEmail?.trim()

  if (!to) {
    return {
      attempted: false,
      sent: false,
      skipped: true,
      message: "Cliente sem e-mail cadastrado.",
    }
  }

  if (!apiKey || !from) {
    return {
      attempted: false,
      sent: false,
      skipped: true,
      message: "Resend nao configurado.",
    }
  }

  const resend = new Resend(apiKey)
  const status = order.status === "canceled" ? "cancelled" : order.status
  const subject = subjectByStatus[status] ?? `Atualização do pedido - CS Store`

  const { data, error } = await resend.emails.send(
    {
      from,
      to,
      subject,
      html: buildOrderStatusEmailHtml({
        ...order,
        status,
      }),
    },
    {
      headers: {
        "Idempotency-Key": `order-status-${order.id}-${status}`,
      },
    }
  )

  if (error) {
    return {
      attempted: true,
      sent: false,
      skipped: false,
      message: "Status atualizado, mas o e-mail nao pôde ser enviado.",
    }
  }

  return {
    attempted: true,
    sent: true,
    skipped: false,
    message: "E-mail de atualização enviado ao cliente.",
    id: data?.id,
  }
}
