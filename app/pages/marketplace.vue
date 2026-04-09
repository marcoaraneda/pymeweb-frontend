<template>
  <NuxtPage v-if="!isMarketplaceRoot" />
  <div v-else class="min-h-screen bg-slate-50">
    <section class="relative overflow-hidden bg-slate-900 text-white" :style="heroStyle">
      <div
        class="absolute inset-0 opacity-80"
        style="background: radial-gradient(circle at 10% 20%, var(--gradient-from), transparent 35%), radial-gradient(circle at 80% 0%, var(--gradient-to), transparent 40%);"
      ></div>
      <div class="relative mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 lg:flex-row lg:items-center lg:justify-between">
        <div class="space-y-4">
          <p class="text-xs uppercase tracking-[0.25em] text-amber-200/90">Marketplace</p>
          <h1 class="text-3xl font-semibold leading-tight lg:text-4xl">Publica tus productos y véndelos en nuestro marketplace</h1>
          <p class="max-w-2xl text-slate-100/80">Sube productos sin tener una tienda propia y controla qué está activo o vendido.</p>
          <div class="flex flex-wrap items-center gap-3">
            <NuxtLink
              :to="auth.isAuthenticated ? '/marketplace/mis-productos' : '/login'"
              class="inline-flex items-center gap-2 rounded-xl border border-white/30 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
            >
              {{ auth.isAuthenticated ? 'Publicar producto' : 'Iniciar sesión para publicar' }}
            </NuxtLink>
            <NuxtLink
              to="/marketplace/mis-productos"
              class="inline-flex items-center gap-2 rounded-xl border border-white/30 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
            >
              Gestionar mis productos
            </NuxtLink>
            <a
              href="#productos"
              class="inline-flex items-center gap-2 rounded-xl border border-white/30 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
            >
              Ver productos publicados
            </a>
          </div>
        </div>

        <div class="grid w-full max-w-xl grid-cols-2 gap-3 rounded-2xl bg-white/5 p-4 backdrop-blur">
          <article v-for="product in filteredProducts.slice(0, 4)" :key="product.id" class="rounded-xl border border-white/10 bg-white/5 p-3">
            <p class="text-xs uppercase text-amber-200/80">{{ product.category?.name || 'General' }}</p>
            <p class="text-sm font-semibold text-white line-clamp-1">{{ product.name }}</p>
            <p class="text-sm text-amber-100 line-clamp-2">{{ product.description }}</p>
            <p class="text-base font-bold text-red-200">
              <span v-if="product.offer_price" class="mr-1 text-slate-300 line-through">{{ formatClp(product.price) }}</span>
              {{ formatClp(displayPrice(product)) }}
            </p>
            <p v-if="product.offer_price && Number(product.offer_min_qty || 1) > 1" class="text-[11px] font-semibold text-rose-200">Oferta desde {{ Number(product.offer_min_qty) }} unidades</p>
          </article>
          <div v-if="!filteredProducts.length" class="col-span-2 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-amber-100">
            Sin productos cargados todavía.
          </div>
        </div>
      </div>
    </section>

    <section id="productos" class="mx-auto max-w-6xl px-6 py-10 space-y-4">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-xs uppercase tracking-[0.2em] text-slate-500">Marketplace</p>
          <h2 class="text-2xl font-semibold text-slate-900">Productos publicados</h2>
          <p class="text-slate-600">Compra directo en la tienda donde se publicó.</p>
        </div>
        <div class="flex flex-wrap gap-3">
          <select
            v-model="categoryFilter"
            class="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-inner focus:border-slate-400 focus:outline-none"
          >
            <option value="">Todas las categorías</option>
            <option v-for="cat in categories" :key="cat.slug" :value="cat.slug">{{ cat.name }}</option>
          </select>
          <select
            v-model="sortOrder"
            class="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-inner focus:border-slate-400 focus:outline-none"
          >
            <option value="">Ordenar por precio</option>
            <option value="price_asc">Menor a mayor</option>
            <option value="price_desc">Mayor a menor</option>
          </select>
          <label v-if="auth.isAuthenticated" class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-inner">
            <input v-model="mineOnly" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500" />
            Solo mis productos
          </label>
          <input
            v-model="productSearch"
            type="text"
            placeholder="Buscar producto..."
            class="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-inner focus:border-slate-400 focus:outline-none md:w-64"
          />
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2 text-sm text-slate-600">
        <span class="rounded-full border border-slate-200 bg-white px-3 py-1">{{ filteredProducts.length }} resultados</span>
        <span v-for="item in activeFilters" :key="item" class="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-800">{{ item }}</span>
        <button
          v-if="activeFilters.length"
          class="rounded-full border border-slate-200 bg-white px-3 py-1 font-semibold text-slate-700 hover:border-slate-300"
          @click="clearFilters"
        >
          Limpiar filtros
        </button>
      </div>

      <div class="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-900 flex flex-wrap items-center gap-3 shadow-sm">
        <div class="flex-1 min-w-[220px]">
          <p class="font-semibold">¿Tienes algo para publicar?</p>
          <p class="text-amber-800/80">Sube productos sin tienda o gestiona los tuyos desde aquí.</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <NuxtLink
            :to="auth.isAuthenticated ? '/marketplace/mis-productos' : '/login'"
            class="rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-amber-700"
          >
            {{ auth.isAuthenticated ? 'Publicar ahora' : 'Iniciar sesión para publicar' }}
          </NuxtLink>
          <NuxtLink
            v-if="auth.isAuthenticated"
            to="/marketplace/mis-productos"
            class="rounded-xl border border-amber-200 px-4 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100"
          >
            Gestionar mis productos
          </NuxtLink>
        </div>
      </div>

      <div v-if="loadingProducts" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="i in 6" :key="`skeleton-${i}`" class="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div class="mb-3 h-3 w-24 rounded bg-slate-200" />
          <div class="mb-2 h-4 w-32 rounded bg-slate-200" />
          <div class="mb-4 h-4 w-full rounded bg-slate-200" />
          <div class="h-8 w-28 rounded bg-slate-200" />
        </div>
      </div>
      <div v-else-if="productsError" class="rounded-2xl border border-red-100 bg-red-50 p-4 text-red-700">
        <div class="flex items-center justify-between gap-3">
          <span>{{ productsError }}</span>
          <button
            class="rounded-lg border border-red-200 px-3 py-1 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
            :disabled="loadingProducts"
            @click="fetchProducts"
          >
            Reintentar
          </button>
        </div>
      </div>
      <div v-else-if="!filteredProducts.length" class="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-slate-600">
        <p class="font-semibold text-slate-800">No hay productos publicados en marketplace.</p>
        <p class="text-sm text-slate-600">Sé el primero en publicar un producto.</p>
        <div class="mt-3 flex flex-wrap gap-2">
          <NuxtLink
            :to="auth.isAuthenticated ? '/marketplace/mis-productos' : '/login'"
            class="rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-amber-700"
          >
            {{ auth.isAuthenticated ? 'Publicar producto' : 'Iniciar sesión para publicar' }}
          </NuxtLink>
          <NuxtLink
            v-if="auth.isAuthenticated"
            to="/marketplace/mis-productos"
            class="rounded-xl border border-amber-200 px-4 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100"
          >
            Gestionar mis productos
          </NuxtLink>
        </div>
      </div>
      <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <ProductCard
          v-for="product in filteredProducts"
          :key="product.id"
          :product="product"
          :accent="marketplaceAccent"
          :isMarketplace="true"
          :isMine="isMine(product)"
        />
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
import ProductCard from '~/components/ProductCard.vue'
import { computed, onMounted, ref, watch } from 'vue'
import { useRuntimeConfig } from 'nuxt/app'
import { useRoute } from 'vue-router'
import { useThemeStore } from '~/stores/theme'
import { useAuthStore } from '~/stores/auth'
import { useCartStore } from '~/stores/cart'
import { useMarketplaceRequests } from '~/composables/useMarketplaceRequests'

