<template>
  <article
    class="group relative flex h-full flex-col rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    :class="[
      isMarketplace ? 'border-amber-200/70' : 'border-slate-300',
      highlightBuy ? 'border-rose-300/70 shadow-[0_12px_30px_-16px_rgba(244,63,94,0.55)] hover:shadow-[0_20px_36px_-14px_rgba(244,63,94,0.7)]' : '',
    ]"
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
      class="absolute right-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg font-semibold text-slate-700 shadow transition hover:bg-white"
      :class="hasDiscountRibbon ? 'top-12' : 'top-4'"
      @click.stop="toggleMenu"
      aria-label="Acciones"
    >
      ⋮
    </button>

    <button
      v-else
      type="button"
      class="absolute right-4 inline-flex h-9 w-9 items-center justify-center rounded-full border bg-white text-sm font-semibold text-slate-500 shadow transition hover:text-rose-500"
      :class="[hasDiscountRibbon ? 'top-12' : 'top-4', isFavorite ? 'border-rose-200 text-rose-600' : 'border-slate-200']"
      @click.stop="toggleFavorite"
      :aria-pressed="isFavorite"
      aria-label="Marcar producto como favorito"
    >
      <Heart class="h-4 w-4" :class="isFavorite ? 'fill-current text-rose-600' : 'text-slate-500'" />
    </button>

    <div
      v-if="hasDiscountRibbon"
      class="pointer-events-none absolute right-0 top-0 z-20 rounded-bl-xl bg-gradient-to-r from-rose-600 to-fuchsia-600 px-3 py-1.5 text-xs font-extrabold text-white shadow-lg"
    >
      <span class="inline-flex items-center gap-1">
        <Percent class="h-3.5 w-3.5" />
        -{{ discountPercent }}%
      </span>
    </div>

    <NuxtLink
      v-if="isMarketplace"
      :to="`/marketplace/productos/${product.slug}`"
      class="h-36 w-full overflow-hidden rounded-t-2xl bg-slate-100 relative block"
      style="text-decoration:none"
    >
      <img :src="imageSrc || '/logoPW.png'" :alt="product.name" class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" @error="onImgError($event)" />
    </NuxtLink>

    <NuxtLink
      v-else
      :to="productDetailPath"
      class="h-36 w-full overflow-hidden rounded-t-2xl bg-slate-100 relative block"
      style="text-decoration:none"
    >
      <img :src="imageSrc || '/logoPW.png'" :alt="product.name" class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" @error="onImgError($event)" />
    </NuxtLink>

    <!-- El bloque <script setup> debe ir fuera del template -->

    <div class="flex flex-1 flex-col p-3 space-y-2.5">
      <div class="flex items-center justify-between gap-2">
        <p class="text-xs uppercase tracking-wide font-semibold text-slate-500">
          {{ product.category?.name || 'General' }}
        </p>
        <NuxtLink
          v-if="showPublisherLabel && marketplacePublisherLink"
          :to="marketplacePublisherLink"
          class="rounded-full px-2 py-1 text-[11px] font-semibold shadow hover:opacity-85"
          :class="isMarketplace ? 'bg-slate-100 text-slate-500' : ''"
          :style="!isMarketplace ? `background:${accentColor}22;color:${accentColor}` : ''"
        >
          {{ marketplacePublisherLabel }}
        </NuxtLink>
        <span
          v-else-if="showPublisherLabel"
          class="rounded-full px-2 py-1 text-[11px] font-semibold shadow"
          :class="isMarketplace ? 'bg-slate-100 text-slate-500' : ''"
          :style="!isMarketplace ? `background:${accentColor}22;color:${accentColor}` : ''"
        >
          {{ marketplacePublisherLabel }}
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
        :style="isMarketplace ? 'color:#0f172a' : ''"
      >
        {{ product.name }}
      </h3>

      <div class="flex flex-wrap items-center gap-2">
        <span v-if="!hideStock" class="rounded-full px-3 py-1 text-[11px] font-semibold" :class="stockDescriptor.pill">
          {{ stockDescriptor.label }}
        </span>
        <span v-if="product.product_of_week" class="rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-800">Producto de la semana</span>
        <span v-if="product.free_shipping" class="rounded-full bg-sky-100 px-2 py-1 text-[11px] font-semibold text-sky-800">Envío gratis</span>
        <span v-else-if="isMarketplace" class="rounded-full px-2 py-1 text-[11px] font-semibold" :class="marketBadgeClass">Marketplace</span>
      </div>

      <p class="font-bold" :class="[product.offer_price ? 'text-red-600' : 'text-black', highlightBuy ? 'text-2xl leading-tight' : 'text-base']">
        <span v-if="product.offer_price" class="mr-1 text-slate-400 line-through">{{ formatClp(product.price) }}</span>
        {{ formatClp(effectivePrice) }}
      </p>

      <div class="mt-auto flex flex-wrap items-center justify-end gap-2">
        <button
          class="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-white shadow disabled:cursor-not-allowed disabled:opacity-60"
          :class="highlightBuy ? 'ring-2 ring-rose-200' : ''"
          :style="{ backgroundColor: accentColor }"
          :disabled="!canAddToCart"
          @click="handleAddToCart"
        >
          <ShoppingCart class="h-4 w-4" aria-hidden="true" />
          {{ highlightBuy ? 'Comprar ya' : 'Agregar' }}
        </button>

        <NuxtLink :to="productDetailPath" class="rounded-lg px-3 py-2 text-sm font-semibold text-white shadow" :style="{ backgroundColor: accentColor }">{{ highlightBuy ? 'Ver oferta' : 'Ver producto' }}</NuxtLink>
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
import { Heart, Percent, ShoppingCart } from 'lucide-vue-next'
import { useCartStore } from '~/stores/cart'
import { useThemeStore } from '~/stores/theme'
import { useRouter } from 'vue-router'
import { makeProductFavoriteKey, useFavorites } from '~/composables/useFavorites'

