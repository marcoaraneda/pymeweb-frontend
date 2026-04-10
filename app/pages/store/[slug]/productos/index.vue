<template>
  <div class="px-4 py-10" :class="pageShellClass">
    <div class="mx-auto max-w-6xl space-y-6">
      <section class="relative overflow-hidden rounded-3xl border p-5 shadow-sm md:p-6" :class="catalogHeroClass">
        <div class="absolute inset-0 opacity-80" :style="heroPatternStyle" aria-hidden="true" />
        <div class="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p class="inline-flex items-center rounded-full border px-3 py-1 text-xs uppercase tracking-[0.22em]" :class="catalogBadgeClass">{{ catalogBadgeLabel }}</p>
            <h1 class="mt-2 text-3xl font-bold text-slate-900">{{ catalogHeaderTitle }}</h1>
            <p class="text-slate-700">{{ catalogHeaderSubtitle }}</p>
            <div class="mt-3 flex flex-wrap gap-2 text-xs text-slate-700">
              <span class="rounded-full border border-slate-300/80 bg-white/70 px-3 py-1">{{ catalogChipOne }}</span>
              <span class="rounded-full border border-slate-300/80 bg-white/70 px-3 py-1">{{ catalogChipTwo }}</span>
            </div>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <NuxtLink :to="`/store/${slug}/carrito`" class="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-white shadow" :style="accentStyle">
              <ShoppingCart class="h-4 w-4" aria-hidden="true" />
              Carrito
            </NuxtLink>
            <NuxtLink
              v-if="isStoreOwner"
              :to="`/store/${slug}/productos/crear`"
              class="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-800 hover:border-slate-300"
            >
              + Agregar producto
            </NuxtLink>
              <select
                v-if="tenantStore.categories.length"
                v-model="selectedCategory"
                class="rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-700"
              >
                <option value="">Todas las categorías</option>
                <option v-for="cat in tenantStore.categories" :key="cat.slug" :value="cat.slug">{{ cat.name }}</option>
              </select>
              <div class="w-full sm:w-64">
                <label class="sr-only" for="catalog-search">Buscar producto</label>
                <input
                  id="catalog-search"
                  v-model="searchQuery"
                  type="search"
                  placeholder="Buscar producto o categoría..."
                  class="w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
                />
              </div>
          </div>
        </div>
      </section>

      <div v-if="tenantStore.loading" class="text-slate-500">Cargando productos...</div>
      <div v-else-if="!filteredProducts.length" class="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-slate-600">
        {{ tenantStore.productos.length ? 'No encontramos productos con los filtros aplicados.' : 'No hay productos para esta tienda todavía.' }}
      </div>
      <div v-else class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <ProductCard
          v-for="product in paginatedProducts"
          :key="product.id"
          :product="product"
          :accent="accentColor"
          :canManage="isStoreOwner"
          :onDelete="deleteProduct"
          :editUrl="productDetailPath(product)"
        />
      </div>

      <div v-if="filteredProducts.length > perPage" class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
        <button
          class="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold hover:bg-slate-50 disabled:opacity-40"
          :disabled="page === 1"
          @click="page -= 1"
        >
          Anterior
        </button>
        <p>Mostrando {{ pageStart }}-{{ pageEnd }} de {{ filteredProducts.length }}</p>
        <button
          class="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold hover:bg-slate-50 disabled:opacity-40"
          :disabled="page === totalPages"
          @click="page += 1"
        >
          Siguiente
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useRuntimeConfig } from 'nuxt/app'
import { definePageMeta } from '#imports'
import { useTenantStore } from '~/stores/tenant'
import { useCartStore } from '~/stores/cart'
import { useImages } from '~/composables/useImages'
import { useThemeStore } from '~/stores/theme'
import { useAuthStore } from '~/stores/auth'
import { ShoppingCart } from 'lucide-vue-next'

definePageMeta({ layout: 'store' })

const route = useRoute()
const slug = route.params.slug as string
const config = useRuntimeConfig()

const tenantStore = useTenantStore()
const cart = useCartStore()
const theme = useThemeStore()
const auth = useAuthStore()
const { getProductImage } = useImages()

const selectedCategory = ref('')
const searchQuery = ref('')
const page = ref(1)
const perPage = 12
const isStoreOwner = computed(() => {
  const memberships = (auth.user as any)?.memberships || []
  return memberships.some((m: any) => {
    const storeSlug = m?.store?.slug
    const roles = (m?.roles || []).map((r: any) => r?.code || r)?.map((r: string) => r?.toLowerCase?.())
    return storeSlug === slug && roles.some((r: string) => ['admin', 'owner', 'manager'].includes(r))
  })
})

