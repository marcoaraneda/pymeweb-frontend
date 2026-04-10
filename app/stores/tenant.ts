import { defineStore } from 'pinia'
import { useRuntimeConfig } from 'nuxt/app'
import { useThemeStore } from './theme'

export const useTenantStore = defineStore('tenant', {
  state: () => ({
    data: null as any,
    productos: [] as any[], // Nueva variable para el catálogo
    loading: false,
    slug: '',
    categories: [] as { name: string; slug: string }[],
  }),
  actions: {
    setSlug(slug: string) {
      this.slug = slug
    },
    async fetchTienda() {
      if (!this.slug) return
      try {
        const config = useRuntimeConfig()
        const response = await $fetch(`${config.public.apiBase}/stores/${this.slug}/`)
        this.data = response
        // Aplica tema persistido en backend (fallback al tema local si ya existía).
        const theme = useThemeStore()
        theme.loadFromStorage()
        const storeAny = response as any
        if (storeAny?.accent_color || storeAny?.gradient_from || storeAny?.gradient_to) {
          theme.setStoreTheme(this.slug, {
            accent: storeAny?.accent_color || undefined,
            gradientFrom: storeAny?.gradient_from || undefined,
            gradientTo: storeAny?.gradient_to || undefined,
          })
        }
        theme.applyStoreTheme(this.slug)
      } catch (error) {
        console.error("Error tienda:", error)
        throw error
      }
    },
    async fetchProductos(params: Record<string, any> = {}) {
      if (!this.slug) return
      this.loading = true
      try {
        const config = useRuntimeConfig()
        const search = new URLSearchParams(params as any).toString()
        const url = `${config.public.apiBase}/store/${this.slug}/catalogo/products/${search ? `?${search}` : ''}`
        const response = await $fetch(url)
        // Algunas respuestas vienen paginadas { results: [...], count, next, previous }
        this.productos = Array.isArray(response) ? response : ((response as any)?.results || [])
        this.categories = Array.from(
          new Map(
            (this.productos || [])
              .map((p: any) => p?.category)
              .filter((c: any) => c && (c.slug || c.name))
              .map((c: any) => [c.slug || c.name, { name: c.name || c.slug, slug: c.slug || c.name }])
          ).values()
        )
      } catch (error) {
        console.error("Error catálogo:", error)
        this.productos = []
        this.categories = []
      } finally {
        this.loading = false
      }
    },

    async fetchCategories() {
      if (!this.slug) return
      try {
        const config = useRuntimeConfig()
        const url = `${config.public.apiBase}/store/${this.slug}/catalogo/categories/`
        const response = await $fetch<{ name: string; slug: string }[]>(url)
        this.categories = response
      } catch (error) {
        console.error('Error categorías:', error)
      }
    }
  }
})