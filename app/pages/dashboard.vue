<template>
  <div class="relative min-h-screen bg-slate-950 text-white">
    <div class="pointer-events-none absolute inset-0" aria-hidden="true">
      <div class="absolute -left-10 top-10 h-60 w-60 rounded-full bg-gradient-to-r from-[var(--gradient-from,#111827)] to-[var(--gradient-to,#0b2358)] blur-3xl opacity-70" />
      <div class="absolute -right-10 bottom-10 h-72 w-72 rounded-full bg-gradient-to-r from-[var(--gradient-from,#111827)] to-[var(--gradient-to,#0b2358)] blur-3xl opacity-60" />
    </div>

    <div class="relative z-10 mx-auto max-w-6xl px-6 py-10 space-y-10">
      <header class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p class="text-xs uppercase tracking-[0.2em] text-white/60">Panel</p>
          <h1 class="text-3xl font-extrabold">Dashboard de tiendas</h1>
          <p class="text-white/70">Resumen rápido de tus tiendas, actividad y accesos.</p>
        </div>
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:border-white/30"
        >
          Ir al marketplace
        </NuxtLink>
      </header>

      <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Tiendas activas" :value="storesMine.length" icon="🏪" :accent="theme.accent" />
        <StatCard title="Visitantes (7d)" :value="analytics.visits" icon="👀" :accent="theme.accent" />
        <StatCard title="Conversiones" :value="analytics.conversions" icon="🛒" :accent="theme.accent" />
        <StatCard title="Tickets abiertos" :value="analytics.support" icon="🎧" :accent="theme.accent" />
      </section>

      <section class="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div class="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs uppercase tracking-[0.2em] text-white/60">Mis tiendas</p>
              <h2 class="text-xl font-semibold">Accesos directos</h2>
            </div>
            <button
              class="rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-black/25 transition hover:-translate-y-0.5"
              :style="{ backgroundColor: theme.accent }"
              @click="refresh"
            >
              Actualizar
            </button>
          </div>

          <div v-if="loading" class="mt-4 text-white/70">Cargando...</div>
          <div v-else-if="storesMine.length === 0" class="mt-4 rounded-2xl border border-dashed border-white/15 bg-white/5 p-5 text-white/70">
            Aún no tienes tiendas asignadas. Pide acceso o crea una nueva desde administración.
          </div>
          <div v-else class="mt-4 grid gap-4 sm:grid-cols-2">
            <StoreCard v-for="store in storesMine" :key="store.slug" :store="store" :accent="theme.accent" />
          </div>
        </div>

        <div class="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
          <p class="text-xs uppercase tracking-[0.2em] text-white/60">Actividad</p>
          <h2 class="text-xl font-semibold">Visitantes recientes</h2>
          <p class="text-white/70">Curva suave para los últimos 7 días</p>

          <div class="mt-6 flex items-end gap-2">
            <div
              v-for="(day, idx) in sparkline"
              :key="idx"
              class="flex-1 rounded-t-xl bg-white/20"
              :style="{ height: `${day}px`, backgroundColor: barColor(idx) }"
            />
          </div>

          <div class="mt-6 flex items-center gap-3 rounded-2xl bg-white/5 p-4 text-white/80">
            <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-lg">💡</span>
            <div>
              <p class="text-sm font-semibold">Tip</p>
              <p class="text-xs text-white/60">Personaliza el color en la home para reflejar tu marca en todos los CTA.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { navigateTo } from 'nuxt/app'
import StoreCard from '~/components/StoreCard.vue'
import StatCard from '~/components/StatCard.vue'
import { useAuthStore } from '~/stores/auth'
import { useThemeStore } from '~/stores/theme'

const auth = useAuthStore()
const theme = useThemeStore()
const storesMine = ref<{ id: number; name: string; slug: string }[]>([])
const loading = ref(true)

const analytics = ref({ visits: 1280, conversions: 74, support: 3 })
const sparkline = computed(() => [60, 90, 80, 120, 140, 110, 170])

const barColor = (idx: number) => (idx === sparkline.value.length - 1 ? theme.accent : 'rgba(255,255,255,0.25)')

const loadData = async () => {
  loading.value = true
  storesMine.value = await auth.fetchMyStores()
  loading.value = false
}

const refresh = async () => {
  await loadData()
}

onMounted(async () => {
  if (!auth.isAuthenticated) {
    await navigateTo('/login')
    return
  }
  await loadData()
  theme.applyTheme()
})
</script>
