<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <header class="relative overflow-hidden border-b border-slate-200 bg-white/85 backdrop-blur">
      <div class="pointer-events-none absolute inset-0" aria-hidden="true">
        <div class="absolute -left-12 top-6 h-40 w-40 rounded-full" :style="gradientStyle" />
        <div class="absolute -right-10 -bottom-6 h-48 w-48 rounded-full" :style="gradientStyle" />
      </div>
      <div class="relative mx-auto flex max-w-7xl items-center justify-between gap-5 px-6 py-4">
        <div class="flex flex-shrink-0 items-center gap-3">
          <button
            class="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-white shadow ring-1 ring-slate-200"
            :aria-label="canEditBrand ? 'Cambiar imagen de la tienda' : 'Logo de la tienda'"
            :class="canEditBrand ? 'hover:ring-2 hover:ring-slate-300' : ''"
            @click="canEditBrand && openLogoPrompt()"
          >
            <img v-if="brandLogo" :src="brandLogo" alt="Logo tienda" class="h-full w-full object-cover" />
            <img v-else src="https://placehold.co/120x120?text=Logo" alt="Logo placeholder" class="h-full w-full object-cover" />
            <span v-if="canEditBrand" class="absolute inset-0 flex items-center justify-center bg-black/40 text-[11px] font-semibold text-white opacity-0 transition hover:opacity-100">Cambiar</span>
          </button>
          <div>
            <NuxtLink :to="`/store/${slug}`" class="text-xl font-semibold leading-tight text-slate-900 hover:underline">
              {{ brandName }}
            </NuxtLink>
            <p class="text-xs text-slate-600">Catálogo en vivo</p>
          </div>
        </div>

        <nav class="hidden flex-1 items-center justify-center gap-5 md:flex">
          <NuxtLink to="/" class="text-sm font-semibold text-slate-700 hover:text-slate-900">Menú principal</NuxtLink>
          <NuxtLink to="/marketplace" class="text-sm font-semibold text-slate-700 hover:text-slate-900">Marketplace</NuxtLink>
          <span class="mx-3 h-6 w-px bg-slate-200" aria-hidden="true"></span>
          <template v-if="hasStoreContext">
            <div class="flex items-center gap-5">
              <NuxtLink :to="`/store/${slug}`" class="text-sm font-semibold text-slate-700 hover:text-slate-900">Inicio</NuxtLink>
              <NuxtLink :to="`/store/${slug}/productos`" class="text-sm font-semibold text-slate-700 hover:text-slate-900">Productos</NuxtLink>
              <NuxtLink :to="`/store/${slug}/acerca`" class="text-sm font-semibold text-slate-700 hover:text-slate-900">Acerca de</NuxtLink>
              <NuxtLink :to="`/store/${slug}/soporte`" class="text-sm font-semibold text-slate-700 hover:text-slate-900">Soporte</NuxtLink>
            </div>
          </template>
        </nav>

        <div class="flex flex-shrink-0 flex-nowrap items-center gap-3">
          <button class="md:hidden rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 glass-btn" @click.stop="showMobileNav = !showMobileNav">Menú</button>
          <NuxtLink
            :to="`/store/${slug}/carrito`"
            class="relative flex h-10 w-10 items-center justify-center rounded-xl text-white shadow"
            :style="{ backgroundColor: accentColor }"
            aria-label="Carrito"
          >
            <ShoppingCart class="h-5 w-5" aria-hidden="true" />
            <span
              v-if="cart.totalItems > 0"
              class="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white px-1 text-xs font-semibold text-slate-900"
            >
              {{ cart.totalItems }}
            </span>
          </NuxtLink>

          <NuxtLink
            v-if="!auth.isAuthenticated"
            to="/login"
            class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 hover:border-slate-300"
          >
            Iniciar sesión
          </NuxtLink>
          <div class="flex flex-nowrap items-center gap-2 md:gap-3">
            <NuxtLink
              v-if="hasStores"
              to="/dashboard"
              class="rounded-xl px-4 py-2 text-sm font-semibold text-slate-800 glass-btn"
            >
              Dashboard
            </NuxtLink>
            <div class="relative flex items-center">
              <button
                class="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow ring-1 ring-slate-200 text-slate-800 glass-btn"
                aria-label="Notificaciones"
                @click.stop="showNotifications = !showNotifications"
              >
                <Bell class="h-5 w-5" aria-hidden="true" />
                <span
                  v-if="notificationsCount > 0"
                  class="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white"
                >
                  {{ notificationsCount }}
                </span>
              </button>
              <div
                v-if="showNotifications"
                class="absolute right-0 top-full mt-3 w-64 rounded-2xl border border-slate-200 bg-white p-3 text-sm shadow-lg z-20"
              >
                <div class="flex items-center justify-between">
                  <p class="font-semibold text-slate-800">Notificaciones</p>
                  <button class="text-xs text-slate-600 underline hover:text-slate-900" @click.stop="clearNotifications">Limpiar</button>
                </div>
                <div class="mt-2 space-y-2 max-h-60 overflow-y-auto">
                  <p v-if="!notifications.length" class="text-slate-500">Sin notificaciones.</p>
                  <button
                    v-else
                    v-for="(n, idx) in notifications"
                    :key="idx"
                    class="w-full text-left rounded-lg border border-slate-100 px-2 py-1 text-slate-700 hover:bg-slate-50"
                    @click="handleNotification(n)"
                  >
                    {{ n.message }}
                  </button>
                </div>
              </div>
            </div>
            <NuxtLink
              to="/profile"
              class="flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-800 hover:border-slate-300 whitespace-nowrap"
            >
              <span
                v-if="avatarUrl"
                class="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-slate-100"
              >
                <img :src="avatarUrl" alt="Avatar" class="h-full w-full object-cover" />
              </span>
              <span v-else class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs uppercase">{{ userInitials }}</span>
              <span class="max-w-[120px] truncate">{{ auth.user?.username || 'Perfil' }}</span>
            </NuxtLink>
          </div>
        </div>
      </div>

      <div v-if="showMobileNav" class="md:hidden border-t border-slate-200 bg-white/95 px-6 py-3 text-sm">
        <div class="flex flex-col gap-4">
          <div class="space-y-1">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-500">General</p>
            <NuxtLink to="/" class="block rounded-lg px-3 py-2 hover:bg-slate-100">Menú principal</NuxtLink>
            <NuxtLink to="/marketplace" class="block rounded-lg px-3 py-2 hover:bg-slate-100">Marketplace</NuxtLink>
          </div>
          <div v-if="hasStoreContext" class="space-y-1">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-500">Esta tienda</p>
            <NuxtLink :to="`/store/${slug}`" class="block rounded-lg px-3 py-2 hover:bg-slate-100">Inicio</NuxtLink>
            <NuxtLink :to="`/store/${slug}/productos`" class="block rounded-lg px-3 py-2 hover:bg-slate-100">Productos</NuxtLink>
            <NuxtLink :to="`/store/${slug}/acerca`" class="block rounded-lg px-3 py-2 hover:bg-slate-100">Acerca de</NuxtLink>
            <NuxtLink :to="`/store/${slug}/soporte`" class="block rounded-lg px-3 py-2 hover:bg-slate-100">Soporte</NuxtLink>
            <NuxtLink :to="`/store/${slug}/carrito`" class="block rounded-lg px-3 py-2 hover:bg-slate-100">Carrito</NuxtLink>
          </div>
          <div class="space-y-1">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-500">Cuenta</p>
            <NuxtLink v-if="auth.isAuthenticated && hasStores" to="/dashboard" class="block rounded-lg px-3 py-2 hover:bg-slate-100">Dashboard</NuxtLink>
            <NuxtLink v-if="auth.isAuthenticated" to="/profile" class="block rounded-lg px-3 py-2 hover:bg-slate-100">Perfil</NuxtLink>
            <NuxtLink v-else to="/login" class="block rounded-lg px-3 py-2 hover:bg-slate-100">Iniciar sesión</NuxtLink>
            <button v-if="auth.isAuthenticated" class="w-full rounded-lg px-3 py-2 text-left text-red-600 hover:bg-slate-100" @click="handleLogout">Cerrar sesión</button>
          </div>
        </div>
      </div>
    </header>

    <main class="pb-12 reveal" style="animation-delay: 0.04s;">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, watch, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRuntimeConfig, navigateTo } from 'nuxt/app'
