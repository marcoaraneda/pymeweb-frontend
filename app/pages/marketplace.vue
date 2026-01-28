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
              :to="auth.isAuthenticated ? '#mis-productos' : '/login'"
              class="inline-flex items-center gap-2 rounded-xl border border-white/30 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
            >
              {{ auth.isAuthenticated ? 'Agregar producto' : 'Iniciar sesión para publicar' }}
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
        <article
          v-for="product in filteredProducts"
          :key="product.id"
          class="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
          <div class="h-44 w-full overflow-hidden rounded-t-2xl bg-slate-100">
            <img :src="productImage(product)" :alt="product.name" class="h-full w-full object-cover" />
          </div>
          <div class="flex flex-1 flex-col p-4 space-y-3">
            <div class="flex items-center justify-between">
              <p class="text-xs uppercase text-slate-500">{{ product.category?.name || 'General' }}</p>
              <span class="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">
                {{ product.store_is_marketplace && product.submitted_by_name ? 'Marketplace' : (product.store?.slug || 'tienda') }}
              </span>
            </div>
            <h3 class="text-lg font-semibold text-slate-900 group-hover:text-slate-700 line-clamp-1">{{ product.name }}</h3>
            <p class="text-sm text-slate-600 line-clamp-2">{{ product.description }}</p>
            <p v-if="product.store_is_marketplace && product.submitted_by_name" class="text-xs text-slate-500">
              Vendedor: {{ product.submitted_by_name }}
            </p>

            <div class="flex flex-wrap items-center gap-2">
              <span v-if="product.product_of_week" class="rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-800">Producto de la semana</span>
              <span v-else-if="product.offer_price" class="rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-800">Oferta</span>
              <span class="rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-900">Marketplace</span>
            </div>

            <p class="text-base font-bold" :class="product.offer_price ? 'text-red-600' : 'text-slate-900'">
              <span v-if="product.offer_price" class="mr-1 text-slate-400 line-through">${{ product.price }}</span>
              ${{ product.offer_price || product.price }}
            </p>

            <div class="mt-auto flex flex-wrap items-center justify-end gap-2">
              <button
                class="rounded-lg px-3 py-2 text-sm font-semibold text-white shadow"
                :style="{ backgroundColor: marketplaceAccent }"
                @click="addToCart(product)"
              >
                Agregar al carrito
              </button>
              <NuxtLink
                :to="product.store?.slug && !product.store_is_marketplace
                  ? `/store/${product.store.slug}/productos/${product.slug || product.id}`
                  : `/marketplace/productos/${product.slug || product.id}`"
                class="rounded-lg px-3 py-2 text-sm font-semibold text-white shadow"
                :style="{ backgroundColor: marketplaceAccent }"
              >
                Ver detalle
              </NuxtLink>
              <NuxtLink
                v-if="product.store?.slug && !product.store_is_marketplace"
                :to="`/store/${product.store.slug}`"
                class="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900"
              >
                Ver tienda
              </NuxtLink>
            </div>
          </div>
        </article>
      </div>
    </section>

    <section v-if="auth.isAuthenticated" id="mis-productos" class="mx-auto max-w-6xl px-6 pb-12 space-y-6">
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-xs uppercase tracking-[0.2em] text-slate-500">Marketplace</p>
            <h2 class="text-xl font-semibold text-slate-900">Mis productos</h2>
            <p class="text-sm text-slate-600">Agrega productos, revisa vendidos y reactívalos si lo necesitas.</p>
          </div>
          <div class="flex gap-2">
            <button
              class="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:-translate-y-0.5 transition"
              @click="fetchSubmissions"
              :disabled="submissionsLoading"
            >
              <Loader2 v-if="submissionsLoading" class="h-4 w-4 animate-spin" />
              Recargar
            </button>
          </div>
        </div>

        <div v-if="showForm" class="mt-4 grid gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <label class="text-sm text-slate-600">Nombre</label>
            <input v-model="submissionForm.name" type="text" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div class="space-y-2">
            <label class="text-sm text-slate-600">Precio</label>
            <input v-model.number="submissionForm.price" type="number" step="0.01" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div class="space-y-2">
            <label class="text-sm text-slate-600">Precio oferta (opcional)</label>
            <input v-model.number="submissionForm.offer_price" type="number" step="0.01" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div class="space-y-2">
            <label class="text-sm text-slate-600">Imagen (URL)</label>
            <input v-model="submissionForm.image_url" type="url" placeholder="https://..." class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <p class="text-xs text-slate-500">Opcional; se sube a Cloudinary.</p>
          </div>
          <div class="space-y-2 md:col-span-2">
            <label class="text-sm text-slate-600">Descripción</label>
            <textarea v-model="submissionForm.description" rows="3" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"></textarea>
          </div>

          <div class="md:col-span-2 flex items-center gap-3">
            <button
              class="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow"
              :style="ctaStyle"
              :disabled="submissionSaving || !submissionForm.name || !submissionForm.price"
              @click="createSubmission"
            >
              <Loader2 v-if="submissionSaving" class="h-4 w-4 animate-spin" />
              {{ submissionSaving ? 'Publicando...' : 'Publicar producto' }}
            </button>
            <p v-if="submissionMessage" class="text-sm" :class="submissionMessageType === 'error' ? 'text-red-600' : 'text-green-600'">{{ submissionMessage }}</p>
          </div>
        </div>

        <div class="mt-6">
          <div class="mb-3 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-slate-900">Productos vendidos</h3>
            <span class="text-xs text-slate-500">Se muestran los marcados como inactivos</span>
          </div>
          <div v-if="submissionsLoading" class="text-slate-500">Cargando...</div>
          <div v-else-if="submissionsError" class="text-red-600">{{ submissionsError }}</div>
          <div v-else-if="!soldSubmissions.length" class="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-slate-600">
            Aún no tienes productos vendidos.
          </div>
          <div v-else class="grid gap-3 md:grid-cols-2">
            <article
              v-for="item in soldSubmissions"
              :key="`sold-${item.id}`"
              class="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div class="flex items-center justify-between gap-2">
                <p class="text-sm font-semibold text-slate-900 line-clamp-1">{{ item.name }}</p>
                <span class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">
                  <XCircle class="h-4 w-4" />
                  Vendido
                </span>
              </div>
              <p class="text-sm text-slate-600 line-clamp-2">{{ item.description || 'Sin descripción' }}</p>
              <p class="text-base font-bold" :class="item.offer_price ? 'text-red-600' : 'text-slate-900'">
                <span v-if="item.offer_price" class="mr-1 text-slate-400 line-through">${{ item.price }}</span>
                ${{ item.offer_price || item.price }}
              </p>
              <div class="flex flex-wrap gap-2">
                <button
                  class="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:-translate-y-0.5 transition"
                  :disabled="togglingId === item.id"
                  @click="toggleSubmission(item)"
                >
                  <Loader2 v-if="togglingId === item.id" class="h-4 w-4 animate-spin" />
                  Reactivar
                </button>
              </div>
            </article>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-semibold text-slate-900">Productos publicados (no vendidos)</h2>
            <p class="text-sm text-slate-600">Activos en marketplace. Marca vendido cuando corresponda.</p>
          </div>
          <button
            class="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow"
            :style="ctaStyle"
            @click="showForm = !showForm"
          >
            {{ showForm ? 'Cerrar formulario' : 'Agregar producto' }}
          </button>
        </div>

        <div v-if="submissionsLoading" class="mt-4 text-slate-500">Cargando mis productos...</div>
        <div v-else-if="submissionsError" class="mt-4 text-red-600">{{ submissionsError }}</div>
        <div v-else-if="showForm" class="mt-4 grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
          <div class="space-y-2">
            <label class="text-sm text-slate-600">Nombre</label>
            <input v-model="submissionForm.name" type="text" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div class="space-y-2">
            <label class="text-sm text-slate-600">Precio</label>
            <input v-model.number="submissionForm.price" type="number" step="0.01" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div class="space-y-2">
            <label class="text-sm text-slate-600">Precio oferta (opcional)</label>
            <input v-model.number="submissionForm.offer_price" type="number" step="0.01" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div class="space-y-2">
            <label class="text-sm text-slate-600">Imagen (URL)</label>
            <input v-model="submissionForm.image_url" type="url" placeholder="https://..." class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <p class="text-xs text-slate-500">Opcional; se sube a Cloudinary.</p>
          </div>
          <div class="space-y-2 md:col-span-2">
            <label class="text-sm text-slate-600">Descripción</label>
            <textarea v-model="submissionForm.description" rows="3" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"></textarea>
          </div>

          <div class="md:col-span-2 flex items-center gap-3">
            <button
              class="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow"
              :style="ctaStyle"
              :disabled="submissionSaving || !submissionForm.name || !submissionForm.price"
              @click="createSubmission"
            >
              <Loader2 v-if="submissionSaving" class="h-4 w-4 animate-spin" />
              {{ submissionSaving ? 'Publicando...' : 'Publicar producto' }}
            </button>
            <p v-if="submissionMessage" class="text-sm" :class="submissionMessageType === 'error' ? 'text-red-600' : 'text-green-600'">{{ submissionMessage }}</p>
          </div>
        </div>
        <div v-else-if="!activeSubmissions.length" class="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-slate-600">
          No tienes productos activos en marketplace.
        </div>
        <div v-else class="mt-4 grid gap-4 md:grid-cols-2">
          <article
            v-for="item in activeSubmissions"
            :key="`active-${item.id}`"
            class="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div class="flex items-start justify-between gap-2">
              <div>
                <p class="text-sm font-semibold text-slate-900 line-clamp-1">{{ item.name }}</p>
                <div class="flex items-center gap-2 text-[11px] text-slate-500">
                  <span>Slug: {{ item.slug }}</span>
                  <span>·</span>
                  <span>ID: {{ item.id }}</span>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span
                  class="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold"
                  :class="item.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'"
                >
                  <CheckCircle2 v-if="item.is_active" class="h-4 w-4" />
                  <XCircle v-else class="h-4 w-4" />
                  {{ item.is_active ? 'Activo' : 'Vendido' }}
                </span>
                <div class="relative">
                  <button
                    class="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50"
                    @click.stop="toggleSubmissionMenu(item.id)"
                    aria-label="Acciones"
                  >
                    ⋮
                  </button>
                  <div
                    v-if="actionMenuId === item.id"
                    class="absolute right-0 top-11 z-10 w-44 rounded-xl border border-slate-200 bg-white py-1 text-sm shadow-lg"
                  >
                    <NuxtLink
                      :to="`/marketplace/productos/${item.slug || item.id}`"
                      class="block px-3 py-2 text-slate-700 hover:bg-slate-50"
                      @click="toggleSubmissionMenu(null)"
                    >
                      Ver detalle / editar
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </div>
            <p class="text-sm text-slate-600 line-clamp-2">{{ item.description || 'Sin descripción' }}</p>
            <p class="text-base font-bold" :class="item.offer_price ? 'text-red-600' : 'text-slate-900'">
              <span v-if="item.offer_price" class="mr-1 text-slate-400 line-through">${{ item.price }}</span>
              ${{ item.offer_price || item.price }}
            </p>
            <div class="flex flex-wrap gap-2">
              <button
                class="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:-translate-y-0.5 transition"
                :disabled="togglingId === item.id"
                @click="toggleSubmission(item)"
              >
                <Loader2 v-if="togglingId === item.id" class="h-4 w-4 animate-spin" />
                {{ item.is_active ? 'Marcar vendido (desactivar)' : 'Reactivar' }}
              </button>
            </div>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRuntimeConfig, navigateTo } from 'nuxt/app'
