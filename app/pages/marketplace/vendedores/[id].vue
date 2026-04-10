<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 px-4 py-10">
    <div class="mx-auto max-w-6xl space-y-6">
      <NuxtLink to="/marketplace" class="text-sm font-semibold text-slate-700 hover:text-slate-900">← Volver al marketplace</NuxtLink>

      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div v-if="loading" class="text-slate-500">Cargando vendedor...</div>
        <div v-else-if="error" class="text-red-600">{{ error }}</div>
        <div v-else-if="!seller" class="text-slate-600">Vendedor no encontrado.</div>
        <div v-else class="space-y-4">
          <div class="flex flex-wrap items-center gap-3">
            <div class="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-amber-100 text-lg font-semibold text-amber-900">
              <img v-if="seller.avatar_url" :src="seller.avatar_url" :alt="seller.username" class="h-full w-full object-cover" />
              <span v-else>{{ seller.username?.slice(0, 2)?.toUpperCase?.() }}</span>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.2em] text-slate-500">Vendedor</p>
              <h1 class="text-2xl font-bold text-slate-900">{{ seller.username }}</h1>
              <p class="text-sm text-slate-600">{{ fullName }}</p>
            </div>
          </div>

          <div class="flex flex-wrap gap-3">
            <select v-model="categoryFilter" class="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-inner">
              <option value="">Todas las categorías</option>
              <option v-for="cat in categories" :key="cat.slug || cat.id" :value="cat.slug || cat.id">{{ cat.name }}</option>
            </select>
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Buscar producto por nombre"
              class="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-inner focus:border-slate-400 focus:outline-none md:w-64"
            />
          </div>

          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-slate-900">Productos activos</h2>
              <span class="text-sm text-slate-500">{{ filteredActive.length }} productos</span>
            </div>
            <div v-if="!filteredActive.length" class="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-slate-600">
              No hay productos activos.
            </div>
            <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <ProductCard
                v-for="product in pagedActive"
                :key="product.id"
                :product="product"
                :accent="marketplaceAccent"
                :isMarketplace="true"
                :isMine="isMine(product)"
              />
            </div>
            <div v-if="activeTotalPages > 1" class="flex items-center justify-between text-xs text-slate-600">
              <button class="rounded-lg border border-slate-200 px-3 py-1 hover:bg-slate-50 disabled:opacity-40" :disabled="activePage === 1" @click="activePage -= 1">Anterior</button>
              <span>Página {{ activePage }} / {{ activeTotalPages }}</span>
              <button class="rounded-lg border border-slate-200 px-3 py-1 hover:bg-slate-50 disabled:opacity-40" :disabled="activePage === activeTotalPages" @click="activePage += 1">Siguiente</button>
            </div>
          </div>

          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-slate-900">Productos vendidos / inactivos</h2>
              <span class="text-sm text-slate-500">{{ filteredSold.length }} productos</span>
            </div>
            <div v-if="!filteredSold.length" class="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-slate-600">
              No hay productos marcados como vendidos.
            </div>
            <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <ProductCard
                v-for="product in pagedSold"
                :key="`sold-${product.id}`"
                :product="product"
                :accent="marketplaceAccent"
                :isMarketplace="true"
                :isMine="isMine(product)"
              />
            </div>
            <div v-if="soldTotalPages > 1" class="flex items-center justify-between text-xs text-slate-600">
              <button class="rounded-lg border border-slate-200 px-3 py-1 hover:bg-slate-50 disabled:opacity-40" :disabled="soldPage === 1" @click="soldPage -= 1">Anterior</button>
              <span>Página {{ soldPage }} / {{ soldTotalPages }}</span>
              <button class="rounded-lg border border-slate-200 px-3 py-1 hover:bg-slate-50 disabled:opacity-40" :disabled="soldPage === soldTotalPages" @click="soldPage += 1">Siguiente</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useRuntimeConfig } from 'nuxt/app'
import ProductCard from '~/components/ProductCard.vue'
import { useThemeStore } from '~/stores/theme'
import { useAuthStore } from '~/stores/auth'

const route = useRoute()
const config = useRuntimeConfig()
const theme = useThemeStore()
const auth = useAuthStore()

const sellerId = route.params.id
const seller = ref<any | null>(null)
const loading = ref(true)
const error = ref('')
const searchTerm = ref('')
const categoryFilter = ref('')
const categories = ref<any[]>([])
const marketplaceAccent = '#f59e0b'
const activePage = ref(1)
const soldPage = ref(1)
const perPage = 12

const fullName = computed(() => {
  if (!seller.value) return ''
  const parts = [seller.value.first_name, seller.value.last_name].filter(Boolean)
  return parts.join(' ')
})

const allProducts = computed(() => {
  if (!seller.value) return { active: [], sold: [] }
  return {
    active: seller.value.active_products || [],
    sold: seller.value.sold_products || [],
  }
})

const categoriesFromProducts = computed(() => {
  const map = new Map<string, { id: any; slug: any; name: string }>()
  allProducts.value.active.concat(allProducts.value.sold).forEach((p: any) => {
    if (p.category?.slug || p.category?.id) {
      const key = p.category.slug || p.category.id
      map.set(String(key), { id: p.category.id, slug: p.category.slug, name: p.category.name })
    }
  })
  return Array.from(map.values())
})

const filteredActive = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  const cat = categoryFilter.value
  return allProducts.value.active.filter((p: any) => {
    const matchesTerm = !term || p.name?.toLowerCase().includes(term)
    const matchesCat = !cat || p.category?.slug === cat || String(p.category?.id) === String(cat)
    return matchesTerm && matchesCat
  })
})

const filteredSold = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  const cat = categoryFilter.value
  return allProducts.value.sold.filter((p: any) => {
    const matchesTerm = !term || p.name?.toLowerCase().includes(term)
    const matchesCat = !cat || p.category?.slug === cat || String(p.category?.id) === String(cat)
    return matchesTerm && matchesCat
  })
})

const activeTotalPages = computed(() => Math.max(1, Math.ceil(filteredActive.value.length / perPage)))
const soldTotalPages = computed(() => Math.max(1, Math.ceil(filteredSold.value.length / perPage)))

const pagedActive = computed(() => {
  const start = (activePage.value - 1) * perPage
  return filteredActive.value.slice(start, start + perPage)
})

const pagedSold = computed(() => {
  const start = (soldPage.value - 1) * perPage
  return filteredSold.value.slice(start, start + perPage)
})

const isMine = (product: any) => {
  const userId = (auth.user as any)?.id
  return Boolean(userId && product?.submitted_by === userId)
}

const fetchSeller = async () => {
  loading.value = true
  error.value = ''
  try {
    seller.value = await $fetch(`${config.public.apiBase}/marketplace/sellers/${sellerId}/`)
    categories.value = categoriesFromProducts.value
  } catch (err: any) {
    const detail = err?.response?._data?.detail || err?.response?._data
    error.value = typeof detail === 'string' ? detail : 'No pudimos cargar el vendedor'
    seller.value = null
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  theme.loadFromStorage()
  theme.applyTheme()
  auth.restoreFromCookies()
  await fetchSeller()
})

watch([searchTerm, categoryFilter], () => {
  activePage.value = 1
  soldPage.value = 1
})

watch(filteredActive, () => {
  if (activePage.value > activeTotalPages.value) activePage.value = activeTotalPages.value
})

watch(filteredSold, () => {
  if (soldPage.value > soldTotalPages.value) soldPage.value = soldTotalPages.value
})
</script>
