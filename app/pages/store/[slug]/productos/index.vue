<template>
  <div class="bg-slate-50 px-4 py-10">
    <div class="mx-auto max-w-6xl space-y-6">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-xs uppercase tracking-[0.25em] text-slate-500">Catálogo</p>
          <h1 class="text-3xl font-bold text-slate-900">Todos los productos</h1>
          <p class="text-slate-600">Explora y añade al carrito con un clic.</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <NuxtLink :to="`/store/${slug}/carrito`" class="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-white shadow" :style="accentStyle">
            <ShoppingCart class="h-4 w-4" aria-hidden="true" />
            Carrito
          </NuxtLink>
          <NuxtLink
            v-if="auth.isAuthenticated"
            :to="`/store/${slug}/admin/productos/nuevo`"
            class="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 hover:border-slate-300"
          >
            + Agregar producto
          </NuxtLink>
            <select
              v-if="tenantStore.categories.length"
              v-model="selectedCategory"
              class="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
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
                class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
              />
            </div>
        </div>
      </div>

      <div v-if="tenantStore.loading" class="text-slate-500">Cargando productos...</div>
      <div v-else-if="!filteredProducts.length" class="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-slate-600">
        {{ tenantStore.productos.length ? 'No encontramos productos con los filtros aplicados.' : 'No hay productos para esta tienda todavía.' }}
      </div>
      <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <ProductCard
          v-for="product in filteredProducts"
          :key="product.id"
          :product="product"
          :accent="accentColor"
          :canManage="canManageStore"
          :onDelete="deleteProduct"
        />
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
const canManageStore = computed(() => {
  const memberships = (auth.user as any)?.memberships || []
  return memberships.some((m: any) => m?.store?.slug === slug && (m.roles || []).some((r: string) => r?.toLowerCase?.() === 'admin'))
})

const accentColor = computed(() => theme.accent || '#2563eb')
const accentStyle = computed(() => ({ backgroundColor: accentColor.value, color: '#fff' }))
const storeGlowStyle = computed(() => ({ background: `radial-gradient(circle at 30% 20%, ${accentColor.value}1a, transparent 40%)` }))
const filteredProducts = computed(() => {
  const term = searchQuery.value.trim().toLowerCase()
  if (!term) return tenantStore.productos
  return (tenantStore.productos || []).filter((product: any) => matchesSearch(product, term))
})

onMounted(async () => {
  auth.restoreFromCookies()
  theme.loadFromStorage()
  theme.applyStoreTheme(slug)
  tenantStore.setSlug(slug)
  await tenantStore.fetchCategories()
  await tenantStore.fetchProductos()
})

// admin menu handled inside ProductCard

const deleteProduct = async (product: any) => {
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
    const params: Record<string, any> = {}
    if (slugCat) params.category = slugCat
    await tenantStore.fetchProductos(params)
  }
)

// no-op: ProductCard handles its own menus
</script>
