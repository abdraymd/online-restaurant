import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from '@/types'

interface CartState {
  restaurantId: string | null
  items: CartItem[]
  addItem: (item: CartItem, restaurantId: string) => void
  removeItem: (menuItemId: string) => void
  updateQuantity: (menuItemId: string, delta: number) => void
  clearCart: () => void
  totalCents: () => number
  itemCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      restaurantId: null,
      items: [],

      addItem: (item, restaurantId) => {
        const state = get()
        // If different restaurant, clear cart and start fresh
        if (state.restaurantId && state.restaurantId !== restaurantId) {
          set({ restaurantId, items: [{ ...item, quantity: 1 }] })
          return
        }

        const existing = state.items.find((i) => i.menuItemId === item.menuItemId)
        if (existing) {
          set({
            restaurantId,
            items: state.items.map((i) =>
              i.menuItemId === item.menuItemId
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          })
        } else {
          set({
            restaurantId,
            items: [...state.items, { ...item, quantity: 1 }],
          })
        }
      },

      removeItem: (menuItemId) => {
        const state = get()
        const newItems = state.items.filter((i) => i.menuItemId !== menuItemId)
        set({
          items: newItems,
          restaurantId: newItems.length === 0 ? null : state.restaurantId,
        })
      },

      updateQuantity: (menuItemId, delta) => {
        set((state) => ({
          items: state.items.map((i) => {
            if (i.menuItemId !== menuItemId) return i
            const newQty = Math.max(1, i.quantity + delta)
            return { ...i, quantity: newQty }
          }),
        }))
      },

      clearCart: () => set({ restaurantId: null, items: [] }),

      totalCents: () => {
        return get().items.reduce(
          (sum, item) => sum + item.priceCents * item.quantity,
          0
        )
      },

      itemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },
    }),
    {
      name: 'cart-storage',
    }
  )
)
