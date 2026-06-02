import { NextResponse } from "next/server"
import { getPrisma } from "@/services/prisma"

type ShippingRequestItem = {
  productId?: unknown
  quantity?: unknown
}

type ShippingOption = {
  id: string
  name: string
  company: string
  price: number
  deliveryTime: number
}

function sanitizeCep(value: unknown) {
  return String(value ?? "").replace(/\D/g, "")
}

function normalizeQuantity(value: unknown) {
  const quantity = Number.parseInt(String(value ?? "0"), 10)

  if (!Number.isFinite(quantity)) return 0

  return Math.max(0, quantity)
}

function calculateMockShipping(): ShippingOption[] {
  return [
    {
      id: "pac",
      name: "Correios PAC",
      company: "Correios",
      price: 18.9,
      deliveryTime: 6,
    },
    {
      id: "sedex",
      name: "Correios Sedex",
      company: "Correios",
      price: 32.5,
      deliveryTime: 2,
    },
    {
      id: "jadlog",
      name: "Jadlog Econômico",
      company: "Jadlog",
      price: 22.9,
      deliveryTime: 4,
    },
  ]
}

async function calculateMelhorEnvioShipping() {
  // Futuro Melhor Envio:
  // 1. Montar payload com from.postal_code, to.postal_code e products.
  // 2. Chamar a API no backend com MELHOR_ENVIO_TOKEN.
  // 3. Normalizar transportadoras/preços/praz para o formato ShippingOption.
  // Token nunca deve ir para o frontend.
  return []
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const cepDestino = sanitizeCep(body?.cepDestino)
  const items = body?.items

  if (cepDestino.length !== 8) {
    return NextResponse.json(
      {
        message: "Informe um CEP válido com 8 dígitos.",
      },
      {
        status: 400,
      }
    )
  }

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      {
        message: "Carrinho vazio. Adicione produtos antes de calcular o frete.",
      },
      {
        status: 400,
      }
    )
  }

  const normalizedItems = (items as ShippingRequestItem[]).map((item) => ({
    productId: typeof item.productId === "string" ? item.productId : "",
    quantity: normalizeQuantity(item.quantity),
  }))

  const invalidItem = normalizedItems.find(
    (item) => !item.productId || item.quantity <= 0
  )

  if (invalidItem) {
    return NextResponse.json(
      {
        message: "Produto inválido no carrinho. Remova e adicione novamente.",
      },
      {
        status: 400,
      }
    )
  }

  const prisma = getPrisma()
  const products = await prisma.product.findMany({
    where: {
      id: {
        in: normalizedItems.map((item) => item.productId),
      },
    },
  })

  if (products.length !== normalizedItems.length) {
    return NextResponse.json(
      {
        message: "Um ou mais produtos não foram encontrados.",
      },
      {
        status: 400,
      }
    )
  }

  const subtotal = normalizedItems.reduce((acc, item) => {
    const product = products.find((currentProduct) => currentProduct.id === item.productId)

    return acc + (product?.price ?? 0) * item.quantity
  }, 0)

  const melhorEnvioPayload = {
    from: {
      postal_code: process.env.STORE_ORIGIN_CEP,
    },
    to: {
      postal_code: cepDestino,
    },
    products: normalizedItems.map((item) => {
      const product = products.find((currentProduct) => currentProduct.id === item.productId)

      return {
        id: item.productId,
        width: product?.width ?? 16,
        height: product?.height ?? 8,
        length: product?.length ?? 24,
        weight: product?.weight ?? 0.3,
        insurance_value: product?.price ?? 0,
        quantity: item.quantity,
      }
    }),
  }

  const shippingOptions = process.env.MELHOR_ENVIO_TOKEN
    ? await calculateMelhorEnvioShipping()
    : calculateMockShipping()

  return NextResponse.json({
    options: shippingOptions,
    subtotal,
    provider: process.env.MELHOR_ENVIO_TOKEN ? "melhor-envio" : "mock",
    payloadPreview: {
      ...melhorEnvioPayload,
      from: {
        postal_code: process.env.STORE_ORIGIN_CEP ? "configured" : null,
      },
    },
  })
}