import { useThemeStore } from '~/stores/theme'
import { useAuthStore } from '~/stores/auth'
import { useCartStore } from '~/stores/cart'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-vue-next'

const theme = useThemeStore()
const auth = useAuthStore()
const cart = useCartStore()
const config = useRuntimeConfig()

const marketplaceAccent = '#f59e0b'
const amberFrom = '#92400e'
const amberTo = marketplaceAccent
const heroStyle = computed(() => ({ '--gradient-from': amberFrom, '--gradient-to': amberTo }))
const ctaStyle = computed(() => ({ backgroundColor: '#0f172a', color: '#fff' }))

const products = ref<any[]>([])
const loadingProducts = ref(true)
const productsError = ref('')
const productSearch = ref('')
const categoryFilter = ref('')
const sortOrder = ref('')

const submissions = ref<any[]>([])
const submissionsLoading = ref(false)
const submissionsError = ref('')
const submissionSaving = ref(false)
const togglingId = ref<number | null>(null)

const submissionForm = reactive({
  name: '',
  price: null as number | null,
  offer_price: null as number | null,
  description: '',
  image_url: '',
  is_active: true,
})

const submissionMessage = ref('')
const submissionMessageType = ref<'ok' | 'error'>('ok')
const showForm = ref(false)
const actionMenuId = ref<number | null>(null)

