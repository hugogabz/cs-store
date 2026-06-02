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

type NormalizedShippingProduct = {
  id: string
  width: number
  height: number
  length: number
  weight: number
  insurance_value: number
  quantity: number
}

type MelhorEnvioPayload = {
  from: {
    postal_code: string
  }
  to: {
    postal_code: string
  }
  products: NormalizedShippingProduct[]
}

type MelhorEnvioService = {
  id?: string | number
  name?: string
  price?: string | number | null
  custom_price?: string | number | null
  delivery_time?: string | number | null
  custom_delivery_time?: string | number | null
  company?: {
    name?: string
  } | null
  error?: unknown
}

const DEFAULT_PRODUCT_DIMENSIONS = {
  weight: 0.3,
  height: 8,
  width: 16,
  length: 24,
}

function sanitizeCep(value: unknown) {
  return String(value ?? "").replace(/\D/g, "")
}

function normalizePositiveNumber(value: unknown, fallback: number) {
  const number = Number(value)

  if (!Number.isFinite(number) || number <= 0) {
    return fallback
  }

  return number
}

function normalizeQuantity(value: unknown) {
  const quantity = Number.parseInt(String(value ?? "0"), 10)

  if (!Number.isFinite(quantity)) return 0

  return Math.max(0, quantity)
}

function normalizeShippingPrice(value: unknown) {
  const price = Number(String(value ?? "").replace(",", "."))

  if (!Number.isFinite(price) || price <= 0) {
    return null
  }

  return price
}

function normalizeDeliveryTime(value: unknown) {
  const deliveryTime = Number.parseInt(String(value ?? "0"), 10)

  if (!Number.isFinite(deliveryTime) || deliveryTime <= 0) {
    return 0
  }

  return deliveryTime
}

function getMelhorEnvioApiUrl() {
  const baseUrl =
    process.env.MELHOR_ENVIO_API_URL ?? "https://www.melhorenvio.com.br"

  return `${baseUrl.replace(/\/$/, "")}/api/v2/me/shipment/calculate`
}

function getMelhorEnvioToken() {
  return process.env.MELHOR_ENVIO_TOKEN?.trim() ?? ""
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
      name: "Jadlog Economico",
      company: "Jadlog",
      price: 22.9,
      deliveryTime: 4,
    },
  ]
}

function normalizeMelhorEnvioResponse(data: unknown): ShippingOption[] {
  if (!Array.isArray(data)) {
    return []
  }

  return data.flatMap((service: MelhorEnvioService) => {
    if (service.error) {
      return []
    }

    const price = normalizeShippingPrice(
      service.custom_price ?? service.price
    )

    if (!price) {
      return []
    }

    return [
      {
        id: String(service.id ?? service.name ?? price),
        name: service.name ?? "Frete",
        company: service.company?.name ?? "Melhor Envio",
        price,
        deliveryTime: normalizeDeliveryTime(
          service.custom_delivery_time ?? service.delivery_time
        ),
      },
    ]
  })
}

async function calculateMelhorEnvioShipping(payload: MelhorEnvioPayload) {
  const token = getMelhorEnvioToken()

  if (!token) {
    return calculateMockShipping()
  }

  console.log("[shipping/calculate] calling Melhor Envio API", {
    url: getMelhorEnvioApiUrl(),
    productCount: payload.products.length,
  })

  const response = await fetch(getMelhorEnvioApiUrl(), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "User-Agent":
        process.env.MELHOR_ENVIO_USER_AGENT ??
        "CS Store (contato@csstore.com.br)",
    },
    body: JSON.stringify(payload),
  }).catch(() => {
    throw new Error("Falha ao conectar com a API do Melhor Envio.")
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const message =
      typeof data?.message === "string"
        ? data.message
        : "Nao foi possivel calcular o frete no Melhor Envio."

    throw new Error(message)
  }

  const options = normalizeMelhorEnvioResponse(data)

  if (options.length === 0) {
    throw new Error("O Melhor Envio nao retornou opcoes de frete disponiveis.")
  }

  return options
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const cepDestino = sanitizeCep(body?.cepDestino)
  const cepOrigem = sanitizeCep(process.env.STORE_ORIGIN_CEP)
  const melhorEnvioToken = getMelhorEnvioToken()
  const items = body?.items

  if (cepDestino.length !== 8) {
    return NextResponse.json(
      {
        message: "Informe um CEP valido com 8 digitos.",
      },
      {
        status: 400,
      }
    )
  }

  if (melhorEnvioToken && cepOrigem.length !== 8) {
    return NextResponse.json(
      {
        message:
          "Configure STORE_ORIGIN_CEP com um CEP de origem valido com 8 digitos.",
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
        message: "Produto invalido no carrinho. Remova e adicione novamente.",
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
        message: "Um ou mais produtos nao foram encontrados.",
      },
      {
        status: 400,
      }
    )
  }

  const subtotal = normalizedItems.reduce((acc, item) => {
    const product = products.find(
      (currentProduct) => currentProduct.id === item.productId
    )

    return acc + (product?.price ?? 0) * item.quantity
  }, 0)

  const melhorEnvioPayload: MelhorEnvioPayload = {
    from: {
      postal_code: cepOrigem,
    },
    to: {
      postal_code: cepDestino,
    },
    products: normalizedItems.map((item) => {
      const product = products.find(
        (currentProduct) => currentProduct.id === item.productId
      )

      return {
        id: item.productId,
        width: normalizePositiveNumber(
          product?.width,
          DEFAULT_PRODUCT_DIMENSIONS.width
        ),
        height: normalizePositiveNumber(
          product?.height,
          DEFAULT_PRODUCT_DIMENSIONS.height
        ),
        length: normalizePositiveNumber(
          product?.length,
          DEFAULT_PRODUCT_DIMENSIONS.length
        ),
        weight: normalizePositiveNumber(
          product?.weight,
          DEFAULT_PRODUCT_DIMENSIONS.weight
        ),
        insurance_value: normalizePositiveNumber(product?.price, 1),
        quantity: item.quantity,
      }
    }),
  }

  const shippingMode = melhorEnvioToken ? "melhor-envio" : "mock"

  console.log("[shipping/calculate]", {
    mode: shippingMode,
    hasMelhorEnvioToken: Boolean(melhorEnvioToken),
    cepOrigem: cepOrigem || null,
    cepDestino,
    products: melhorEnvioPayload.products,
  })

  try {
    const shippingOptions = melhorEnvioToken
      ? await calculateMelhorEnvioShipping(melhorEnvioPayload)
      : calculateMockShipping()

    return NextResponse.json({
      options: shippingOptions,
      subtotal,
      provider: shippingMode,
      payloadPreview: {
        ...melhorEnvioPayload,
        from: {
          postal_code: cepOrigem ? "configured" : null,
        },
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Nao foi possivel calcular o frete no Melhor Envio.",
      },
      {
        status: 502,
      }
    )
  }
}
