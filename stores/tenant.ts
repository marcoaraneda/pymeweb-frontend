import { defineStore } from 'pinia'

export const useTenantStore = defineStore('tenant', {
  state: () => ({
    data: null as any,
    loading: false,
    slug: ''
  }),
  actions: {
    setSlug(slug: string) {
      this.slug = slug
    },
    async fetchTienda() {
      if (!this.slug) return
      
      this.loading = true
      try {
        // Usamos la URL de tu API en Django
        const response = await $fetch(`http://127.0.0.1:8000/api/stores/${this.slug}/`)
        this.data = response
      } catch (error) {
        console.error("Error al obtener la tienda:", error)
        this.data = null
      } finally {
        this.loading = false
      }
    }
  }
})