const productDetailPath = (product: any) => (product?.slug ? `/store/${slug}/productos/${product.slug}` : `/store/${slug}/productos`)

const accentColor = computed(() => theme.accent || '#2563eb')
const accentStyle = computed(() => ({ backgroundColor: accentColor.value, color: '#fff' }))
const storeType = computed(() => String((tenantStore.data as any)?.store_type || 'retail'))
const typeTheme = computed(() => {
  const byType: Record<string, { shellClass: string; heroClass: string; pattern: string; badgeLabel: string; badgeClass: string; title: string; subtitle: string; chipOne: string; chipTwo: string }> = {
    retail: {
      shellClass: 'bg-slate-50',
      heroClass: 'border-slate-200 bg-white',
      pattern: 'radial-gradient(circle at 80% 20%, rgba(148,163,184,0.16), transparent 40%)',
      badgeLabel: 'Catálogo retail',
      badgeClass: 'border-slate-300 bg-slate-100 text-slate-700',
      title: 'Todos los productos',
      subtitle: 'Explora y añade al carrito con un clic.',
      chipOne: 'Compara precios rápido',
      chipTwo: 'Compra por categoría',
    },
    fast_food: {
      shellClass: 'bg-amber-50/40',
      heroClass: 'border-amber-200 bg-gradient-to-r from-amber-100 to-orange-50',
      pattern: 'repeating-linear-gradient(135deg, rgba(234,88,12,0.12) 0px, rgba(234,88,12,0.12) 8px, transparent 8px, transparent 16px)',
      badgeLabel: 'Menú rápido',
      badgeClass: 'border-amber-300 bg-amber-200/70 text-amber-900',
      title: 'Pide tu menú en minutos',
      subtitle: 'Combos y secciones optimizadas para decisión rápida.',
      chipOne: 'Combos del día',
      chipTwo: 'Entrega express',
    },
    bakery: {
      shellClass: 'bg-rose-50/40',
      heroClass: 'border-rose-200 bg-gradient-to-r from-rose-100 to-pink-50',
      pattern: 'radial-gradient(circle at 15% 25%, rgba(251,113,133,0.15), transparent 35%), radial-gradient(circle at 80% 60%, rgba(251,191,36,0.12), transparent 40%)',
      badgeLabel: 'Vitrina dulce',
      badgeClass: 'border-rose-300 bg-rose-200/70 text-rose-900',
      title: 'Recién horneado para hoy',
      subtitle: 'Pasteles, tortas y panadería presentados por especialidad.',
      chipOne: 'Pedidos por encargo',
      chipTwo: 'Especialidades del día',
    },
    pharmacy: {
      shellClass: 'bg-cyan-50/35',
      heroClass: 'border-cyan-200 bg-gradient-to-r from-cyan-100 to-sky-50',
      pattern: 'linear-gradient(90deg, rgba(6,182,212,0.12) 1px, transparent 1px), linear-gradient(180deg, rgba(6,182,212,0.08) 1px, transparent 1px)',
      badgeLabel: 'Salud y bienestar',
      badgeClass: 'border-cyan-300 bg-cyan-200/70 text-cyan-900',
      title: 'Catálogo por necesidad',
      subtitle: 'Encuentra productos esenciales con navegación clara y confiable.',
      chipOne: 'Compra segura',
      chipTwo: 'Asistencia rápida',
    },
    fashion: {
      shellClass: 'bg-fuchsia-50/35',
      heroClass: 'border-fuchsia-200 bg-gradient-to-r from-fuchsia-100 to-purple-50',
      pattern: 'repeating-linear-gradient(120deg, rgba(168,85,247,0.12) 0px, rgba(168,85,247,0.12) 6px, transparent 6px, transparent 16px)',
      badgeLabel: 'Colección de moda',
      badgeClass: 'border-fuchsia-300 bg-fuchsia-200/70 text-fuchsia-900',
      title: 'Looks y tendencias',
      subtitle: 'Navega por líneas con foco visual en marca y estilo.',
      chipOne: 'Nuevos ingresos',
      chipTwo: 'Ediciones limitadas',
    },
    bookstore: {
      shellClass: 'bg-indigo-50/35',
      heroClass: 'border-indigo-200 bg-gradient-to-r from-indigo-100 to-blue-50',
      pattern: 'repeating-linear-gradient(0deg, rgba(99,102,241,0.11) 0px, rgba(99,102,241,0.11) 2px, transparent 2px, transparent 14px)',
      badgeLabel: 'Estantería digital',
      badgeClass: 'border-indigo-300 bg-indigo-200/70 text-indigo-900',
      title: 'Explora por género',
      subtitle: 'Descubre títulos y editoriales en una vitrina ordenada.',
      chipOne: 'Curado editorial',
      chipTwo: 'Recomendados semanales',
    },
  }
  return byType[storeType.value] || byType.retail
})
const pageShellClass = computed(() => typeTheme.value.shellClass)
const catalogHeroClass = computed(() => typeTheme.value.heroClass)
const heroPatternStyle = computed(() => ({ backgroundImage: typeTheme.value.pattern }))
const catalogBadgeLabel = computed(() => typeTheme.value.badgeLabel)
const catalogBadgeClass = computed(() => typeTheme.value.badgeClass)
const catalogHeaderTitle = computed(() => typeTheme.value.title)
const catalogHeaderSubtitle = computed(() => typeTheme.value.subtitle)
const catalogChipOne = computed(() => typeTheme.value.chipOne)
const catalogChipTwo = computed(() => typeTheme.value.chipTwo)
const filteredProducts = computed(() => {
  const term = searchQuery.value.trim().toLowerCase()
  if (!term) return tenantStore.productos
  return (tenantStore.productos || []).filter((product: any) => matchesSearch(product, term))
})
const totalPages = computed(() => Math.max(1, Math.ceil(filteredProducts.value.length / perPage)))
const paginatedProducts = computed(() => {
  const start = (page.value - 1) * perPage
  return filteredProducts.value.slice(start, start + perPage)
})
const pageStart = computed(() => (filteredProducts.value.length ? (page.value - 1) * perPage + 1 : 0))
const pageEnd = computed(() => Math.min(page.value * perPage, filteredProducts.value.length))