const props = defineProps<{ product: any; isMarketplace?: boolean; accent?: string; canManage?: boolean; onDelete?: Function; editUrl?: string; isMine?: boolean; hideStock?: boolean; highlightBuy?: boolean }>()

const product = props.product
const isMarketplace = computed(() => Boolean(props.isMarketplace))
const highlightBuy = computed(() => Boolean(props.highlightBuy))
const cart = useCartStore()
const theme = useThemeStore()
const router = useRouter()

const MARKET_ACCENT = '#f59e0b'
const accentColor = computed(() => (isMarketplace.value ? MARKET_ACCENT : props.accent || theme.accent || '#2563eb'))
const glowStyle = computed(() => ({ background: `radial-gradient(circle at 30% 20%, ${accentColor.value}1a, transparent 40%)` }))
const marketBadgeClass = computed(() => (isMarketplace.value ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-700'))
const imageSrc = computed(() => product?.image_url || product?.images?.[0]?.image || product?.image || '/logoPW.png')
const marketplacePublisherLabel = computed(() => {
  if (!isMarketplace.value) return product?.store?.slug || 'tienda'
  return (
    product?.submitted_by_name ||
    product?.submitted_by_username ||
    product?.seller_name ||
    product?.owner_name ||
    product?.store?.name ||
    product?.store?.slug ||
    'Vendedor'
  )
})
const marketplacePublisherLink = computed(() => {
  if (!isMarketplace.value) return ''
  const sellerId = Number(product?.submitted_by || product?.seller_id || product?.owner_id || 0)
  if (!Number.isFinite(sellerId) || sellerId <= 0) return ''
  return `/marketplace/vendedores/${sellerId}`
})
const showPublisherLabel = computed(() => !(isMarketplace.value && Boolean(props.isMine)))
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
const discountPercent = computed(() => {
  const price = Number(product?.price || 0)
  const offer = Number(product?.offer_price || 0)
  if (!price || !offer || offer >= price) return 0
  return Math.round(((price - offer) / price) * 100)
})
const discountBadge = computed(() => (discountPercent.value > 0 ? `${discountPercent.value}%` : ''))
const hasDiscountRibbon = computed(() => discountPercent.value > 0)
const effectivePrice = computed(() => {
  if (product?.offer_price && offerMinQty.value <= 1) {
    return Number(product.offer_price)
  }
  return Number(product?.price || 0)
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

// script setup exposes bindings directly to the template

</script>
