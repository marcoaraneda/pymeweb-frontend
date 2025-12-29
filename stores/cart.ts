// stores/cart.ts
import { defineStore } from 'pinia'

export interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  slug: string
  image?: string
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[]
  }),

  getters: {
    totalItems: (state) =>
      state.items.reduce((sum, item) => sum + item.quantity, 0),

    totalPrice: (state) =>
      state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  },

  actions: {
    addProduct(product: Omit<CartItem, 'quantity'>) {
      const existing = this.items.find(i => i.id === product.id)

      if (existing) {
        existing.quantity++
      } else {
        this.items.push({
          ...product,
          quantity: 1
        })
      }
    },

    removeProduct(id: number) {
      this.items = this.items.filter(item => item.id !== id)
    },

    clearCart() {
      this.items = []
    }
  }
})
