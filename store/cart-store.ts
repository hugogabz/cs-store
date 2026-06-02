import { create } from "zustand"
import { persist } from "zustand/middleware"
import { toNumberPrice } from "@/utils/currency"
import { normalizeProductImageSrc } from "@/utils/images"

type CartItem = {
  id: number
  title: string
  price: number
  image: string
  quantity: number
}

type CartStore = {
  items: CartItem[]

  addItem: (
    item: Omit<CartItem, "id" | "quantity">
  ) => void

  removeItem: (id: number) => void

  increaseQuantity: (id: number) => void

  decreaseQuantity: (id: number) => void

  isOpen: boolean

  openCart: () => void

  closeCart: () => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],

      isOpen: false,

      addItem: (item) =>
        set((state) => {
          const normalizedItem = {
            ...item,
            image: normalizeProductImageSrc(item.image),
            price: toNumberPrice(item.price),
          }

          const existingItem = state.items.find(
            (product) => product.title === normalizedItem.title
          )

          if (existingItem) {
            return {
              items: state.items.map((product) =>
                product.title === normalizedItem.title
                  ? {
                      ...product,
                      price: normalizedItem.price,
                      image: normalizedItem.image,
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
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      increaseQuantity: (id) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? {
                  ...item,
                  quantity: Math.max(1, item.quantity) + 1,
                }
              : item
          ),
        })),

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
