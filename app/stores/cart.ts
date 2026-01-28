import { defineStore } from 'pinia'

type CartItem = {
  id: number | string
  name: string
  price: number
  image?: string | null
  quantity: number
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    itemsByContext: {} as Record<string, CartItem[]>,
    currentContext: 'marketplace',
  }),

  getters: {
    items: (state) => state.itemsByContext[state.currentContext] || [],

    totalItems(): number {
      return this.items.reduce((acc, item) => acc + item.quantity, 0)
    },

    totalPrice(): number {
      return this.items.reduce((acc, item) => acc + item.price * item.quantity, 0)
    },
  },

  actions: {
    setContext(contextKey: string) {
      this.currentContext = contextKey || 'marketplace'
      if (!this.itemsByContext[this.currentContext]) {
        this.itemsByContext[this.currentContext] = []
      }
      this.saveToStorage()
    },

    addProduct(product: any) {
      const list = this.ensureContext()
      const existing = list.find((item) => item.id === product.id)

      if (existing) {
        existing.quantity++
      } else {
        list.push({
          id: product.id,
          name: product.name,
          price: Number(product.offer_price || product.price),
          image: product.images?.[0]?.image || product.image || null,
          quantity: 1,
        })
      }

      this.saveToStorage()
    },

    removeProduct(productId: number | string) {
      const list = this.ensureContext()
      this.itemsByContext[this.currentContext] = list.filter((item) => item.id !== productId)
      this.saveToStorage()
    },

    updateQuantity(productId: number | string, qty: number) {
      const list = this.ensureContext()
      const item = list.find((i) => i.id === productId)
      if (!item) return

      item.quantity = qty <= 0 ? 1 : qty
      this.saveToStorage()
    },

    clearCart() {
      this.itemsByContext[this.currentContext] = []
      this.saveToStorage()
    },

    saveToStorage() {
      if (process.client) {
        localStorage.setItem('cart-contexts', JSON.stringify(this.itemsByContext))
      }
    },

    loadFromStorage() {
      if (!process.client) return
      const raw = localStorage.getItem('cart-contexts') || localStorage.getItem('cart')
      if (!raw) return
      try {
        const parsed = JSON.parse(raw)
        // Backward compatibility: if previous value was an array, map it to marketplace context
        if (Array.isArray(parsed)) {
          this.itemsByContext = { marketplace: parsed }
        } else {
          this.itemsByContext = parsed || {}
        }
      } catch (e) {
        this.itemsByContext = { marketplace: [] }
      }
      if (!this.itemsByContext[this.currentContext]) {
        this.itemsByContext[this.currentContext] = []
      }
    },

    ensureContext() {
      if (!this.itemsByContext[this.currentContext]) {
        this.itemsByContext[this.currentContext] = []
      }
      return this.itemsByContext[this.currentContext]
    },
  },
})
