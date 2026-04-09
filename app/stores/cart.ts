import { defineStore } from 'pinia'

type CartItem = {
  id: number | string
  name: string
  price: number
  basePrice?: number
  offerPrice?: number | null
  offerMinQty?: number
  image?: string | null
  quantity: number
  max?: number | null
  storeSlug?: string
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
    resolveUnitPrice(basePrice: number, offerPrice?: number | null, offerMinQty = 1, quantity = 1) {
      const safeBase = Number.isFinite(basePrice) ? Number(basePrice) : 0
      const safeOffer = Number.isFinite(Number(offerPrice)) ? Number(offerPrice) : null
      const minQty = Math.max(1, Number(offerMinQty) || 1)
      if (safeOffer != null && safeOffer >= 0 && quantity >= minQty) {
        return safeOffer
      }
      return safeBase
    },

    recalculateItemPrice(item: CartItem) {
      const basePrice = Number.isFinite(Number(item.basePrice)) ? Number(item.basePrice) : Number(item.price || 0)
      const offerPrice = Number.isFinite(Number(item.offerPrice)) ? Number(item.offerPrice) : null
      const offerMinQty = Math.max(1, Number(item.offerMinQty) || 1)
      item.basePrice = basePrice
      item.offerPrice = offerPrice
      item.offerMinQty = offerMinQty
      item.price = this.resolveUnitPrice(basePrice, offerPrice, offerMinQty, item.quantity)
    },

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

      const basePrice = Number(product.price || 0)
      const offerPrice = product.offer_price != null ? Number(product.offer_price) : null
      const offerMinQty = Math.max(1, Number(product.offer_min_qty) || 1)
      const max = Number.isFinite(product?.stock_available) ? Number(product.stock_available) : null

      if (existing) {
        const { qty, clamped } = this.limitQuantity(existing.quantity + 1, max ?? existing.max)
        existing.quantity = qty
        existing.max = max ?? existing.max
        existing.storeSlug = product.store?.slug || existing.storeSlug || 'marketplace'
        existing.basePrice = basePrice
        existing.offerPrice = offerPrice
        existing.offerMinQty = offerMinQty
        this.recalculateItemPrice(existing)
        this.setNotice(clamped ? `Stock limitado a ${qty} unidades` : '')
      } else {
        const { qty, clamped } = this.limitQuantity(1, max)
        const item: CartItem = {
          id: product.id,
          name: product.name,
          price: Number.isFinite(basePrice) ? basePrice : 0,
          basePrice: Number.isFinite(basePrice) ? basePrice : 0,
          offerPrice,
          offerMinQty,
          image: product.images?.[0]?.image || product.image || null,
          quantity: qty,
          max,
          storeSlug: product.store?.slug || 'marketplace',
        }
        this.recalculateItemPrice(item)
        list.push({
          ...item,
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
      this.recalculateItemPrice(item)
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
      Object.values(this.itemsByContext).forEach((items) => {
        items.forEach((item) => this.recalculateItemPrice(item as CartItem))
      })
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
