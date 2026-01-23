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

        <nav class="hidden items-center gap-6 text-sm font-semibold text-slate-600 md:flex">
          <NuxtLink to="/" class="hover:text-slate-900">Inicio</NuxtLink>
          <NuxtLink to="/dashboard" v-if="auth.isAuthenticated" class="hover:text-slate-900">Dashboard</NuxtLink>
          <NuxtLink to="/store/demo" class="hover:text-slate-900">Demo tienda</NuxtLink>
        </nav>

        <div class="flex items-center gap-3">
          <NuxtLink
            v-if="!auth.isAuthenticated"
            to="/login"
            class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 hover:border-slate-300"
          >
            Iniciar sesión
          </NuxtLink>
          <NuxtLink
            v-else
            to="/dashboard"
            class="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm"
            :style="{ backgroundColor: theme.accent }"
          >
            <span class="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-xs uppercase">
              {{ (auth.user?.username || 'U').slice(0, 2) }}
            </span>
            <span>{{ auth.user?.username || 'Perfil' }}</span>
          </NuxtLink>
        </div>
      </div>
    </header>

    <main>
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useThemeStore } from '~/stores/theme'

const auth = useAuthStore()
const theme = useThemeStore()

onMounted(() => {
  theme.loadFromStorage()
  theme.applyTheme()
})
</script>
