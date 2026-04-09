<template>
  <article
    class="group relative flex h-full flex-col rounded-2xl border border-slate-300 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    :style="{ overflow: 'hidden' }"
  >
    <!-- Glow overlay -->
    <!-- Detalle de color: barra vertical -->
    <div
      v-if="!isMarketplace"
      class="absolute left-0 top-0 h-full w-1.5 rounded-l-2xl"
      :style="{ background: accentColor, zIndex: 2 }"
      aria-hidden="true"
    />
    <div
      v-else
      class="absolute left-0 top-0 h-full w-1.5 rounded-l-2xl bg-amber-400"
      style="z-index:2;"
      aria-hidden="true"
    />

    <button
      v-if="canManage"
      type="button"
      class="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg font-semibold text-slate-700 shadow transition hover:bg-white"
      @click.stop="toggleMenu"
      aria-label="Acciones"
    >
      ⋮
    </button>

    <button
      v-else
      type="button"
      class="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border bg-white text-sm font-semibold text-slate-500 shadow transition hover:text-rose-500"
      :class="isFavorite ? 'border-rose-200 text-rose-600' : 'border-slate-200'"
      @click.stop="toggleFavorite"
      :aria-pressed="isFavorite"
      aria-label="Marcar producto como favorito"
    >
      <Heart class="h-4 w-4" :class="isFavorite ? 'fill-current text-rose-600' : 'text-slate-500'" />
    </button>

    <NuxtLink
      v-if="isMarketplace"
      :to="`/marketplace/productos/${product.slug}`"
      class="h-44 w-full overflow-hidden rounded-t-2xl bg-slate-100 relative block"
      style="text-decoration:none"
    >
      <img :src="imageSrc || '/logoPW.png'" :alt="product.name" class="h-full w-full object-cover" @error="onImgError($event)" />
    </NuxtLink>

    <NuxtLink
      v-else
      :to="productDetailPath"
      class="h-44 w-full overflow-hidden rounded-t-2xl bg-slate-100 relative block"
      style="text-decoration:none"
    >
      <img :src="imageSrc || '/logoPW.png'" :alt="product.name" class="h-full w-full object-cover" @error="onImgError($event)" />
    </NuxtLink>

    <!-- El bloque <script setup> debe ir fuera del template -->

    <div class="flex flex-1 flex-col p-4 space-y-3">
      <div class="flex items-center justify-between gap-2">
        <p class="text-xs uppercase tracking-wide font-semibold text-slate-500">
          {{ product.category?.name || 'General' }}
        </p>
        <span
          class="rounded-full px-2 py-1 text-[11px] font-semibold shadow"
          :class="isMarketplace ? 'bg-amber-100 text-amber-800' : ''"
          :style="!isMarketplace ? `background:${accentColor}22;color:${accentColor}` : ''"
        >
          {{ product.store?.slug || 'tienda' }}
        </span>
        <span
          v-if="isMarketplace && props.isMine"
          class="rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-800 shadow"
        >
          Tu publicación
        </span>
      </div>

      <h3
        class="text-lg font-bold group-hover:text-slate-700 line-clamp-1"
        :style="isMarketplace ? 'color:#f59e0b' : ''"
      >
        {{ product.name }}
      </h3>
      <p class="text-sm text-slate-600 line-clamp-2">{{ product.description }}</p>

      <div class="flex flex-wrap items-center gap-2">
        <span v-if="product.product_of_week" class="rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-800">Producto de la semana</span>
        <span v-else-if="product.offer_price" class="rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-800">Oferta</span>
        <span v-if="product.offer_price && offerMinQty > 1" class="rounded-full bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700">Desde {{ offerMinQty }} unidades</span>
        <span v-else-if="isMarketplace" class="rounded-full px-2 py-1 text-[11px] font-semibold" :class="marketBadgeClass">Marketplace</span>
          <div v-if="!hideStock" class="flex flex-wrap items-center gap-2 text-sm font-semibold" :class="stockDescriptor.tone">
            <span class="rounded-full px-3 py-1" :class="stockDescriptor.pill">
              {{ stockDescriptor.label }}
            </span>
          </div>
      </div>

      <p class="text-base font-bold" :class="product.offer_price ? 'text-red-600' : 'text-black'">
        <span v-if="product.offer_price" class="mr-1 text-slate-400 line-through">{{ formatClp(product.price) }}</span>
        {{ formatClp(effectivePrice) }}
      </p>

      <div class="mt-auto flex flex-wrap items-center justify-end gap-2">
        <button
          class="rounded-lg px-3 py-2 text-sm font-semibold text-white shadow disabled:cursor-not-allowed disabled:opacity-60"
          :style="{ backgroundColor: accentColor }"
          :disabled="!canAddToCart"
          @click="handleAddToCart"
        >
          {{ addToCartLabel }}
        </button>

        <NuxtLink :to="productDetailPath" class="rounded-lg px-3 py-2 text-sm font-semibold text-white shadow" :style="{ backgroundColor: accentColor }">Ver producto</NuxtLink>

        <NuxtLink v-if="product.store?.slug && !product.store_is_marketplace" :to="storePath" class="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900">Ver tienda</NuxtLink>
      </div>
    </div>
    <div v-if="canManage && menuOpen" class="absolute right-4 top-14 z-10 w-40 rounded-xl border border-slate-200 bg-white py-1 text-sm shadow-lg" @click.stop>
      <a v-if="editUrl" :href="editUrl" class="block px-3 py-2 text-slate-700 hover:bg-slate-50">Editar</a>
      <button class="block w-full px-3 py-2 text-left text-red-600 hover:bg-slate-50" @click="handleDelete">Eliminar</button>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Heart } from 'lucide-vue-next'
