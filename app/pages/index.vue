<template>
  <div class="relative isolate overflow-hidden">
    <div class="pointer-events-none absolute inset-0 opacity-60" aria-hidden="true">
      <div class="absolute -left-16 top-10 h-56 w-56 rounded-full bg-gradient-to-r from-[var(--gradient-from,#111827)] to-[var(--gradient-to,#0b2358)] blur-3xl" />
      <div class="absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-gradient-to-r from-[var(--gradient-from,#111827)] to-[var(--gradient-to,#0b2358)] blur-3xl" />
    </div>

    <section
      class="relative z-10 bg-slate-950 text-white reveal"
      :style="heroStyle"
    >
      <div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 pt-6">
        <div class="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/80 shadow-lg shadow-blue-900/30">
          Panel principal
          <span class="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <div class="flex flex-wrap items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 backdrop-blur">
          <NuxtLink to="/marketplace" class="rounded-full px-3 py-1 hover:bg-white/20">Marketplace</NuxtLink>
          <NuxtLink to="/tiendas" class="rounded-full px-3 py-1 hover:bg-white/20">Tiendas</NuxtLink>
          <NuxtLink to="/login" class="rounded-full px-3 py-1 hover:bg-white/20">Acceder</NuxtLink>
          <NuxtLink to="/register" class="rounded-full px-3 py-1 hover:bg-white/20">Crear cuenta</NuxtLink>
        </div>
      </div>
      <div class="max-w-6xl mx-auto px-6 py-16 lg:py-24 grid lg:grid-cols-[1.1fr,0.9fr] gap-12 items-center">
        <div>
          <p class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em]">
            Gestiona y personaliza
          </p>
          <h1 class="mt-6 text-4xl md:text-5xl font-extrabold leading-tight">
            Tu ecosistema de tiendas, con el estilo que necesitas
          </h1>
          <p class="mt-4 text-lg text-white/80 max-w-2xl">
            Inicia sesión, consulta tus tiendas, explora todas las disponibles y ajusta los colores para que tu marca se sienta en casa.
          </p>

          <div class="mt-8 grid gap-3 sm:grid-cols-3">
            <NuxtLink
              v-if="!auth.isAuthenticated"
              to="/login"
              class="inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold shadow-lg shadow-black/20 transition hover:-translate-y-0.5"
              :style="{ backgroundColor: theme.accent, color: '#fff' }"
            >
              Iniciar sesión
              <ChevronRight class="h-4 w-4" aria-hidden="true" />
            </NuxtLink>
            <a
              v-else
              href="#crear-tienda"
              class="inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold shadow-lg shadow-black/20 transition hover:-translate-y-0.5"
              :style="{ backgroundColor: theme.accent, color: '#fff' }"
            >
              Crear tienda
              <Star class="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href="#tiendas"
              class="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-3 font-semibold text-white hover:border-white/40 hover:bg-white/5 transition"
            >
              Ver tiendas
              <ChevronRight class="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>

        <div class="relative">
          <div class="absolute -inset-8 rounded-3xl bg-white/5 blur-2xl" />
          <div class="relative rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
            <div class="flex items-center justify-between text-sm text-white/80">
              <span>Panel de tiendas</span>
              <span class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs">
                Sincronizado
                <span class="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              </span>
            </div>

            <div v-if="auth.isAuthenticated" class="mt-4 space-y-3">
              <div
                v-for="s in storesMine.slice(0, 3)"
                :key="s.slug"
                class="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3"
              >
                <div>
                  <p class="text-sm text-white/70">{{ s.slug }}</p>
                  <p class="text-base font-semibold">{{ s.name }}</p>
                </div>
                <span class="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">Activa</span>
              </div>
              <p class="text-xs text-white/60">Vista previa de tus tiendas. Ajusta colores dentro de cada tienda.</p>
            </div>

            <div v-else class="mt-4 space-y-3 text-white/80">
              <p class="text-sm">Explora las tiendas disponibles y compra sin registrar.</p>
              <p class="text-xs text-white/60">Inicia sesión para administrar tus propias tiendas.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="relative z-10 max-w-6xl mx-auto px-6 py-12 space-y-6 reveal" style="animation-delay: 0.03s;">
      <div class="grid gap-6 lg:grid-cols-1">
        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs uppercase tracking-[0.2em] text-slate-500">Últimas novedades</p>
              <h3 class="text-lg font-semibold text-slate-900">Lo más nuevo de las tiendas, con su color</h3>
            </div>
            <NuxtLink to="/marketplace" class="text-sm font-semibold text-slate-700 hover:text-slate-900">Marketplace</NuxtLink>
          </div>
          <div v-if="loadingStoreProducts" class="text-slate-500 mt-3">Cargando productos de tiendas...</div>
          <div v-else-if="storeProductsError" class="text-red-600 mt-3">{{ storeProductsError }}</div>
          <div v-else-if="!featuredStoreProducts.length" class="text-slate-600 mt-3">Sin productos recientes publicados.</div>
          <div v-else class="mt-3 space-y-3">
            <NuxtLink
              v-for="product in featuredStoreProducts"
              :key="product.id"
              :to="productDetailPath(product)"
              class="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 transition hover:-translate-y-0.5 hover:shadow"
            >
              <img :src="product.images?.[0]?.image || product.image || productImage(product)" :alt="product.name" class="h-16 w-16 rounded-xl object-cover" />
              <div class="flex-1">
                <p class="text-xs uppercase tracking-wide text-slate-500">{{ product.category?.name || 'General' }}</p>
                <p class="text-sm font-semibold text-slate-900 line-clamp-1">{{ product.name }}</p>
                <div class="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <span
                    class="rounded-full px-2 py-1"
                    :style="{ backgroundColor: `${storeAccent(product)}22`, color: storeAccent(product) }"
                  >
                    {{ product.store?.slug || 'tienda' }}
                  </span>
                  <span class="text-slate-500">${{ product.offer_price || product.price }}</span>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

      <section id="tiendas" class="relative z-10 max-w-6xl mx-auto px-6 py-14 space-y-10 reveal" style="animation-delay: 0.05s;">
        <div class="grid gap-8" :class="auth.isAuthenticated ? 'lg:grid-cols-[1.1fr,0.9fr]' : 'lg:grid-cols-1'">
          <div v-if="auth.isAuthenticated" class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs uppercase tracking-[0.2em] text-slate-500">Mis tiendas</p>
                <h3 class="text-xl font-semibold text-slate-900">Creadas o administradas por ti</h3>
              </div>
              <a
                href="#crear-tienda"
                class="text-sm font-semibold text-slate-600 underline decoration-dashed"
              >
                Crear tienda
              </a>
            </div>

            <div class="space-y-4">
              <div
                id="crear-tienda"
                class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div class="flex flex-col gap-3 sm:flex-row">
                  <input
                    v-model="newStoreName"
                    type="text"
                    placeholder="Nombre de tu nueva tienda"
                    class="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-slate-800 shadow-inner focus:border-slate-400 focus:outline-none"
                  />
                  <button
                    class="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold text-white shadow-lg shadow-black/10 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                    :style="{ backgroundColor: theme.accent }"
                    :disabled="creating || !newStoreName.trim()"
                    @click="createStore"
                  >
                    {{ creating ? 'Creando…' : 'Crear tienda' }}
                  </button>
                </div>
                <p v-if="createError" class="mt-2 text-sm text-red-600">{{ createError }}</p>
                <p v-else-if="createMessage" class="mt-2 text-sm text-green-600">{{ createMessage }}</p>
              </div>

              <div v-if="loadingMine" class="text-slate-500">Cargando tus tiendas...</div>
              <div v-else-if="storesMine.length === 0" class="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-slate-600">
                No tienes tiendas asociadas aún. Crea una o solicita acceso.
              </div>
              <div v-else class="grid gap-4 sm:grid-cols-2">
                <StoreCard v-for="store in storesMine" :key="store.slug" :store="store" :accent="theme.accent" />
              </div>
            </div>
          </div>
          <div class="space-y-4">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p class="text-xs uppercase tracking-[0.2em] text-slate-500">Todas las tiendas</p>
                <h3 class="text-xl font-semibold text-slate-900">Explora el marketplace</h3>
              </div>
              <div class="flex flex-wrap items-center justify-end gap-3">
                <NuxtLink
                  to="/tiendas"
                  class="hidden rounded-xl px-4 py-2 text-sm font-semibold text-white shadow sm:inline-flex"
                  :style="{ backgroundColor: theme.accent }"
                >
                  Ver todas las tiendas
                  <ChevronRight class="h-4 w-4" aria-hidden="true" />
                </NuxtLink>
                <button
                  type="button"
                  class="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition"
                  :class="showFavoriteStoresOnly ? 'border-rose-200 bg-rose-50 text-rose-600 shadow-inner' : 'border-slate-200 text-slate-700 hover:border-slate-300'"
                  @click="toggleFavoriteStoreFilter"
                >
                  <Heart
                    class="h-4 w-4"
                    :class="showFavoriteStoresOnly ? 'fill-current text-rose-600' : 'text-slate-500'"
                  />
                  {{ showFavoriteStoresOnly ? 'Solo favoritos' : 'Todos' }}
                </button>
                <input
                  v-model="filterQuery"
                  type="text"
                  placeholder="Buscar tienda..."
                  class="hidden w-56 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-inner focus:border-slate-400 focus:outline-none sm:block"
                />
              </div>
            </div>

            <div class="sm:hidden flex flex-col gap-2">
              <input
                v-model="filterQuery"
                type="text"
                placeholder="Buscar tienda..."
                class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-inner focus:border-slate-400 focus:outline-none"
              />
              <button
                type="button"
                class="inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition"
                :class="showFavoriteStoresOnly ? 'border-rose-200 bg-rose-50 text-rose-600 shadow-inner' : 'border-slate-200 text-slate-700 hover:border-slate-300'"
                @click="toggleFavoriteStoreFilter"
              >
                <Heart
                  class="h-4 w-4"
                  :class="showFavoriteStoresOnly ? 'fill-current text-rose-600' : 'text-slate-500'"
                />
                {{ showFavoriteStoresOnly ? 'Solo favoritos' : 'Filtrar favoritos' }}
              </button>
            </div>

            <div v-if="loadingAll" class="text-slate-500">Cargando tiendas...</div>
            <div v-else-if="error" class="text-red-500">{{ error }}</div>
            <div v-else-if="filteredStoresAll.length === 0" class="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-slate-600">
              {{ emptyStoresMessage }}
            </div>
            <div v-else class="grid gap-4 sm:grid-cols-2">
              <StoreCard v-for="store in paginatedStores" :key="store.slug" :store="store" :accent="theme.accent" />
            </div>

            <div v-if="storesTotalPages > 1" class="flex items-center justify-between pt-2 text-sm text-slate-600">
              <button
                class="rounded-lg border border-slate-200 px-3 py-1 hover:border-slate-300 disabled:opacity-40"
                :disabled="storesPage === 1"
                @click="storesPage--"
              >
                Anterior
              </button>
              <span>Página {{ storesPage }} / {{ storesTotalPages }}</span>
              <button
                class="rounded-lg border border-slate-200 px-3 py-1 hover:border-slate-300 disabled:opacity-40"
                :disabled="storesPage === storesTotalPages"
                @click="storesPage++"
              >
                Siguiente
              </button>
            </div>

            <NuxtLink
              to="/tiendas"
              class="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 sm:hidden"
            >
              Ver todas las tiendas
              <ChevronRight class="h-4 w-4" aria-hidden="true" />
            </NuxtLink>
          </div>
        </div>
      </section>

      <section class="relative z-10 max-w-6xl mx-auto px-6 py-14 space-y-6 reveal" style="animation-delay: 0.08s;">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p class="text-xs uppercase tracking-[0.2em] text-slate-500">Marketplace</p>
            <h3 class="text-2xl font-semibold text-slate-900">Productos destacados de todas las tiendas</h3>
            <p class="text-slate-600">Compra directo en la tienda propietaria sin salir del marketplace.</p>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition"
              :class="showFavoriteProductsOnly ? 'border-rose-200 bg-rose-50 text-rose-600 shadow-inner' : 'border-slate-200 text-slate-700 hover:border-slate-300'"
              @click="toggleFavoriteProductFilter"
            >
              <Heart
                class="h-4 w-4"
                :class="showFavoriteProductsOnly ? 'fill-current text-rose-600' : 'text-slate-500'"
              />
              {{ showFavoriteProductsOnly ? 'Solo productos favoritos' : 'Todos los productos' }}
            </button>
            <NuxtLink
              to="/marketplace"
              class="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow"
              :style="{ backgroundColor: '#f59e0b' }"
            >
              Ir al marketplace
              <ChevronRight class="h-4 w-4" aria-hidden="true" />
            </NuxtLink>
          </div>
        </div>

        <div v-if="loadingMarketplace" class="text-slate-500">Cargando marketplace...</div>
        <div v-else-if="marketplaceError" class="text-red-600">{{ marketplaceError }}</div>
        <div v-else-if="!marketplaceProducts.length" class="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-slate-600">
          No hay productos de marketplace publicados todavía.
        </div>
        <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <ProductCard v-for="product in displayMarketplaceProducts" :key="product.id" :product="product" :isMarketplace="true" />
        </div>
      </section>

    <footer class="relative z-10 border-t bg-white/80 backdrop-blur">
      <div class="max-w-6xl mx-auto px-6 py-6 text-center text-sm text-slate-500">
        © {{ new Date().getFullYear() }} Pymeweb — Gestiona y personaliza tus tiendas
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ChevronRight, Heart, Star } from 'lucide-vue-next'
import ProductCard from '~/components/ProductCard.vue'
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useRuntimeConfig } from 'nuxt/app'
import { useAuthStore } from '~/stores/auth'
import { useThemeStore } from '~/stores/theme'
import { useCartStore } from '~/stores/cart'
import { makeProductFavoriteKey, useFavorites } from '../composables/useFavorites'

