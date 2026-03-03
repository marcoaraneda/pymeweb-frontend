<template>
  <div class="min-h-screen bg-slate-50">
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
              {{ auth.isAuthenticated ? 'Gestionar mis productos' : 'Iniciar sesión para publicar' }}
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
              <span v-if="product.offer_price" class="mr-1 text-amber-100/70 line-through">${{ product.price }}</span>
              ${{ product.offer_price || product.price }}
            </p>
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
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
          <select
            v-model="sortOrder"
            class="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-inner focus:border-slate-400 focus:outline-none"
          >
            <option value="">Ordenar por precio</option>
            <option value="asc">Menor a mayor</option>
            <option value="desc">Mayor a menor</option>
          </select>
          <input
            v-model="productSearch"
            type="text"
            placeholder="Buscar producto..."
            class="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-inner focus:border-slate-400 focus:outline-none md:w-64"
          />
        </div>
      </div>

      <div v-if="loadingProducts" class="text-slate-500">Cargando productos...</div>
      <div v-else-if="productsError" class="text-red-600">{{ productsError }}</div>
      <div v-else-if="!filteredProducts.length" class="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-slate-600">
        No hay productos publicados en marketplace.
      </div>
      <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <ProductCard
          v-for="product in filteredProducts"
          :key="product.id"
          :product="product"
          :accent="marketplaceAccent"
          :isMarketplace="true"
        />
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
import ProductCard from '~/components/ProductCard.vue'
import { computed, onMounted, ref } from 'vue'
import { useRuntimeConfig } from 'nuxt/app'
import { useThemeStore } from '~/stores/theme'
import { useAuthStore } from '~/stores/auth'
import { useCartStore } from '~/stores/cart'

const theme = useThemeStore()
const auth = useAuthStore()
const cart = useCartStore()
const config = useRuntimeConfig()

const marketplaceAccent = '#f59e0b'
const heroStyle = computed(() => ({ '--gradient-from': '#92400e', '--gradient-to': marketplaceAccent }))

const products = ref<any[]>([])
const loadingProducts = ref(true)
const productsError = ref('')
const productSearch = ref('')
const categoryFilter = ref('')
const sortOrder = ref('')

const categories = computed(() => {
  const names = new Set<string>()
  products.value.forEach((p) => {
    const name = p.category?.name
    if (name) names.add(name)
  })
  return Array.from(names).sort((a, b) => a.localeCompare(b))
})

const filteredProducts = computed(() => {
  const term = productSearch.value.trim().toLowerCase()
  let data = products.value
  if (term) {
    data = data.filter((p) => p.name.toLowerCase().includes(term) || p.store?.slug?.toLowerCase()?.includes(term))
  }
  if (categoryFilter.value) {
    data = data.filter((p) => p.category?.name === categoryFilter.value)
  }
  if (sortOrder.value) {
    data = [...data].sort((a: any, b: any) => {
      const pa = Number(a.offer_price || a.price || 0)
      const pb = Number(b.offer_price || b.price || 0)
      return sortOrder.value === 'asc' ? pa - pb : pb - pa
    })
  }
  return data
})

const fetchProducts = async () => {
  loadingProducts.value = true
  productsError.value = ''
  try {
    products.value = await $fetch(`${config.public.apiBase}/marketplace/products/`)
  } catch (err) {
    productsError.value = 'Error al cargar productos'
  } finally {
    loadingProducts.value = false
  }
}

onMounted(async () => {
  theme.loadFromStorage()
  theme.applyTheme()
  auth.restoreFromCookies()
  cart.loadFromStorage()
  cart.setContext('marketplace')
  await fetchProducts()
})
</script>
