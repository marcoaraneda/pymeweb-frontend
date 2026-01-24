<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <header class="sticky top-0 z-20 border-b border-slate-200 bg-white/85 backdrop-blur">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <NuxtLink to="/" class="flex items-center gap-2 font-semibold text-slate-900">
          <span class="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">PW</span>
          <div>
            <p class="leading-none">Pymeweb</p>
            <p class="text-xs text-slate-500">Marketplace multi-tienda</p>
          </div>
        </NuxtLink>

        <nav class="hidden items-center gap-4 text-sm font-semibold text-slate-700 md:flex">
          <NuxtLink to="/marketplace" class="hover:text-slate-900">Marketplace</NuxtLink>
          <NuxtLink to="/#tiendas" class="hover:text-slate-900">Ver tiendas</NuxtLink>
        </nav>

        <div class="flex items-center gap-3">
          <button
            class="md:hidden rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 glass-btn"
            @click.stop="showMenuMobile = !showMenuMobile"
          >
            Menú
          </button>
          <NuxtLink
            v-if="auth.isAuthenticated && hasStores"
            to="/dashboard"
            class="hidden h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-slate-800 glass-btn md:inline-flex"
          >
            Dashboard
          </NuxtLink>

          <NuxtLink
            v-if="!auth.isAuthenticated"
            to="/login"
            class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 hover:border-slate-300"
          >
            Iniciar sesión
          </NuxtLink>

          <div v-else class="relative flex items-center gap-3" ref="menuRef">
            <div class="relative inline-flex items-center">
              <button
                class="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800 shadow-sm glass-btn"
                aria-label="Notificaciones"
                @click.stop="showNotifications = !showNotifications"
              >
                🔔
                <span
                  v-if="notificationsCount > 0"
                  class="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white"
                >
                  {{ notificationsCount }}
                </span>
              </button>
              <div
                v-if="showNotifications"
                class="absolute right-0 top-12 w-64 rounded-2xl border border-slate-200 bg-white p-3 text-sm shadow-lg"
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
                <button
                  type="button"
                  class="mt-3 block text-xs font-semibold text-blue-600 hover:underline"
                  @click="goTickets"
                >
                  Ver tickets
                </button>
              </div>
            </div>
            <button
              class="flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-slate-800 glass-btn"
              @click.stop="showMenu = !showMenu"
            >
              <span
                v-if="avatarUrl"
                class="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white/15"
              >
                <img :src="avatarUrl" alt="Avatar" class="h-full w-full object-cover" />
              </span>
              <span
                v-else
                class="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-xs uppercase"
              >
                {{ initials }}
              </span>
              <span>{{ auth.user?.username || 'Perfil' }}</span>
            </button>
            <div
              v-if="showMenu"
              class="absolute right-0 top-full mt-2 w-48 rounded-xl border border-slate-200 bg-white py-2 text-sm shadow-lg"
            >
              <NuxtLink v-if="hasStores" to="/dashboard" class="block px-3 py-2 text-slate-700 hover:bg-slate-50">Dashboard</NuxtLink>
              <NuxtLink to="/profile" class="block px-3 py-2 text-slate-700 hover:bg-slate-50">Editar perfil</NuxtLink>
              <button class="block w-full px-3 py-2 text-left text-red-600 hover:bg-slate-50" @click="auth.logout()">Cerrar sesión</button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="showMenuMobile" class="border-t border-slate-200 bg-white/95 px-6 py-3 text-sm md:hidden">
        <div class="flex flex-col gap-2">
          <NuxtLink to="/marketplace" class="rounded-lg px-3 py-2 hover:bg-slate-100">Marketplace</NuxtLink>
          <NuxtLink to="/#tiendas" class="rounded-lg px-3 py-2 hover:bg-slate-100">Ver tiendas</NuxtLink>
          <NuxtLink v-if="auth.isAuthenticated && hasStores" to="/dashboard" class="rounded-lg px-3 py-2 hover:bg-slate-100">Dashboard</NuxtLink>
          <NuxtLink v-if="!auth.isAuthenticated" to="/login" class="rounded-lg px-3 py-2 hover:bg-slate-100">Iniciar sesión</NuxtLink>
          <template v-else>
            <NuxtLink to="/profile" class="rounded-lg px-3 py-2 hover:bg-slate-100">Editar perfil</NuxtLink>
            <button class="rounded-lg px-3 py-2 text-left text-red-600 hover:bg-slate-100" @click="handleLogout">Cerrar sesión</button>
          </template>
        </div>
      </div>
    </header>

    <main class="reveal" style="animation-delay: 0.04s;">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useThemeStore } from '~/stores/theme'
import { useRuntimeConfig, navigateTo } from 'nuxt/app'

const auth = useAuthStore()
const theme = useThemeStore()
const config = useRuntimeConfig()
const route = useRoute()
const showMenu = ref(false)
const showMenuMobile = ref(false)
const menuRef = ref<HTMLElement | null>(null)
const avatarUrl = computed(() => auth.user?.avatar_url || null)
const initials = computed(() => (auth.user?.username || 'U').slice(0, 2).toUpperCase())
const accentColor = computed(() => theme.accent || '#2563eb')
const hasStores = computed(() => ((auth.user as any)?.memberships || []).length > 0)
type NotificationItem = { type: string; message: string; count: number }
type DashboardSummary = { notifications?: NotificationItem[] }
const notifications = ref<NotificationItem[]>([])
const notificationsCount = computed(() => notifications.value.reduce((acc, n) => acc + (Number(n.count) || 0), 0))
const showNotifications = ref(false)

const handleOutside = (event: MouseEvent) => {
  if (!menuRef.value) return
  if (!menuRef.value.contains(event.target as Node)) {
    showMenu.value = false
    showNotifications.value = false
  }
}

const loadNotifications = async () => {
  if (!auth.token) {
    notifications.value = []
    return
  }
  try {
    const data = await $fetch<DashboardSummary>(`${config.public.apiBase}/support/dashboard/summary/`, {
      headers: { Authorization: `Bearer ${auth.token}` },
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
  if (n?.type === 'ticket_detail' && n?.store) {
    await navigateTo(`/store/${n.store}/soporte`)
    return
  }
  if (n?.type?.startsWith('ticket')) {
    await navigateTo('/dashboard/tickets')
    return
  }
  if (n?.type?.startsWith('order')) {
    await navigateTo('/dashboard')
    return
  }
}

const handleLogout = () => {
  showMenu.value = false
  showMenuMobile.value = false
  auth.logout()
}

onMounted(async () => {
  auth.restoreFromCookies()
  if (auth.token && !auth.user) {
    await auth.fetchProfile()
  }
  theme.loadFromStorage()
  theme.resetToBase()
  await loadNotifications()
  document.addEventListener('click', handleOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutside)
})

watch(
  () => route.fullPath,
  () => {
    showMenu.value = false
    showMenuMobile.value = false
    showNotifications.value = false
  }
)
</script>
