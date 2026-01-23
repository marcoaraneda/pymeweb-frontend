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
          <NuxtLink :to="`/store/${slug}/carrito`" class="rounded-xl px-3 py-2 text-sm font-semibold text-white shadow" :style="accentStyle">
            🛒
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
        </div>
      </div>

      <div v-if="tenantStore.loading" class="text-slate-500">Cargando productos...</div>
      <div v-else-if="!tenantStore.productos.length" class="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-slate-600">
        No hay productos para esta tienda todavía.
      </div>
      <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="product in tenantStore.productos"
          :key="product.id"
          class="relative group flex h-full flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
          <div class="relative h-44 w-full overflow-hidden rounded-t-2xl bg-slate-100">
            <img :src="getProductImage(product)" :alt="product.name" class="h-full w-full object-cover" />
            <div v-if="canManageStore" class="absolute right-3 top-3">
              <button
                class="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-700 text-lg shadow hover:bg-white"
                @click.stop="toggleMenu(product.id)"
                aria-label="Acciones"
              >
                ⋮
              </button>
              <div
                v-if="actionMenu === product.id"
                class="absolute right-0 top-11 z-10 w-40 rounded-xl border border-slate-200 bg-white py-1 text-sm shadow-lg"
                @click.stop
              >
                <NuxtLink
                  :to="`/store/${slug}/admin/productos/${product.slug}/editar`"
                  class="block px-3 py-2 text-slate-700 hover:bg-slate-50"
                >
                  Editar
                </NuxtLink>
                <button
                  class="block w-full px-3 py-2 text-left text-red-600 hover:bg-slate-50"
                  @click="deleteProduct(product)"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
          <div class="flex flex-1 flex-col p-4 space-y-3">
            <p class="text-xs uppercase text-slate-500">{{ product.category?.name || 'General' }}</p>
            <h2 class="text-lg font-semibold text-slate-900 group-hover:text-slate-700">{{ product.name }}</h2>
            <p class="text-sm text-slate-600 line-clamp-2">{{ product.description }}</p>

            <div class="flex flex-wrap items-center gap-2">
              <span v-if="product.product_of_week" class="rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-800">Producto de la semana</span>
              <span v-else-if="product.offer_price" class="rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-800">Oferta</span>
              <span v-if="product.is_marketplace" class="rounded-full bg-blue-100 px-2 py-1 text-[11px] font-semibold text-blue-800">Marketplace</span>
            </div>

            <p class="text-base font-bold" :style="{ color: accentColor }">
              <span v-if="product.offer_price" class="mr-1 text-slate-400 line-through">${{ product.price }}</span>
              ${{ product.offer_price || product.price }}
            </p>

            <div class="mt-auto flex flex-wrap items-center justify-end gap-2">
              <button
                class="rounded-lg px-3 py-2 text-sm font-semibold text-white shadow min-w-[110px]"
                :style="accentStyle"
                @click="cart.addProduct(product)"
              >
                Agregar
              </button>
              <NuxtLink
                :to="`/store/${slug}/productos/${product.slug}`"
                class="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900"
              >
                Ver producto
              </NuxtLink>
            </div>
          </div>
        </article>
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

definePageMeta({ layout: 'store' })

const route = useRoute()
const slug = route.params.slug as string
const config = useRuntimeConfig()

const tenantStore = useTenantStore()
const cart = useCartStore()
const theme = useThemeStore()
const auth = useAuthStore()
const { getProductImage } = useImages()

const actionMenu = ref<number | null>(null)
const selectedCategory = ref('')
const canManageStore = computed(() => {
  const memberships = (auth.user as any)?.memberships || []
  return memberships.some((m: any) => m?.store?.slug === slug && (m.roles || []).some((r: string) => r?.toLowerCase?.() === 'admin'))
})

const accentColor = computed(() => theme.accent || '#2563eb')
const accentStyle = computed(() => ({ backgroundColor: accentColor.value, color: '#fff' }))

onMounted(async () => {
  auth.restoreFromCookies()
  theme.loadFromStorage()
  theme.applyStoreTheme(slug)
  tenantStore.setSlug(slug)
  await tenantStore.fetchCategories()
  await tenantStore.fetchProductos()
  document.addEventListener('click', handleOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutside)
})

const toggleMenu = (id: number) => {
  actionMenu.value = actionMenu.value === id ? null : id
}

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
    actionMenu.value = null
    await tenantStore.fetchProductos()
  } catch (error: any) {
    const code = error?.response?._data?.code
    if (code === 'token_not_valid' && auth.refreshToken) {
      const refreshed = await auth.refreshTokens()
      if (refreshed) {
        try {
          await doDelete()
          actionMenu.value = null
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

watch(
  () => selectedCategory.value,
  async (slugCat) => {
    const params: Record<string, any> = {}
    if (slugCat) params.category = slugCat
    await tenantStore.fetchProductos(params)
  }
)

const handleOutside = () => {
  if (actionMenu.value !== null) {
    actionMenu.value = null
  }
}
</script>
