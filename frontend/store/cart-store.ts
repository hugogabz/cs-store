import { create } from "zustand"
import { persist } from "zustand/middleware"
import { toNumberPrice } from "@/shared/utils/currency"
import { normalizeProductImageSrc } from "@/shared/utils/images"

type CartItem = {
  id: number
  productId?: string | null
  title: string
  price: number
  image: string
  stock: number
  quantity: number
}

type CartStore = {
  items: CartItem[]

  addItem: (
    item: Omit<CartItem, "id" | "quantity">
  ) => boolean

  removeItem: (id: number) => void

  increaseQuantity: (id: number) => boolean

  decreaseQuantity: (id: number) => void

  isOpen: boolean

  openCart: () => void

  closeCart: () => void
}

function getAvailableStock(stock: number | undefined) {
  if (stock === undefined) return Number.POSITIVE_INFINITY

  const parsedStock = Number(stock)

  if (!Number.isFinite(parsedStock)) return 0

  return Math.max(0, Math.floor(parsedStock))
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      isOpen: false,

      addItem: (item) => {
        const availableStock = getAvailableStock(item.stock)

        if (availableStock <= 0) {
          return false
        }

        const state = get()
        const existingItem = state.items.find((product) =>
          item.productId
            ? product.productId === item.productId
            : product.title === item.title
        )

        if (existingItem && Math.max(1, existingItem.quantity) >= availableStock) {
          return false
        }

        set((state) => {
          const normalizedItem = {
            ...item,
            image: normalizeProductImageSrc(item.image),
            price: toNumberPrice(item.price),
            stock: availableStock,
          }

          const existingItem = state.items.find((product) =>
            normalizedItem.productId
              ? product.productId === normalizedItem.productId
              : product.title === normalizedItem.title
          )

          if (existingItem) {
            return {
              items: state.items.map((product) =>
                (
                  normalizedItem.productId
                    ? product.productId === normalizedItem.productId
                    : product.title === normalizedItem.title
                )
                  ? {
                      ...product,
                      productId: normalizedItem.productId,
                      price: normalizedItem.price,
                      image: normalizedItem.image,
                      stock: normalizedItem.stock,
                      quantity: Math.max(1, product.quantity) + 1,
                    }
                  : product
              ),
            }
          }

          return {
            items: [
              ...state.items,
              {
                ...normalizedItem,
                id: Date.now(),
                quantity: 1,
              },
            ],
          }
        })

        return true
      },

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      increaseQuantity: (id) => {
        const item = get().items.find((cartItem) => cartItem.id === id)

        if (!item) return false

        const availableStock = getAvailableStock(item.stock)

        if (availableStock <= 0 || Math.max(1, item.quantity) >= availableStock) {
          return false
        }

        set((state) => ({
          items: state.items.map((cartItem) =>
            cartItem.id === id
              ? {
                  ...cartItem,
                  stock: availableStock,
                  quantity: Math.max(1, cartItem.quantity) + 1,
                }
              : cartItem
          ),
        }))

        return true
      },

      decreaseQuantity: (id) =>
        set((state) => ({
          items: state.items
            .map((item) =>
              item.id === id
                ? {
                    ...item,
                    quantity: Math.max(1, item.quantity) - 1,
                  }
                : item
            )
            .filter((item) => item.quantity > 0),
        })),

      openCart: () => set({ isOpen: true }),

      closeCart: () => set({ isOpen: false }),
    }),
    {
      name: "cs-store-cart",
    }
  )
)
