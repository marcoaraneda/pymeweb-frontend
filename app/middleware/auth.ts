import { defineNuxtRouteMiddleware, navigateTo } from "nuxt/app"
import { useAuthStore } from "~/stores/auth"
import { useTenantStore } from "~/stores/tenant"

export default defineNuxtRouteMiddleware(async (to) => {
  const slug = to.params.slug as string | undefined
  const needsAuth = Boolean(to.meta?.requiresAuth) || (to.path.includes('/admin') && !to.path.includes('/login'))
  if (!needsAuth) return

  const auth = useAuthStore()
  const tenant = useTenantStore()

  if (slug) tenant.setSlug(slug)

  // Asegura tokens desde cookies en navegación directa
  if (!auth.token) {
    auth.restoreFromCookies()
  }

  const loginPath = '/login'

  // Si no hay token, envia a login
  if (!auth.token) {
    return navigateTo(loginPath)
  }

  // Si no hay usuario cargado, intenta cargar perfil y refrescar si vence
  if (!auth.user) {
    const profile = await auth.fetchProfile()
    if (!profile) {
      auth.logout({ redirectTo: loginPath })
      return
    }
  }
})