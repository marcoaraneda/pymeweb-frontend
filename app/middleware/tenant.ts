import { defineNuxtRouteMiddleware, navigateTo } from "nuxt/app"
import { useTenantStore } from "~/stores/tenant"

export default defineNuxtRouteMiddleware(async (to) => {
  const slug = to.params.slug as string | undefined
  if (!slug) return

  const tenantStore = useTenantStore()
  tenantStore.setSlug(slug)

  // Si no hay tienda cargada o es otra, intentamos cargarla; si falla, redirigimos
  if (!tenantStore.data || tenantStore.data.slug !== slug) {
    try {
      await tenantStore.fetchTienda()
    } catch (error) {
      return navigateTo('/')
    }
  }
})