const soldSubmissions = computed(() => submissions.value.filter((s) => !s.is_active))
const activeSubmissions = computed(() => submissions.value.filter((s) => s.is_active))

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

const productsPreview = computed(() => filteredProducts.value.slice(0, 4))

const productImage = (product: any) => product?.images?.[0]?.image || 'https://via.placeholder.com/400x240?text=Producto'

const addToCart = async (product: any) => {
  if (!product) return
  cart.loadFromStorage()
  cart.setContext('marketplace')
  cart.addProduct(product)
  await navigateTo('/marketplace/carrito')
}

const authHeader = computed(() => ({ Authorization: `Bearer ${auth.token}` }))

const ensureFreshToken = async () => {
  if (!auth.token && auth.refreshToken) {
    await auth.refreshTokens()
  }
}

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

const toggleSubmissionMenu = (id: number | null) => {
  actionMenuId.value = actionMenuId.value === id ? null : id
}

const fetchSubmissions = async () => {
  await ensureFreshToken()
  if (!auth.token) return
  submissionsLoading.value = true
  submissionsError.value = ''
  try {
    submissions.value = await $fetch(`${config.public.apiBase}/marketplace/submissions/`, {
      headers: authHeader.value,
    })
  } catch (err: any) {
    const code = err?.response?._data?.code
    if (code === 'token_not_valid' && auth.refreshToken) {
      await auth.refreshTokens()
      try {
        submissions.value = await $fetch(`${config.public.apiBase}/marketplace/submissions/`, {
          headers: authHeader.value,
        })
        return
      } catch (e) {
        /* no-op */
      }
    }
    submissionsError.value = 'No pudimos cargar tus productos'
  } finally {
    submissionsLoading.value = false
  }
}

