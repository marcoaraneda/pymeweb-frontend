import { defineStore } from 'pinia'

export const useTenantStore = defineStore('tenant', {
  state: () => ({
    data: null as any,
    productos: [] as any[], // Nueva variable para el catálogo
    loading: false,
    slug: ''
  }),
  actions: {
    setSlug(slug: string) {
      this.slug = slug
    },
    async fetchTienda() {
      if (!this.slug) return
      try {
        const response = await $fetch(`http://127.0.0.1:8000/api/stores/${this.slug}/`)
        this.data = response
      } catch (error) { console.error("Error tienda:", error) }
    },
    async fetchProductos() {
      if (!this.slug) return
      this.loading = true
      try {
        // Esta URL coincide con tu ProductListAPIView
        const response = await $fetch(`http://127.0.0.1:8000/api/store/${this.slug}/catalogo/productos/`)
        this.productos = response as any[]
      } catch (error) {
        console.error("Error catálogo:", error)
        this.productos = []
      } finally {
        this.loading = false
      }
    }
  }
})