import { useCartStore } from '~/stores/cart'
import { useThemeStore } from '~/stores/theme'
import { useRouter } from 'vue-router'
import { makeProductFavoriteKey, useFavorites } from '~/composables/useFavorites'

const props = defineProps<{ product: any; isMarketplace?: boolean; accent?: string; canManage?: boolean; onDelete?: Function; editUrl?: string; isMine?: boolean; hideStock?: boolean }>()

const product = props.product
const isMarketplace = computed(() => Boolean(props.isMarketplace))
const cart = useCartStore()
const theme = useThemeStore()
const router = useRouter()

const MARKET_ACCENT = '#f59e0b'
const accentColor = computed(() => (isMarketplace.value ? MARKET_ACCENT : props.accent || theme.accent || '#2563eb'))
const glowStyle = computed(() => ({ background: `radial-gradient(circle at 30% 20%, ${accentColor.value}1a, transparent 40%)` }))
const marketBadgeClass = computed(() => (isMarketplace.value ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'))
const imageSrc = computed(() => product?.images?.[0]?.image || product?.image || '/logoPW.png')
const onImgError = (event: Event) => {
  const target = event.target as HTMLImageElement | null
  if (!target) return
  target.onerror = null
  target.src = '/logoPW.png'
}
const availableStock = computed(() => {
  const raw = Number(product?.stock_available ?? 0)
  return Number.isFinite(raw) ? raw : 0
})
const canAddToCart = computed(() => availableStock.value > 0)
const describeStock = (value: number) => {
  if (value <= 0) return { label: 'Sin stock', tone: 'text-red-600', pill: 'bg-red-50 text-red-700' }
  if (value <= 5) return { label: `Últimas ${value}`, tone: 'text-amber-600', pill: 'bg-amber-50 text-amber-700' }
  return { label: `${value} disponibles`, tone: 'text-emerald-600', pill: 'bg-emerald-50 text-emerald-700' }
}
const stockDescriptor = computed(() => describeStock(availableStock.value))
const hideStock = computed(() => Boolean(props.hideStock))
const offerMinQty = computed(() => Math.max(1, Number(product?.offer_min_qty || 1)))
const effectivePrice = computed(() => {
  if (product?.offer_price && offerMinQty.value <= 1) {
    return Number(product.offer_price)
  }
  return Number(product?.price || 0)
})
const addToCartLabel = computed(() => {
  if (!canAddToCart.value) return 'Sin stock'
  return isMarketplace.value ? 'Agregar al carrito' : 'Agregar'
})
const formatClp = (value: number | string) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Number(value) || 0)

const { isProductFavoriteKey, toggleProductFavoriteKey } = useFavorites()
const productFavoriteKey = (p: any) => makeProductFavoriteKey(p?.store?.slug, p?.slug || p?.id)
const isFavorite = computed(() => isProductFavoriteKey(productFavoriteKey(product)))
const toggleFavorite = () => toggleProductFavoriteKey(productFavoriteKey(product))

const menuOpen = ref(false)
const canManage = computed(() => Boolean(props.canManage))
const editUrl = computed(() => {
  if (props.editUrl) return props.editUrl
  if (product?.store?.slug && !isMarketplace.value) return `/store/${product.store.slug}/productos/${product.slug}`
  return product?.slug ? `/marketplace/productos/${product.slug}` : ''
})
const handleDelete = async () => {
  if (typeof props.onDelete === 'function') {
    await props.onDelete(product)
  } else if (confirm('¿Eliminar este producto?')) {
    // fallback: try to call an endpoint if no handler provided (best-effort)
    try {
      // no-op here; prefer parent to provide onDelete
    } catch (e) {
      console.error('delete fallback failed', e)
    }
  }
  menuOpen.value = false
}
const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const handleAddToCart = async () => {
  if (!canAddToCart.value) return
  try {
    cart.setContext(isMarketplace.value ? 'marketplace' : product.store?.slug || 'marketplace')
    cart.addProduct(product)
    if (isMarketplace.value) await router.push('/marketplace/carrito')
  } catch (e) {
    console.error('addToCart error', e)
  }
}

const productDetailPath = computed(() => {
  const id = product?.slug || product?.id
  if (!id) return '/marketplace'
  if (product?.store?.slug && !product?.store_is_marketplace) return `/store/${product.store.slug}/productos/${id}`
  return `/marketplace/productos/${id}`
})

const storePath = computed(() => (product?.store?.slug ? `/store/${product.store.slug}` : '/tiendas'))

// script setup exposes bindings directly to the template

</script>