import { ShoppingCart, Bell } from 'lucide-vue-next'
import { useTenantStore } from '~/stores/tenant'
import { useCartStore } from '~/stores/cart'
import { useAuthStore } from '~/stores/auth'
import { useThemeStore } from '~/stores/theme'

const route = useRoute()
const router = useRouter()
const slug = computed(() => route.params.slug as string)

const tenantStore = useTenantStore()
const cart = useCartStore()
const auth = useAuthStore()
const theme = useThemeStore()
const config = useRuntimeConfig()

const brandName = computed(() => tenantStore.data?.name || 'Tu tienda')
const brandInitials = computed(() => (brandName.value || 'T')[0]?.toUpperCase?.() || 'T')
const brandLogo = computed(() => tenantStore.data?.logo_url || tenantStore.data?.logo?.url || tenantStore.data?.logo || '')
const avatarUrl = computed(() => auth.user?.avatar_url || null)
const userInitials = computed(() => (auth.user?.username || 'U').slice(0, 2).toUpperCase())
const accentColor = computed(() => theme.accent || '#2563eb')
const gradientStyle = computed(() => ({ backgroundImage: `linear-gradient(120deg, ${theme.gradientFrom}, ${theme.gradientTo})`, opacity: 0.18 }))
const hasStores = computed(() => ((auth.user as any)?.memberships || []).length > 0)
const hasStoreContext = computed(() => Boolean(slug.value))
const showMobileNav = ref(false)
type NotificationItem = { type: string; message: string; count: number }
type StoreSummary = { notifications?: NotificationItem[] }

