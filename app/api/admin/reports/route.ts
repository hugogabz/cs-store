import { NextRequest, NextResponse } from "next/server"
import { isAdminAuthenticated, unauthorizedResponse } from "@/backend/services/admin-auth"
import { getPrisma } from "@/backend/services/prisma"

type ReportPeriod = "today" | "7d" | "30d" | "all"

type ProductSales = {
  productId: string | null
  title: string
  quantitySold: number
  revenue: number
  stock: number
}

const periodLabels: Record<ReportPeriod, string> = {
  today: "Hoje",
  "7d": "Ultimos 7 dias",
  "30d": "Ultimos 30 dias",
  all: "Todo periodo",
}

function normalizePeriod(value: string | null): ReportPeriod {
  if (value === "today" || value === "7d" || value === "30d" || value === "all") {
    return value
  }

  return "30d"
}

function getDateFilter(period: ReportPeriod) {
  if (period === "all") {
    return undefined
  }

  const start = new Date()

  if (period === "today") {
    start.setHours(0, 0, 0, 0)
  }

  if (period === "7d") {
    start.setDate(start.getDate() - 7)
  }

  if (period === "30d") {
    start.setDate(start.getDate() - 30)
  }

  return {
    gte: start,
  }
}

function stockStatus(stock: number) {
  if (stock <= 0) {
    return "out"
  }

  if (stock <= 5) {
    return "low"
  }

  return "available"
}

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return unauthorizedResponse()
  }

  const period = normalizePeriod(request.nextUrl.searchParams.get("period"))
  const createdAt = getDateFilter(period)
  const orderWhere = createdAt ? { createdAt } : undefined
  const paidOrderWhere = createdAt
    ? {
        status: "paid",
        createdAt,
      }
    : {
        status: "paid",
      }

  const prisma = getPrisma()

  const [
    totalOrders,
    paidOrders,
    pendingOrders,
    canceledOrders,
    paidTotals,
    products,
    paidOrdersWithItems,
  ] = await Promise.all([
    prisma.order.count({
      where: orderWhere,
    }),
    prisma.order.count({
      where: {
        ...orderWhere,
        status: "paid",
      },
    }),
    prisma.order.count({
      where: {
        ...orderWhere,
        status: "pending",
      },
    }),
    prisma.order.count({
      where: {
        ...orderWhere,
        status: {
          in: ["canceled", "cancelled"],
        },
      },
    }),
    prisma.order.aggregate({
      where: paidOrderWhere,
      _sum: {
        total: true,
      },
    }),
    prisma.product.findMany({
      select: {
        id: true,
        title: true,
        stock: true,
      },
      orderBy: {
        title: "asc",
      },
    }),
    prisma.order.findMany({
      where: paidOrderWhere,
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ])

  const productStock = new Map(
    products.map((product) => [
      product.id,
      {
        title: product.title,
        stock: product.stock,
      },
    ])
  )
  const sales = new Map<string, ProductSales>()

  for (const order of paidOrdersWithItems) {
    for (const item of order.items) {
      const key = item.productId ?? item.title
      const stockData = item.productId ? productStock.get(item.productId) : null
      const current = sales.get(key) ?? {
        productId: item.productId,
        title: stockData?.title ?? item.title,
        quantitySold: 0,
        revenue: 0,
        stock: stockData?.stock ?? 0,
      }

      current.quantitySold += item.quantity
      current.revenue += item.price * item.quantity
      sales.set(key, current)
    }
  }

  const soldProducts = Array.from(sales.values()).sort((a, b) => {
    if (b.quantitySold !== a.quantitySold) {
      return b.quantitySold - a.quantitySold
    }

    return b.revenue - a.revenue
  })

  const stockControl = products.map((product) => {
    const sale = sales.get(product.id)

    return {
      productId: product.id,
      title: product.title,
      stock: product.stock,
      status: stockStatus(product.stock),
      quantitySold: sale?.quantitySold ?? 0,
      revenue: sale?.revenue ?? 0,
    }
  })

  const productsSold = soldProducts.reduce((total, product) => {
    return total + product.quantitySold
  }, 0)
  const totalStock = products.reduce((total, product) => {
    return total + product.stock
  }, 0)

  return NextResponse.json({
    period,
    periodLabel: periodLabels[period],
    summary: {
      totalOrders,
      paidOrders,
      pendingOrders,
      canceledOrders,
      totalRevenue: paidTotals._sum.total ?? 0,
      productsSold,
      registeredProducts: products.length,
      totalStock,
    },
    bestSellingProducts: soldProducts,
    stockControl,
  })
}