type Store = { id: number; name: string; slug: string }

const config = useRuntimeConfig()
const apiBase = String(config.public.apiBase || '')
const router = useRouter()
const auth = useAuthStore()
const theme = useThemeStore()
const cart = useCartStore()

const { isStoreFavorite, isProductFavoriteKey, toggleProductFavoriteKey } = useFavorites()

const asAnyTo = (path: string) => ({ path } as any)

const storesAll = ref<Store[]>([])
const storesMine = ref<Store[]>([])
const loadingAll = ref(true)
const loadingMine = ref(false)
const marketplaceProducts = ref<any[]>([])
const loadingMarketplace = ref(true)
const marketplaceError = ref('')
const latestStoreProducts = ref<any[]>([])
const loadingStoreProducts = ref(true)
const storeProductsError = ref('')
const error = ref('')
const newStoreName = ref('')
const creating = ref(false)
const createError = ref('')
const createMessage = ref('')
const filterQuery = ref('')
const storesPage = ref(1)
const storesPerPage = 4
const showFavoriteStoresOnly = ref(false)
const showFavoriteProductsOnly = ref(false)

const heroStyle = computed(() => ({
  backgroundImage: `linear-gradient(120deg, ${theme.gradientFrom}, ${theme.gradientTo})`,
}))