const theme = useThemeStore()
const auth = useAuthStore()
const cart = useCartStore()
const config = useRuntimeConfig()
const route = useRoute()
const { controlledGet } = useMarketplaceRequests()
const isMarketplaceRoot = computed(() => route.path === '/marketplace')

const marketplaceAccent = '#f59e0b'
const heroStyle = computed(() => ({ '--gradient-from': '#92400e', '--gradient-to': marketplaceAccent }))

const products = ref<any[]>([])
const loadingProducts = ref(true)
const productsError = ref('')
const productSearch = ref('')
const categoryFilter = ref('')
const sortOrder = ref('')
const mineOnly = ref(false)
const categories = ref<{ slug: string; name: string }[]>([])

const activeFilters = computed(() => {
  const items: string[] = []
  if (productSearch.value.trim()) items.push(`Búsqueda: ${productSearch.value.trim()}`)
  if (categoryFilter.value) {
    const category = categories.value.find((item) => item.slug === categoryFilter.value)
    items.push(`Categoría: ${category?.name || categoryFilter.value}`)
  }
  if (sortOrder.value === 'price_asc') items.push('Precio: menor a mayor')
  if (sortOrder.value === 'price_desc') items.push('Precio: mayor a menor')
  if (mineOnly.value) items.push('Solo mis productos')
  return items
})
const formatClp = (value: number | string) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Number(value) || 0)

