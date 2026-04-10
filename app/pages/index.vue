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
      <div class="max-w-6xl mx-auto px-6 py-16 lg:py-24 grid lg:grid-cols-[1.1fr,0.9fr] gap-12 items-center">
        <div>
          <p class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em]">
            Bienvenido a Pymeweb
          </p>
          <h1 class="mt-6 text-4xl md:text-5xl font-extrabold leading-tight">
            Lanza, personaliza y escala tu tienda digital en minutos
          </h1>
          <p class="mt-4 text-lg text-white/80 max-w-2xl">
            Pymeweb te da una vitrina moderna para vender con identidad propia: crea tu tienda, publica productos y convierte visitas en compras.
          </p>

          <div class="mt-8 grid gap-3 sm:grid-cols-3">
            <button
              v-if="auth.isAuthenticated"
              type="button"
              class="inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold shadow-lg shadow-black/20 transition hover:-translate-y-0.5"
              :style="{ backgroundColor: theme.accent, color: '#fff' }"
              @click="openCreateStoreModal"
            >
              Crear tienda ahora
              <Star class="h-4 w-4" aria-hidden="true" />
            </button>
            <NuxtLink
              v-else
              to="/login"
              class="inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold shadow-lg shadow-black/20 transition hover:-translate-y-0.5"
              :style="{ backgroundColor: theme.accent, color: '#fff' }"
            >
              Iniciar sesión
              <ChevronRight class="h-4 w-4" aria-hidden="true" />
            </NuxtLink>
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
              <span>Tutorial Pymeweb</span>
              <span class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs">3 pasos</span>
            </div>

            <div class="mt-4 space-y-3">
              <div class="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                <div>
                  <p class="text-xs uppercase text-white/60">Paso 1</p>
                  <p class="text-base font-semibold">Crea tu tienda con tu marca</p>
                </div>
                <span class="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">Inicio</span>
              </div>
              <div class="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                <div>
                  <p class="text-xs uppercase text-white/60">Paso 2</p>
                  <p class="text-base font-semibold">Publica productos y ofertas</p>
                </div>
                <span class="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">Catálogo</span>
              </div>
              <div class="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                <div>
                  <p class="text-xs uppercase text-white/60">Paso 3</p>
                  <p class="text-base font-semibold">Gestiona pedidos desde dashboard</p>
                </div>
                <span class="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">Ventas</span>
              </div>
              <p class="text-xs text-white/60">Todo en un flujo conectado para que puedas vender sin fricciones.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="relative z-10 max-w-6xl mx-auto px-6 py-12 space-y-6 reveal" style="animation-delay: 0.03s;">
      <div class="grid gap-6 lg:grid-cols-1">
        <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs uppercase tracking-[0.2em] text-slate-500">Últimas novedades</p>
              <h3 class="text-xl font-semibold text-slate-900">Lo nuevo para vender mejor hoy</h3>
            </div>
            <NuxtLink to="/marketplace" class="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300">Marketplace</NuxtLink>
          </div>
          <div v-if="loadingStoreProducts" class="text-slate-500 mt-3">Cargando productos de tiendas...</div>
          <div v-else-if="storeProductsError" class="text-red-600 mt-3">{{ storeProductsError }}</div>
          <div v-else-if="!featuredStoreProducts.length" class="text-slate-600 mt-3">Sin productos recientes publicados.</div>
          <div v-else class="mt-4 grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
            <NuxtLink
              :to="productDetailPath(featuredMainProduct)"
              class="rounded-2xl border border-slate-200 bg-slate-900 p-4 text-white transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div class="flex h-full flex-col gap-4">
                <img :src="productImage(featuredMainProduct)" :alt="featuredMainProduct?.name" class="h-44 w-full rounded-xl object-cover" />
                <div>
                  <p class="text-xs uppercase tracking-wide text-slate-300">{{ featuredMainProduct?.category?.name || 'General' }}</p>
                  <p class="text-xl font-semibold line-clamp-1">{{ featuredMainProduct?.name }}</p>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="rounded-full bg-white/10 px-3 py-1">{{ featuredMainProduct?.store?.slug || 'tienda' }}</span>
                  <span class="font-semibold">{{ formatClp(displayPrice(featuredMainProduct)) }}</span>
                </div>
              </div>
            </NuxtLink>

            <div class="space-y-3">
              <NuxtLink
                v-for="product in featuredSecondaryProducts"
                :key="product.id"
                :to="productDetailPath(product)"
                class="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 transition hover:-translate-y-0.5 hover:shadow"
              >
                <img :src="productImage(product)" :alt="product.name" class="h-16 w-16 rounded-xl object-cover" />
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
                    <span class="text-slate-500">{{ formatClp(displayPrice(product)) }}</span>
                  </div>
                </div>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>

      <section id="tiendas" class="relative z-10 max-w-6xl mx-auto px-6 py-14 space-y-10 reveal" style="animation-delay: 0.05s;">
        <div class="grid gap-8 lg:grid-cols-1">
          <div class="space-y-4">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p class="text-xs uppercase tracking-[0.2em] text-slate-500">Todas las tiendas</p>
                <h3 class="text-2xl font-semibold text-slate-900">Descubre tiendas activas en Pymeweb</h3>
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
            <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          <ProductCard v-for="product in paginatedMarketplaceProducts" :key="product.id" :product="product" :isMarketplace="true" />
        </div>

        <div v-if="displayMarketplaceProducts.length > marketplacePerPage" class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          <button
            class="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold hover:bg-slate-50 disabled:opacity-40"
            :disabled="marketplacePage === 1"
            @click="marketplacePage -= 1"
          >
            Anterior
          </button>
          <p>Mostrando {{ marketplacePageStart }}-{{ marketplacePageEnd }} de {{ displayMarketplaceProducts.length }}</p>
          <button
            class="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold hover:bg-slate-50 disabled:opacity-40"
            :disabled="marketplacePage === marketplaceTotalPages"
            @click="marketplacePage += 1"
          >
            Siguiente
          </button>
        </div>
      </section>

    <section v-if="showCreateStoreModal" class="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-slate-900/70 px-4 py-10">
      <div class="relative w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <button
          class="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-100"
          @click="closeCreateStoreModal"
          aria-label="Cerrar creación"
        >
          ×
        </button>

        <div class="space-y-4">
          <div>
            <p class="text-xs uppercase tracking-[0.25em] text-slate-500">Nueva tienda</p>
            <h2 class="text-xl font-semibold text-slate-900">Crea tu tienda en Pymeweb</h2>
            <p class="text-slate-600">Completa los datos principales. Puedes seguir editando dentro de tu tienda luego de crearla.</p>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <div class="space-y-2">
              <label class="text-sm text-slate-600">Nombre</label>
              <input v-model="createForm.name" type="text" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div class="space-y-2">
              <label class="text-sm text-slate-600">Slug (opcional)</label>
              <input v-model="createForm.slug" type="text" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div class="space-y-2 md:col-span-2">
              <label class="text-sm text-slate-600">Tipo de tienda</label>
              <select v-model="createForm.store_type" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                <option value="retail">Retail</option>
                <option value="fast_food">Comida rápida</option>
                <option value="bakery">Pastelería</option>
                <option value="pharmacy">Farmacia</option>
                <option value="fashion">Moda</option>
                <option value="bookstore">Librería</option>
              </select>
            </div>
            <div class="space-y-2 md:col-span-2">
              <label class="text-sm text-slate-600">Descripción</label>
              <textarea v-model="createForm.description" rows="3" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"></textarea>
            </div>
            <div class="space-y-2 md:col-span-2">
              <label class="text-sm text-slate-600">Acerca de</label>
              <textarea v-model="createForm.about" rows="3" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"></textarea>
            </div>
            <div class="space-y-2">
              <label class="text-sm text-slate-600">Email de contacto</label>
              <input v-model="createForm.contact_email" type="email" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div class="space-y-2">
              <label class="text-sm text-slate-600">Teléfono</label>
              <input v-model="createForm.phone" type="text" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div class="space-y-2">
              <label class="text-sm text-slate-600">WhatsApp</label>
              <input v-model="createForm.whatsapp" type="text" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div class="space-y-2 md:col-span-2">
              <label class="text-sm text-slate-600">Dirección</label>
              <input v-model="createForm.address" type="text" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div class="space-y-2 md:col-span-2">
              <label class="text-sm text-slate-600">Logo URL (opcional)</label>
              <input v-model="createForm.logo_url" type="url" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <button
              class="rounded-xl px-4 py-2 text-sm font-semibold text-white shadow"
              :style="{ backgroundColor: theme.accent }"
              :disabled="creating || !createForm.name.trim()"
              @click="createStore"
            >
              {{ creating ? 'Creando...' : 'Crear tienda' }}
            </button>
            <p v-if="createError" class="text-sm text-red-600">{{ createError }}</p>
            <p v-else-if="createMessage" class="text-sm text-emerald-600">{{ createMessage }}</p>
          </div>
        </div>
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
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useRuntimeConfig } from 'nuxt/app'
import { useAuthStore } from '~/stores/auth'
import { useThemeStore } from '~/stores/theme'
import { useCartStore } from '~/stores/cart'
import { makeProductFavoriteKey, useFavorites } from '../composables/useFavorites'
import { useMarketplaceRequests } from '~/composables/useMarketplaceRequests'

