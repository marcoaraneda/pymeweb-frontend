import { defineStore } from 'pinia'

type CartItem = {
  id: number | string
  name: string
  price: number
  image?: string | null
  quantity: number
  max?: number | null
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    itemsByContext: {} as Record<string, CartItem[]>,
    currentContext: 'marketplace',
    lastNotice: '' as string,
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
    clampQuantity(qty: number, max?: number | null) {
      const safe = Number.isFinite(qty) ? qty : 0
      const limited = max && Number.isFinite(max) ? Math.min(safe, max) : safe
      return Math.max(1, limited)
    },

    limitQuantity(qty: number, max?: number | null) {
      const desired = Number.isFinite(qty) ? qty : 0
      const limited = this.clampQuantity(desired, max)
      return { qty: limited, clamped: limited < desired }
    },

    setNotice(msg?: string) {
      this.lastNotice = msg || ''
    },

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

      const unitPrice = Number(product.offer_price || product.price || 0)
      const max = Number.isFinite(product?.stock_available) ? Number(product.stock_available) : null

      if (existing) {
        const { qty, clamped } = this.limitQuantity(existing.quantity + 1, max ?? existing.max)
        existing.quantity = qty
        existing.max = max ?? existing.max
        this.setNotice(clamped ? `Stock limitado a ${qty} unidades` : '')
      } else {
        const { qty, clamped } = this.limitQuantity(1, max)
        list.push({
          id: product.id,
          name: product.name,
          price: Number.isFinite(unitPrice) ? unitPrice : 0,
          image: product.images?.[0]?.image || product.image || null,
          quantity: qty,
          max,
        })
        this.setNotice(clamped ? `Stock limitado a ${qty} unidades` : '')
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

      const { qty: limited, clamped } = this.limitQuantity(qty, item.max)
      item.quantity = limited
      this.setNotice(clamped ? `Stock limitado a ${limited} unidades` : '')
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