const resetSubmissionForm = () => {
  submissionForm.name = ''
  submissionForm.price = null
  submissionForm.offer_price = null
  submissionForm.description = ''
  submissionForm.image_url = ''
  submissionForm.is_active = true
}

const createSubmission = async () => {
  await ensureFreshToken()
  if (!auth.token) {
    await navigateTo('/login')
    return
  }
  submissionSaving.value = true
  submissionMessage.value = ''
  const payload: any = {
    name: submissionForm.name,
    price: submissionForm.price,
    description: submissionForm.description,
    is_active: submissionForm.is_active,
  }
  if (submissionForm.offer_price) payload.offer_price = submissionForm.offer_price
  if (submissionForm.image_url) payload.image_url = submissionForm.image_url

  try {
    const created = await $fetch(`${config.public.apiBase}/marketplace/submissions/`, {
      method: 'POST',
      body: payload,
      headers: authHeader.value,
    })
    submissions.value = [created, ...submissions.value]
    submissionMessage.value = 'Producto publicado en tu marketplace'
    submissionMessageType.value = 'ok'
    resetSubmissionForm()
  } catch (err: any) {
    const code = err?.response?._data?.code
    if (code === 'token_not_valid' && auth.refreshToken) {
      const refreshed = await auth.refreshTokens()
      if (refreshed) {
        try {
          const created = await $fetch(`${config.public.apiBase}/marketplace/submissions/`, {
            method: 'POST',
            body: payload,
            headers: authHeader.value,
          })
          submissions.value = [created, ...submissions.value]
          submissionMessage.value = 'Producto publicado en tu marketplace'
          submissionMessageType.value = 'ok'
          resetSubmissionForm()
          return
        } catch (e) {
          /* fall through to message */
        }
      }
    }
    submissionMessage.value = err?.response?._data?.detail || 'No pudimos publicar el producto'
    submissionMessageType.value = 'error'
  } finally {
    submissionSaving.value = false
  }
}

const toggleSubmission = async (item: any) => {
  if (!auth.token) {
    await navigateTo('/login')
    return
  }
  await ensureFreshToken()
  togglingId.value = item.id
  try {
    const updated = await $fetch(`${config.public.apiBase}/marketplace/submissions/${item.id}/`, {
      method: 'PATCH',
      body: { is_active: !item.is_active },
      headers: authHeader.value,
    })
    submissions.value = submissions.value.map((s) => (s.id === item.id ? updated : s))
  } catch (err: any) {
    const code = err?.response?._data?.code
    if (code === 'token_not_valid' && auth.refreshToken) {
      const refreshed = await auth.refreshTokens()
      if (refreshed) {
        try {
          const updated = await $fetch(`${config.public.apiBase}/marketplace/submissions/${item.id}/`, {
            method: 'PATCH',
            body: { is_active: !item.is_active },
            headers: authHeader.value,
          })
          submissions.value = submissions.value.map((s) => (s.id === item.id ? updated : s))
        } catch (e) {
          /* swallow */
        }
      }
    }
  } finally {
    togglingId.value = null
  }
}

onMounted(async () => {
  theme.loadFromStorage()
  theme.applyTheme()
  auth.restoreFromCookies()
  cart.loadFromStorage()
  cart.setContext('marketplace')
  await Promise.all([fetchProducts(), fetchSubmissions()])
})
</script>