type Store = { id: number; name: string; slug: string; store_type?: string }

const config = useRuntimeConfig()
const apiBase = String(config.public.apiBase || '')
const router = useRouter()
const auth = useAuthStore()
const theme = useThemeStore()
const cart = useCartStore()
const { controlledGet } = useMarketplaceRequests()

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
const shuffledStoreProducts = ref<any[]>([])
const highlightedStoreProductId = ref<number | string | null>(null)
const loadingStoreProducts = ref(true)
const storeProductsError = ref('')
const error = ref('')
const newStoreName = ref('')
const creating = ref(false)
const createError = ref('')
const createMessage = ref('')
const showCreateStoreModal = ref(false)
const createForm = ref({
  name: '',
  slug: '',
  store_type: 'retail',
  description: '',
  about: '',
  contact_email: '',
  phone: '',
  whatsapp: '',
  address: '',
  logo_url: '',
})
const filterQuery = ref('')
const storesPage = ref(1)
const storesPerPage = 4
const showFavoriteStoresOnly = ref(false)
const showFavoriteProductsOnly = ref(false)
const marketplacePage = ref(1)
const marketplacePerPage = 6

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
    marketplaceProducts.value = await controlledGet<any[]>(
      'home:marketplace:products:limit6',
      `${apiBase}/marketplace/products/?limit=6`,
      { backoffMs: 10_000, minIntervalMs: 1000 },
    )
  } catch (err: any) {
    console.error(err)
    marketplaceError.value = err?.response?.status === 429
      ? 'Marketplace temporalmente ocupado. Reintentaremos en unos segundos.'
      : 'Error al cargar el marketplace'
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
      const isMarketplaceUrl = url.includes('/marketplace/products/')
      const data = isMarketplaceUrl
        ? await controlledGet<any[]>(
            `home:store-products:${url}`,
            url,
            { backoffMs: 10_000, minIntervalMs: 1000 },
          )
        : await $fetch<any[]>(url as any)
      if (data?.length) {
        latestStoreProducts.value = data
        shuffleFeaturedProducts()
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
  shuffleFeaturedProducts()
  storeProductsError.value = ''
  loadingStoreProducts.value = false
}

const storeAccent = (product: any) => product?.store?.color || product?.store?.brand_color || theme.accent
const formatClp = (value: number | string) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Number(value) || 0)
const displayPrice = (product: any) => {
  const minQty = Math.max(1, Number(product?.offer_min_qty || 1))
  if (product?.offer_price && minQty <= 1) return Number(product.offer_price)
  return Number(product?.price || 0)
}
const shuffleArray = <T,>(items: T[]) => {
  const clone = [...items]
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = clone[i]
    clone[i] = clone[j]
    clone[j] = temp
  }
  return clone
}

