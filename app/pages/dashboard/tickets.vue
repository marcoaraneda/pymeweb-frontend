<template>
  <div class="min-h-screen bg-slate-950 text-white">
    <div class="mx-auto max-w-6xl px-6 py-10 space-y-8">
      <header class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p class="text-xs uppercase tracking-[0.2em] text-white/60">Soporte</p>
          <h1 class="text-3xl font-extrabold">Tickets</h1>
          <p class="text-white/70">Revisa y da seguimiento a tickets abiertos por las tiendas.</p>
        </div>
        <NuxtLink to="/dashboard" class="rounded-xl px-4 py-2 text-sm font-semibold text-white shadow" :style="{ backgroundColor: theme.accent }">Regresar</NuxtLink>
      </header>

      <section class="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
        <div class="flex flex-wrap items-center gap-3">
          <label class="text-sm text-white/70">Estado</label>
          <select v-model="status" class="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white/90">
            <option value="">Todos</option>
            <option value="open">Abierto</option>
            <option value="in_progress">En progreso</option>
            <option value="resolved">Resuelto</option>
            <option value="closed">Cerrado</option>
          </select>
          <label class="text-sm text-white/70">Tienda</label>
          <select v-model="storeSlug" class="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white/90">
            <option value="">Todas</option>
            <option v-for="s in storesMine" :key="s.slug" :value="s.slug">{{ s.name }}</option>
          </select>
          <span class="ml-auto text-xs text-white/60">{{ tickets.length }} resultados</span>
        </div>

        <div v-if="loading" class="mt-4 text-white/70">Cargando...</div>
        <div v-else-if="!tickets.length" class="mt-4 rounded-2xl border border-dashed border-white/15 bg-white/5 p-4 text-white/70">No hay tickets para mostrar.</div>
        <div v-else class="mt-4 divide-y divide-white/10">
          <article v-for="t in paginatedTickets" :key="t.id" class="py-3 flex items-start justify-between gap-3">
            <div class="space-y-1">
              <p class="text-sm font-semibold text-white">{{ t.title }}</p>
              <p class="text-xs text-white/60">{{ t.store_slug || 'Sin tienda' }} • {{ formatStatus(t.status) }} • Prioridad {{ t.priority }}</p>
              <p class="text-sm text-white/80">{{ t.description }}</p>
            </div>
            <span :class="['rounded-full px-3 py-1 text-[11px] font-semibold', badgeClass(t.status)]">{{ formatStatus(t.status) }}</span>
          </article>
        </div>

        <div v-if="tickets.length > perPage" class="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-xs text-white/70">
          <button
            class="rounded-lg border border-white/20 px-3 py-1.5 font-semibold hover:bg-white/10 disabled:opacity-40"
            :disabled="page === 1"
            @click="page -= 1"
          >
            Anterior
          </button>
          <p>Mostrando {{ pageStart }}-{{ pageEnd }} de {{ tickets.length }}</p>
          <button
            class="rounded-lg border border-white/20 px-3 py-1.5 font-semibold hover:bg-white/10 disabled:opacity-40"
            :disabled="page === totalPages"
            @click="page += 1"
          >
            Siguiente
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { navigateTo, useRuntimeConfig } from 'nuxt/app'
import { useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useThemeStore } from '~/stores/theme'

const auth = useAuthStore()
const theme = useThemeStore()
const config = useRuntimeConfig()
const route = useRoute()

const tickets = ref<any[]>([])
const loading = ref(true)
const status = ref('')
const storeSlug = ref('')
const storesMine = ref<{ name: string; slug: string }[]>([])
const page = ref(1)
const perPage = 10

const formatStatus = (value: string) => {
  const map: Record<string, string> = {
    open: 'Abierto',
    in_progress: 'En progreso',
    resolved: 'Resuelto',
    closed: 'Cerrado',
  }
  return map[value] || value
}

const badgeClass = (value: string) => {
  const map: Record<string, string> = {
    open: 'bg-amber-500/20 text-amber-100',
    in_progress: 'bg-sky-500/20 text-sky-100',
    resolved: 'bg-emerald-500/20 text-emerald-100',
    closed: 'bg-slate-500/20 text-slate-100',
  }
  return map[value] || 'bg-white/10 text-white'
}

const totalPages = computed(() => Math.max(1, Math.ceil(tickets.value.length / perPage)))
const paginatedTickets = computed(() => {
  const start = (page.value - 1) * perPage
  return tickets.value.slice(start, start + perPage)
})
const pageStart = computed(() => (tickets.value.length ? (page.value - 1) * perPage + 1 : 0))
const pageEnd = computed(() => Math.min(page.value * perPage, tickets.value.length))

const loadTickets = async () => {
  if (!auth.token) return
  loading.value = true
  try {
    const params: Record<string, string> = {}
    if (status.value) params.status = status.value
    if (storeSlug.value) params.store = storeSlug.value
    tickets.value = await $fetch(`${config.public.apiBase}/support/tickets/`, {
      headers: { Authorization: `Bearer ${auth.token}` },
      params,
    })
  } catch (error) {
    console.warn('No se pudieron cargar tickets', error)
    tickets.value = []
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (!auth.isAuthenticated) {
    await navigateTo('/login')
    return
  }
  const routeStatus = String(route.query.status || '').trim()
  const routeStore = String(route.query.store || '').trim()
  if (routeStatus) status.value = routeStatus
  if (routeStore) storeSlug.value = routeStore
  storesMine.value = await auth.fetchMyStores()
  await loadTickets()
})

watch([status, storeSlug], () => loadTickets())

watch([status, storeSlug], () => {
  page.value = 1
})

watch(tickets, () => {
  if (page.value > totalPages.value) page.value = totalPages.value
})
</script>
