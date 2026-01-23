<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <section class="relative overflow-hidden bg-gradient-to-br from-[var(--gradient-from,#111827)] to-[var(--gradient-to,#0b2358)] text-white">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_45%)]" aria-hidden="true" />
      <div class="relative mx-auto max-w-6xl px-6 py-14 space-y-6">
        <p class="text-xs uppercase tracking-[0.25em] text-white/70">Explora</p>
        <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 class="text-3xl font-bold leading-tight">Todas las tiendas</h1>
            <p class="text-white/80">Encuentra tu próxima tienda favorita. Filtra, navega y entra directo.</p>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <input
              v-model="filterQuery"
              type="text"
              placeholder="Buscar tienda..."
              class="w-56 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm text-white placeholder-white/60 shadow-inner focus:border-white/40 focus:outline-none"
            />
            <NuxtLink
              to="/"
              class="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:border-white/40 hover:bg-white/10 transition"
            >
              Volver al inicio
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-6xl px-6 py-12 space-y-4">
      <div v-if="loading" class="text-slate-500">Cargando tiendas...</div>
      <div v-else-if="error" class="text-red-600">{{ error }}</div>
      <div v-else-if="filteredStores.length === 0" class="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-slate-600">
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

const config = useRuntimeConfig()
const theme = useThemeStore()

const stores = ref<any[]>([])
const loading = ref(true)
const error = ref('')
const filterQuery = ref('')
const page = ref(1)
const perPage = 12

const filteredStores = computed(() => {
  const term = filterQuery.value.trim().toLowerCase()
  if (!term) return stores.value
  return stores.value.filter((s) => s.name?.toLowerCase().includes(term) || s.slug?.toLowerCase().includes(term))
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredStores.value.length / perPage)))
const paginated = computed(() => {
  const start = (page.value - 1) * perPage
  return filteredStores.value.slice(start, start + perPage)
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
</script>