const shuffleFeaturedProducts = () => {
  const base = shuffleArray((latestStoreProducts.value || []).filter(Boolean))
  shuffledStoreProducts.value = base
  if (!base.length) {
    highlightedStoreProductId.value = null
    return
  }
  if (!base.some((product) => String(product?.id) === String(highlightedStoreProductId.value))) {
    highlightedStoreProductId.value = base[0]?.id ?? null
  }
}

const rotateHighlightedFeaturedProduct = () => {
  const source = shuffledStoreProducts.value.length ? shuffledStoreProducts.value : latestStoreProducts.value
  if (!source.length) {
    highlightedStoreProductId.value = null
    return
  }
  const currentId = highlightedStoreProductId.value
  const candidates = source.filter((product) => String(product?.id) !== String(currentId))
  const pool = candidates.length ? candidates : source
  const randomIndex = Math.floor(Math.random() * pool.length)
  highlightedStoreProductId.value = pool[randomIndex]?.id ?? source[0]?.id ?? null
}

const featuredStoreProducts = computed(() => {
  const source = shuffledStoreProducts.value.length ? shuffledStoreProducts.value : (latestStoreProducts.value || [])
  if (!source.length) return []
  const highlighted = source.find((product) => String(product?.id) === String(highlightedStoreProductId.value)) || source[0]
  const rest = source.filter((product) => String(product?.id) !== String(highlighted?.id)).slice(0, 2)
  return [highlighted, ...rest]
})