const toggleFavoriteProductFilter = () => {
  showFavoriteProductsOnly.value = !showFavoriteProductsOnly.value
}

const toggleFavoriteStoreFilter = () => {
  showFavoriteStoresOnly.value = !showFavoriteStoresOnly.value
  storesPage.value = 1
}

const filteredStoresAll = computed(() => {
  const term = filterQuery.value.trim().toLowerCase()
  const base = !term
    ? storesAll.value
    : storesAll.value.filter((s) => s.name.toLowerCase().includes(term) || s.slug.toLowerCase().includes(term))

  const filtered = showFavoriteStoresOnly.value ? base.filter((s) => isStoreFavorite(s.slug)) : base

  return [...filtered].sort((a, b) => {
    const favDiff = Number(isStoreFavorite(b.slug)) - Number(isStoreFavorite(a.slug))
    if (favDiff) return favDiff
    return a.name.localeCompare(b.name)
  })
})

const emptyStoresMessage = computed(() =>
  filterQuery.value.trim()
    ? 'No hay tiendas que coincidan con tu búsqueda.'
    : 'No hay tiendas disponibles.'
)

const storesTotalPages = computed(() => Math.max(1, Math.ceil(filteredStoresAll.value.length / storesPerPage)))
const paginatedStores = computed(() => {
  const start = (storesPage.value - 1) * storesPerPage
  return filteredStoresAll.value.slice(start, start + storesPerPage)
})