const displayPrice = (product: any) => {
  const minQty = Math.max(1, Number(product?.offer_min_qty || 1))
  if (product?.offer_price && minQty <= 1) return Number(product.offer_price)
  return Number(product?.price || 0)
}

const filteredProducts = computed(() => {
  let data = [...products.value]
  if (mineOnly.value) {
    data = data.filter((product) => isMine(product))
  }
  if (sortOrder.value === 'price_asc') {
    data.sort((a, b) => Number(a.offer_price || a.price || 0) - Number(b.offer_price || b.price || 0))
  }
  if (sortOrder.value === 'price_desc') {
    data.sort((a, b) => Number(b.offer_price || b.price || 0) - Number(a.offer_price || a.price || 0))
  }
  return data
})

const clearFilters = () => {
  productSearch.value = ''
  categoryFilter.value = ''
  sortOrder.value = ''
  mineOnly.value = false
}

const isMine = (product: any) => {
  const userId = (auth.user as any)?.id
  return Boolean(userId && product?.submitted_by === userId)
}

const fetchProducts = async () => {
  loadingProducts.value = true
  productsError.value = ''
  try {
    const params = new URLSearchParams()
    if (productSearch.value.trim()) params.append('search', productSearch.value.trim())
    if (categoryFilter.value) params.append('category', categoryFilter.value)
    if (sortOrder.value) params.append('order', sortOrder.value)
    const query = params.toString()
    products.value = await controlledGet<any[]>(
      `marketplace:products:${query}`,
      `${config.public.apiBase}/marketplace/products/?${query}`,
      { backoffMs: 8_000, minIntervalMs: 500 },
    )
  } catch (err: any) {
    if (err?.response?.status === 429) {
      productsError.value = 'Demasiadas solicitudes. Espera unos segundos para volver a consultar productos.'
    } else {
      productsError.value = 'Error al cargar productos'
    }
  } finally {
    loadingProducts.value = false
  }
}

const fetchCategories = async () => {
  try {
    categories.value = await $fetch(`${config.public.apiBase}/marketplace/categories/`)
  } catch {
    categories.value = []
  }
}

let fetchTimer: any = null
const scheduleFetch = () => {
  if (fetchTimer) clearTimeout(fetchTimer)
  fetchTimer = setTimeout(fetchProducts, 250)
}

watch([productSearch, categoryFilter, sortOrder], scheduleFetch)

onMounted(async () => {
  theme.loadFromStorage()
  theme.applyTheme()
  await auth.initializeSession().catch(() => null)
  cart.loadFromStorage()
  cart.setContext('marketplace')
  await Promise.all([fetchProducts(), fetchCategories()])
})
</script>
