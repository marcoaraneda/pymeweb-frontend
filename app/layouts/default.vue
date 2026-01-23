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
            class="md:hidden rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800"
            @click.stop="showMenuMobile = !showMenuMobile"
          >
            Menú
          </button>
          <NuxtLink
            v-if="auth.isAuthenticated && hasStores"
            to="/dashboard"
            class="hidden h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg md:inline-flex"
            :style="{ backgroundColor: accentColor }"
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

          <div v-else class="relative" ref="menuRef">
            <button
              class="flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              :style="{ backgroundColor: accentColor }"
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
              class="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white py-2 text-sm shadow-lg"
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

    <main>
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useThemeStore } from '~/stores/theme'

const auth = useAuthStore()
const theme = useThemeStore()
const showMenu = ref(false)
const showMenuMobile = ref(false)
const route = useRoute()
const menuRef = ref<HTMLElement | null>(null)
const avatarUrl = computed(() => auth.user?.avatar_url || null)
const initials = computed(() => (auth.user?.username || 'U').slice(0, 2).toUpperCase())
const accentColor = computed(() => theme.accent || '#2563eb')
const hasStores = computed(() => ((auth.user as any)?.memberships || []).length > 0)

const handleOutside = (event: MouseEvent) => {
  if (!menuRef.value) return
  if (!menuRef.value.contains(event.target as Node)) {
    showMenu.value = false
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
  }
)
</script>
