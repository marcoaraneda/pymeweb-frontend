<!-- Eliminado: función fuera de <script setup> -->
<template>
  <div class="min-h-screen bg-slate-50 px-4 py-10">
    <div class="mx-auto max-w-5xl space-y-6">
      <NuxtLink :to="`/store/${slug}/productos`" class="text-sm font-semibold text-slate-700 hover:text-slate-900">← Volver</NuxtLink>

      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div v-if="loading" class="text-slate-500">Cargando producto...</div>
        <div v-else-if="error" class="text-red-600">{{ error }}</div>
        <div v-else-if="!product" class="text-slate-600">Producto no encontrado.</div>
        <div v-else class="grid gap-6 md:grid-cols-[1.3fr,1fr] md:items-start">
          <div class="space-y-3">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-500">{{ product.category?.name || 'General' }}</p>
            <h1 class="text-2xl font-bold text-slate-900">{{ product.name }}</h1>
            <p class="text-sm text-slate-600 whitespace-pre-line">{{ product.description }}</p>
            <div class="flex flex-wrap gap-2 text-xs text-slate-500">
              <span v-if="product.sku">SKU: {{ product.sku }}</span>
              <span v-if="product.stock_available !== undefined">Stock: {{ product.stock_available }}</span>
            </div>
          </div>
          <div class="space-y-4">
            <div class="h-64 w-full overflow-hidden rounded-xl bg-slate-100">
              <img :src="product.images?.[0]?.image || '/assets/img/placeholder-product.svg'" :alt="product.name" class="h-full w-full object-cover" @error="onImgError" />
            </div>
            <!-- Eliminado bloque <script setup> inválido dentro del template -->
            <div class="flex items-center gap-4">
              <span class="text-2xl font-bold text-amber-700">${{ product.price }}</span>
              <button class="rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700" @click="addToCart">Agregar al carrito</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useRuntimeConfig } from 'nuxt/app'
import { useCartStore } from '~/stores/cart'

const route = useRoute()
const config = useRuntimeConfig()
const cart = useCartStore()
const slug = route.params.slug
const product = ref<any>(null)
const loading = ref(true)
const error = ref('')
const placeholder = 'https://via.placeholder.com/400x300?text=Producto'

function onImgError(e: Event) {
  const target = e.target as HTMLImageElement
  if (target) target.src = '/assets/img/placeholder-product.svg'
}

const fetchProduct = async () => {
  loading.value = true
  error.value = ''
  try {
    product.value = await $fetch(`${config.public.apiBase}/stores/${route.params.slug}/products/${route.query.id}/`)
  } catch (e: any) {
    error.value = e?.data?.detail || e?.message || 'No se pudo cargar el producto.'
  } finally {
    loading.value = false
  }
}

const addToCart = () => {
  if (product.value) {
    cart.addProduct(product.value)
  }
}

onMounted(fetchProduct)
</script>