onMounted(async () => {
  auth.restoreFromCookies()
  theme.loadFromStorage()
  theme.applyStoreTheme(slug)
  tenantStore.setSlug(slug)
  await tenantStore.fetchTienda()
  await tenantStore.fetchCategories()
  await tenantStore.fetchProductos()
})

// admin menu handled inside ProductCard

const deleteProduct = async (product: any) => {
  if (!isStoreOwner.value) {
    window.alert('Solo el dueño puede eliminar productos')
    return
  }
  if (!auth.token || !product?.id) {
    window.alert('Inicia sesión para eliminar productos')
    return
  }
  const confirmed = window.confirm('¿Eliminar este producto?')
  if (!confirmed) return
  const doDelete = async () =>
    $fetch(`${config.public.apiBase}/store/${slug}/admin/catalogo/products/${product.id}/`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${auth.token}` },
    })

  try {
    await doDelete()
    // ProductCard will close its menu; refresh list
    await tenantStore.fetchProductos()
  } catch (error: any) {
    const code = error?.response?._data?.code
    if (code === 'token_not_valid' && auth.refreshToken) {
      const refreshed = await auth.refreshTokens()
      if (refreshed) {
        try {
          await doDelete()
          await tenantStore.fetchProductos()
          return
        } catch (e) {
          console.error('Reintento de eliminación falló', e)
        }
      }
    }

    console.error('No pudimos eliminar el producto', error)
    window.alert('No pudimos eliminar el producto')
  }
}

const matchesSearch = (product: any, term: string) => {
  if (!term) return true
  const fields = [product?.name, product?.description, product?.category?.name, product?.slug]
  return fields.some((value) => {
    const text = value?.toString?.()
    return text ? text.toLowerCase().includes(term) : false
  })
}

const normalizeStock = (value: any) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const formatStockLabel = (value: any) => {
  const stock = normalizeStock(value)
  if (stock <= 0) return 'Sin stock'
  if (stock <= 5) return `Stock bajo (${stock})`
  return `${stock} en inventario`
}

const formatStockClass = (value: any) => {
  const stock = normalizeStock(value)
  if (stock <= 0) return 'text-red-600'
  if (stock <= 5) return 'text-amber-600'
  return 'text-emerald-600'
}

watch(
  () => selectedCategory.value,
  async (slugCat) => {
    page.value = 1
    const params: Record<string, any> = {}
    if (slugCat) params.category = slugCat
    await tenantStore.fetchProductos(params)
  }
)

watch(searchQuery, () => {
  page.value = 1
})

watch(filteredProducts, () => {
  if (page.value > totalPages.value) page.value = totalPages.value
})

// no-op: ProductCard handles its own menus
</script>