const fetchAllStores = async () => {
  loadingAll.value = true
  error.value = ''
  try {
    storesAll.value = await $fetch<Store[]>(`${apiBase}/stores/` as any)
    storesPage.value = 1
  } catch (err) {
    console.error(err)
    // Evitamos mostrar error rojo; dejamos el estado vacío
    storesAll.value = []
    error.value = ''
  } finally {
    loadingAll.value = false
  }
}

const fetchMarketplace = async () => {
  loadingMarketplace.value = true
  marketplaceError.value = ''
  try {
    marketplaceProducts.value = await $fetch<any[]>(`${apiBase}/marketplace/products/?limit=6` as any)
  } catch (err) {
    console.error(err)
    marketplaceError.value = 'Error al cargar el marketplace'
  } finally {
    loadingMarketplace.value = false
  }
}

const fetchLatestStoreProducts = async () => {
  loadingStoreProducts.value = true
  storeProductsError.value = ''
  const candidates = [
    `${apiBase}/products/latest/?limit=6&ordering=-created_at`,
    `${apiBase}/marketplace/products/?store_only=true&limit=6&ordering=-created_at`,
  ]
  for (const url of candidates) {
    try {
      const data = await $fetch<any[]>(url as any)
      if (data?.length) {
        latestStoreProducts.value = data
        loadingStoreProducts.value = false
        return
      }
    } catch (err) {
      // try next endpoint
    }
  }
  // Fallback: usa los productos de marketplace que pertenezcan a tiendas (no marketplace)
  const fallback = (marketplaceProducts.value || [])
    .filter((p: any) => !p.store_is_marketplace)
    .sort((a: any, b: any) => new Date(b.created_at || b.created || b.id).getTime() - new Date(a.created_at || a.created || a.id).getTime())
  latestStoreProducts.value = fallback.slice(0, 6)
  storeProductsError.value = ''
  loadingStoreProducts.value = false
}

