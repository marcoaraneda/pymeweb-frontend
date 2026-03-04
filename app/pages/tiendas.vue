<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <section class="relative overflow-hidden bg-gradient-to-br from-[var(--gradient-from,#111827)] to-[var(--gradient-to,#0b2358)] text-white">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_45%)]" aria-hidden="true" />
      <div class="absolute -left-10 top-10 h-32 w-32 rounded-full bg-white/5 blur-2xl" aria-hidden="true" />
      <div class="absolute -right-16 bottom-0 h-40 w-40 rounded-full bg-amber-400/10 blur-3xl" aria-hidden="true" />
      <div class="relative mx-auto max-w-6xl px-6 py-14 space-y-6">
        <p class="text-xs uppercase tracking-[0.25em] text-white/70">Explora</p>
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div class="space-y-2">
            <h1 class="text-3xl font-bold leading-tight">Todas las tiendas</h1>
            <p class="text-white/80">Encuentra tu próxima tienda favorita. Filtra, navega y entra directo.</p>
            <div class="flex flex-wrap gap-2 text-xs text-white/70">
              <span class="rounded-full border border-white/15 px-3 py-1">Actualizado al momento</span>
              <span class="rounded-full border border-white/15 px-3 py-1">Ordena por nombre o busca</span>
            </div>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <input
              v-model="filterQuery"
              type="text"
              placeholder="Buscar tienda..."
              class="w-60 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm text-white placeholder-white/60 shadow-inner focus:border-white/40 focus:outline-none"
            />
            <NuxtLink
              to="/"
              class="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:border-white/40 hover:bg-white/10 transition"
            >
              Volver al inicio
            </NuxtLink>
          </div>
        </div>

        <div class="grid gap-3 sm:grid-cols-3">
          <div class="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <p class="text-xs uppercase tracking-[0.2em] text-white/60">Tiendas totales</p>
            <p class="text-2xl font-semibold">{{ stores.length }}</p>
            <p class="text-sm text-white/70">Cargadas desde el marketplace</p>
          </div>
          <div class="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <p class="text-xs uppercase tracking-[0.2em] text-white/60">Coincidencias</p>
            <p class="text-2xl font-semibold">{{ filteredStores.length }}</p>
            <p class="text-sm text-white/70">Según tu búsqueda actual</p>
          </div>
          <div class="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <p class="text-xs uppercase tracking-[0.2em] text-white/60">Orden</p>
            <div class="mt-1 flex items-center gap-2">
              <button
                class="rounded-lg px-3 py-1 text-sm font-semibold transition"
                :class="sortMode === 'recent' ? 'bg-white/20 text-white' : 'bg-white/10 text-white/80 hover:bg-white/15'"
                @click="sortMode = 'recent'"
              >
                Original
              </button>
              <button
                class="rounded-lg px-3 py-1 text-sm font-semibold transition"
                :class="sortMode === 'az' ? 'bg-white/20 text-white' : 'bg-white/10 text-white/80 hover:bg-white/15'"
                @click="sortMode = 'az'"
              >
                A → Z
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-6xl px-6 py-12 space-y-5">
      <div class="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
        <span v-if="filterQuery">Mostrando resultados para "{{ filterQuery }}"</span>
        <button v-if="filterQuery" class="rounded-full border border-slate-200 px-3 py-1 hover:bg-slate-100" @click="filterQuery = ''">Limpiar búsqueda</button>
      </div>

      <div v-if="loading" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="i in 6" :key="i" class="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div class="mb-4 flex items-center gap-3">
            <div class="h-12 w-12 rounded-xl bg-slate-200" />
            <div class="flex-1 space-y-2">
              <div class="h-3 w-24 rounded bg-slate-200" />
              <div class="h-4 w-32 rounded bg-slate-200" />
            </div>
          </div>
          <div class="h-9 w-32 rounded-lg bg-slate-200" />
        </div>
      </div>
      <div v-else-if="error" class="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-red-700 flex items-center justify-between gap-3">
        <span>{{ error }}</span>
        <button
          class="rounded-lg border border-red-200 px-3 py-1 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
          :disabled="loading"
          @click="fetchStores"
        >
          Reintentar
        </button>
      </div>
      <div
        v-else-if="filteredStores.length === 0"
        class="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-slate-600 shadow-sm"
      >
        No hay tiendas que coincidan con tu búsqueda.
      </div>
      <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StoreCard v-for="store in paginated" :key="store.slug" :store="store" :accent="theme.accent" />
      </div>

      <div v-if="totalPages > 1" class="flex items-center justify-between pt-4 text-sm text-slate-600">
        <button
          class="rounded-lg border border-slate-200 px-3 py-1 hover:border-slate-300 disabled:opacity-40"
          :disabled="page === 1"
          @click="page--"
        >
          Anterior
        </button>
        <span>Página {{ page }} / {{ totalPages }}</span>
        <button
          class="rounded-lg border border-slate-200 px-3 py-1 hover:border-slate-300 disabled:opacity-40"
          :disabled="page === totalPages"
          @click="page++"
        >
          Siguiente
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRuntimeConfig } from 'nuxt/app'
import StoreCard from '~/components/StoreCard.vue'
import { useThemeStore } from '~/stores/theme'

// Listado de tiendas debe ser público
definePageMeta({})

const config = useRuntimeConfig()
const theme = useThemeStore()

const stores = ref<any[]>([])
const loading = ref(true)
const error = ref('')
const filterQuery = ref('')
const page = ref(1)
const perPage = 12
const sortMode = ref<'recent' | 'az'>('recent')

const filteredStores = computed(() => {
  const term = filterQuery.value.trim().toLowerCase()
  if (!term) return stores.value
  return stores.value.filter((s) => s.name?.toLowerCase().includes(term) || s.slug?.toLowerCase().includes(term))
})

const sortedStores = computed(() => {
  if (sortMode.value === 'az') {
    return [...filteredStores.value].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  }
  return filteredStores.value
})

const totalPages = computed(() => Math.max(1, Math.ceil(sortedStores.value.length / perPage)))
const paginated = computed(() => {
  const start = (page.value - 1) * perPage
  return sortedStores.value.slice(start, start + perPage)
})

const fetchStores = async () => {
  loading.value = true
  error.value = ''
  try {
    stores.value = await $fetch(`${config.public.apiBase}/stores/`)
    page.value = 1
  } catch (err) {
    console.error(err)
    error.value = 'No pudimos cargar las tiendas'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  theme.loadFromStorage()
  await fetchStores()
})

watch(filterQuery, () => {
  page.value = 1
})

watch(sortMode, () => {
  page.value = 1
})

watch(sortedStores, () => {
  if (page.value > totalPages.value) page.value = totalPages.value
})
</script>