const featuredMainProduct = computed(() => featuredStoreProducts.value[0] || null)
const featuredSecondaryProducts = computed(() => featuredStoreProducts.value.slice(1))
let featuredRotationTimer: ReturnType<typeof setInterval> | null = null

const productFavoriteKey = (product: any) => makeProductFavoriteKey(product?.store?.slug, product?.slug || product?.id)
const isProductFavorite = (product: any) => isProductFavoriteKey(productFavoriteKey(product))
const toggleProductFavorite = (product: any) => toggleProductFavoriteKey(productFavoriteKey(product))
const displayMarketplaceProducts = computed(() => {
  const base = marketplaceProducts.value || []
  const filtered = showFavoriteProductsOnly.value ? base.filter((p: any) => isProductFavorite(p)) : base
  return [...filtered].sort((a: any, b: any) => Number(isProductFavorite(b)) - Number(isProductFavorite(a)))
})
const marketplaceTotalPages = computed(() => Math.max(1, Math.ceil(displayMarketplaceProducts.value.length / marketplacePerPage)))
const paginatedMarketplaceProducts = computed(() => {
  const start = (marketplacePage.value - 1) * marketplacePerPage
  return displayMarketplaceProducts.value.slice(start, start + marketplacePerPage)
})
const marketplacePageStart = computed(() => (displayMarketplaceProducts.value.length ? (marketplacePage.value - 1) * marketplacePerPage + 1 : 0))
const marketplacePageEnd = computed(() => Math.min(marketplacePage.value * marketplacePerPage, displayMarketplaceProducts.value.length))

const productImage = (product: any) => product?.image_url || product?.image || product?.images?.[0]?.image || '/logoPW.png'

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

const openCreateStoreModal = () => {
  if (!auth.isAuthenticated) {
    router.push('/login')
    return
  }
  showCreateStoreModal.value = true
}

const closeCreateStoreModal = () => {
  showCreateStoreModal.value = false
}

const createStore = async () => {
  if (!auth.token) {
    await router.push('/login')
    return
  }
  if (!createForm.value.name.trim()) {
    createError.value = 'Escribe el nombre de tu tienda'
    return
  }

  createError.value = ''
  createMessage.value = ''
  creating.value = true
  try {
    const created = await $fetch<Store>(`${apiBase}/stores/` as any, {
      method: 'POST',
      body: {
        name: createForm.value.name,
        slug: createForm.value.slug,
        store_type: createForm.value.store_type,
        description: createForm.value.description,
        about: createForm.value.about,
        contact_email: createForm.value.contact_email,
        phone: createForm.value.phone,
        whatsapp: createForm.value.whatsapp,
        address: createForm.value.address,
        logo_url: createForm.value.logo_url,
      },
      headers: { Authorization: `Bearer ${auth.token}` },
    })
    createMessage.value = 'Tienda creada correctamente'
    createForm.value = {
      name: '',
      slug: '',
      store_type: 'retail',
      description: '',
      about: '',
      contact_email: '',
      phone: '',
      whatsapp: '',
      address: '',
      logo_url: '',
    }
    showCreateStoreModal.value = false
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
  await auth.initializeSession().catch(() => null)
  await fetchAllStores()
  await fetchMarketplace()
  await fetchLatestStoreProducts()
  rotateHighlightedFeaturedProduct()
  featuredRotationTimer = setInterval(() => {
    shuffleFeaturedProducts()
    rotateHighlightedFeaturedProduct()
  }, 6000)
  if (auth.token) {
    await fetchMyStores()
  }
  theme.applyTheme()
})

onBeforeUnmount(() => {
  if (featuredRotationTimer) {
    clearInterval(featuredRotationTimer)
    featuredRotationTimer = null
  }
})

watch(latestStoreProducts, () => {
  shuffleFeaturedProducts()
  rotateHighlightedFeaturedProduct()
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

watch(displayMarketplaceProducts, () => {
  if (marketplacePage.value > marketplaceTotalPages.value) marketplacePage.value = marketplaceTotalPages.value
})

watch(showFavoriteProductsOnly, () => {
  marketplacePage.value = 1
})
</script>