const storeAccent = (product: any) => product?.store?.color || product?.store?.brand_color || theme.accent
const featuredStoreProducts = computed(() => (latestStoreProducts.value || []).slice(0, 3))

const productFavoriteKey = (product: any) => makeProductFavoriteKey(product?.store?.slug, product?.slug || product?.id)
const isProductFavorite = (product: any) => isProductFavoriteKey(productFavoriteKey(product))
const toggleProductFavorite = (product: any) => toggleProductFavoriteKey(productFavoriteKey(product))
const displayMarketplaceProducts = computed(() => {
  const base = marketplaceProducts.value || []
  const filtered = showFavoriteProductsOnly.value ? base.filter((p: any) => isProductFavorite(p)) : base
  return [...filtered].sort((a: any, b: any) => Number(isProductFavorite(b)) - Number(isProductFavorite(a)))
})

const productImage = (product: any) => product?.images?.[0]?.image || 'https://via.placeholder.com/400x240?text=Producto'

const addToCart = async (product: any) => {
  if (!product) return
  cart.setContext('marketplace')
  cart.addProduct(product)
  await router.push('/marketplace/carrito')
}

const fetchMyStores = async () => {
  if (!auth.token) return
  loadingMine.value = true
  try {
    storesMine.value = await auth.fetchMyStores()
  } finally {
    loadingMine.value = false
  }
}

const createStore = async () => {
  if (!auth.token) {
    await router.push('/login')
    return
  }
  if (!newStoreName.value.trim()) {
    createError.value = 'Escribe el nombre de tu tienda'
    return
  }

  createError.value = ''
  createMessage.value = ''
  creating.value = true
  try {
    const created = await $fetch<Store>(`${apiBase}/stores/` as any, {
      method: 'POST',
      body: { name: newStoreName.value },
      headers: { Authorization: `Bearer ${auth.token}` },
    })
    createMessage.value = 'Tienda creada correctamente'
    newStoreName.value = ''
    await Promise.all([fetchAllStores(), fetchMyStores()])
    if (created?.slug) {
      await router.push({ path: '/store/' + created.slug, query: { edit: 'true' } } as any)
    }
  } catch (err: any) {
    createError.value = err?.response?._data?.detail || 'No pudimos crear la tienda'
  } finally {
    creating.value = false
  }
}

const productDetailPath = (product: any) => {
  const id = product?.slug || product?.id
  if (!id) return '/marketplace'
  if (product?.store?.slug && !product?.store_is_marketplace) {
    return `/store/${product.store.slug}/productos/${id}`
  }
  return `/marketplace/productos/${id}`
}

const storePath = (product: any) => {
  const storeSlug = product?.store?.slug
  return storeSlug ? `/store/${storeSlug}` : '/tiendas'
}

// Marketplace accent and styles
const MARKET_ACCENT = '#f59e0b'
const marketGlowStyle = computed(() => ({ background: `radial-gradient(circle at 30% 20%, ${MARKET_ACCENT}1a, transparent 40%)` }))
const marketBadgeClass = computed(() => 'bg-amber-100 text-amber-800')

onMounted(async () => {
  theme.loadFromStorage()
  auth.restoreFromCookies()
  if (auth.token && !auth.user) {
    await auth.fetchProfile()
  }
  await fetchAllStores()
  await fetchMarketplace()
  await fetchLatestStoreProducts()
  if (auth.token) {
    await fetchMyStores()
  }
  theme.applyTheme()
})

watch(
  () => auth.token,
  async (token) => {
    if (token) {
      await fetchMyStores()
    } else {
      storesMine.value = []
    }
  }
)

watch(filterQuery, () => {
  storesPage.value = 1
})
</script>