const notifications = ref<NotificationItem[]>([])
const notificationsCount = computed(() => notifications.value.reduce((acc, n) => acc + (Number(n.count) || 0), 0))
const showNotifications = ref(false)

const canEditBrand = computed(() => {
  const membership = (auth.user as any)?.memberships || []
  return membership.some((m: any) => m?.store?.slug === slug.value && (m.roles || []).includes('ADMIN'))
})

const applyThemeForSlug = () => {
  theme.loadFromStorage()
  theme.applyStoreTheme(slug.value)
}

const ensureStoreData = async () => {
  tenantStore.setSlug(slug.value)
  if (!tenantStore.data || tenantStore.data.slug !== slug.value) {
    await tenantStore.fetchTienda()
  }
}

const loadNotifications = async () => {
  if (!auth.token) {
    notifications.value = []
    return
  }
  try {
    const data = await $fetch<StoreSummary>(`${config.public.apiBase}/support/dashboard/summary/`, {
      headers: { Authorization: `Bearer ${auth.token}` },
      params: slug.value ? { store: slug.value } : {},
    })
    notifications.value = data?.notifications || []
  } catch (error) {
    console.warn('No se pudieron cargar notificaciones', error)
    notifications.value = []
  }
}

const clearNotifications = () => {
  notifications.value = []
  showNotifications.value = false
}

const goTickets = async () => {
  showNotifications.value = false
  await navigateTo('/dashboard/tickets')
}

const handleNotification = async (n: any) => {
  showNotifications.value = false
  if (n?.type === 'ticket_detail') {
    await navigateTo(`/store/${slug.value}/soporte`)
    return
  }
  if (n?.type?.startsWith('ticket')) {
    await navigateTo('/dashboard/tickets')
  }
}

const openLogoPrompt = async () => {
  if (!canEditBrand.value) return
  const url = window.prompt('Pega la URL del logo (se guardará para esta tienda):', brandLogo.value || '')
  if (!url || !url.trim()) return
  try {
    await $fetch(`${config.public.apiBase}/stores/${slug.value}/`, {
      method: 'PATCH',
      body: { logo_url: url.trim() },
      headers: auth.token ? { Authorization: `Bearer ${auth.token}` } : {},
    })
    // Actualiza en caliente sin depender del fetch
    tenantStore.data = { ...(tenantStore.data || {}), logo_url: url.trim() }
    await tenantStore.fetchTienda()
  } catch (error) {
    console.error('No pudimos actualizar el logo', error)
  }
}

onMounted(async () => {
  auth.restoreFromCookies()
  if (auth.token && !auth.user) {
    await auth.fetchProfile()
  }
  applyThemeForSlug()
  cart.loadFromStorage()
  cart.setContext(slug.value)
  await ensureStoreData()
  await loadNotifications()
})

onBeforeUnmount(() => {
  theme.resetToBase()
})

watch(
  () => route.params.slug,
  async () => {
    cart.setContext(slug.value)
    await ensureStoreData()
    applyThemeForSlug()
    await loadNotifications()
  }
)

const handleLogout = () => {
  showMobileNav.value = false
  auth.logout()
}

watch(
  () => route.fullPath,
  () => {
    showMobileNav.value = false
    showNotifications.value = false
  }
)
</script>
