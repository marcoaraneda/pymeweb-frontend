<template>
  <div class="min-h-screen bg-slate-50 px-4 py-10">
    <div class="mx-auto max-w-5xl space-y-6">
      <NuxtLink to="/marketplace#productos" class="text-sm font-semibold text-slate-700 hover:text-slate-900">← Volver</NuxtLink>

      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div v-if="loading" class="text-slate-500">Cargando producto...</div>
        <div v-else-if="error" class="text-red-600">{{ error }}</div>
        <div v-else-if="!product" class="text-slate-600">Producto no encontrado.</div>
        <div v-else class="grid gap-6 md:grid-cols-[1.3fr,1fr] md:items-start">
          <div class="space-y-3">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-500">{{ product.category?.name || 'General' }}</p>
            <h1 class="text-2xl font-bold text-slate-900">{{ product.name }}</h1>
            <p class="text-sm text-slate-600 whitespace-pre-line">{{ product.description }}</p>
            <div class="flex flex-wrap items-center gap-2">
              <span v-if="product.product_of_week" class="rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-800">Producto de la semana</span>
              <span v-else-if="product.offer_price" class="rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-800">Oferta</span>
              <span class="rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-900">Marketplace</span>
            </div>
            <p class="text-2xl font-bold" :class="product.offer_price ? 'text-red-600' : 'text-slate-900'">
              <span v-if="product.offer_price" class="mr-2 text-lg text-slate-400 line-through">${{ product.price }}</span>
              ${{ product.offer_price || product.price }}
            </p>
            <div class="flex flex-wrap gap-3 text-xs text-slate-500">
              <span v-if="product.submitted_by_name">Vendedor: {{ product.submitted_by_name }}</span>
              <span>ID: {{ product.id }}</span>
            </div>
          </div>

          <div class="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div class="aspect-[4/3] overflow-hidden rounded-lg bg-white">
              <img :src="productImage" :alt="product.name" class="h-full w-full object-cover" />
            </div>
            <NuxtLink
              v-if="product.store?.slug && !product.store_is_marketplace"
              :to="`/store/${product.store.slug}/productos/${product.slug}`"
              class="block w-full rounded-xl px-4 py-3 text-center text-sm font-semibold text-white shadow"
              :style="accentStyle"
            >
              Ver en tienda
            </NuxtLink>
            <button
              class="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white shadow"
              :style="accentStyle"
              @click="handleAddToCart"
            >
              Agregar al carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
// @ts-expect-error suppress deep route type inference in Nuxt
import { useRoute } from 'vue-router'
import { useRuntimeConfig } from 'nuxt/app'
import { definePageMeta } from '#imports'
import { useCartStore } from '~/stores/cart'
import { useTenantStore } from '~/stores/tenant'
import { useThemeStore } from '~/stores/theme'
import { useImages } from '~/composables/useImages'

definePageMeta({ layout: 'default' })

const route = useRoute()
const idParam = route.params.id as string
const config = useRuntimeConfig()
const cart = useCartStore()
const tenantStore = useTenantStore()
const theme = useThemeStore()
const { getProductImage } = useImages()

const product = ref<any | null>(null)
const loading = ref(true)
const error = ref('')

const accentStyle = computed(() => ({ backgroundColor: theme.accent || '#2563eb', color: '#fff' }))
const productImage = computed(() => getProductImage(product.value))

const loadProduct = async () => {
  loading.value = true
  error.value = ''
  try {
    const data = await $fetch<any>(`${config.public.apiBase}/marketplace/products/${encodeURIComponent(idParam)}/`)
    product.value = data
    if (data?.store?.slug) {
      tenantStore.setSlug(data.store.slug)
      theme.applyStoreTheme(data.store.slug)
    } else {
      theme.loadFromStorage()
      theme.applyTheme()
    }
  } catch (err: any) {
    error.value = err?.response?._data || 'Producto no encontrado'
    product.value = null
  } finally {
    loading.value = false
  }
}

const handleAddToCart = () => {
  if (!product.value) return
  cart.addProduct(product.value)
}

onMounted(async () => {
  theme.loadFromStorage()
  await loadProduct()
})
</script>
