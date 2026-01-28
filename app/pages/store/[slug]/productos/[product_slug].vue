<template>
  <div v-if="product" class="mx-auto max-w-5xl space-y-10 px-4 py-10 md:grid md:grid-cols-[1.1fr,0.9fr] md:gap-10 md:space-y-0">
    <div class="space-y-3">
      <div
        class="relative aspect-square overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition"
        :class="zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'"
        @click="toggleZoom"
        @mousemove="handleZoomMove"
        @mouseleave="handleZoomLeave"
      >
        <img
          :src="activeImage"
          :alt="product.name"
          class="h-full w-full object-cover transition duration-300"
          :class="zoomed ? 'scale-150' : 'scale-100'"
          :style="zoomed ? { transformOrigin: `${zoomCoords.x}% ${zoomCoords.y}%` } : undefined"
        />
        <button
          type="button"
          class="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-800 shadow"
          @click.stop="zoomOpen = true"
          aria-label="Ampliar imagen del producto"
        >
          <Search class="h-4 w-4" aria-hidden="true" />
          Ver grande
        </button>
      </div>
      <div class="flex items-center gap-3 overflow-x-auto pb-2">
        <button
          v-for="(image, index) in galleryImages"
          :key="index"
          type="button"
          class="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border transition"
          :class="activeImageIndex === index ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-200'"
          @click="selectImage(index)"
        >
          <img :src="image" :alt="`Miniatura ${index + 1}`" class="h-full w-full object-cover" />
        </button>
        <NuxtLink
          v-if="canEditProduct && product.store?.slug"
          :to="`/store/${product.store.slug}/admin/productos/${product.slug}/editar?tab=imagenes`"
          class="inline-flex h-20 w-32 shrink-0 items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 text-sm font-semibold text-slate-600 hover:border-slate-400"
        >
          <Plus class="h-4 w-4" aria-hidden="true" />
          Agregar fotos
        </NuxtLink>
      </div>
    </div>

    <div class="space-y-4">
      <div class="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-slate-500">
        <span>{{ product.category?.name || 'General' }}</span>
        <span v-if="product.is_marketplace" class="rounded-full bg-blue-100 px-2 py-1 text-[11px] font-semibold text-blue-800">Marketplace</span>
        <span v-if="product.product_of_week" class="rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-800">Producto de la semana</span>
      </div>

      <h1 class="text-4xl font-bold text-slate-900">{{ product.name }}</h1>
      <p class="text-slate-600">{{ product.description }}</p>

      <div class="flex items-center gap-3 text-2xl font-bold">
        <span v-if="product.offer_price" class="text-slate-400 line-through text-xl">${{ product.price }}</span>
        <span :class="product.offer_price ? 'text-red-600' : 'text-slate-900'">${{ product.offer_price || product.price }}</span>
      </div>

      <div class="flex flex-wrap items-center gap-2 text-sm font-semibold" :class="stockDescriptor.tone">
        <span class="rounded-full px-3 py-1" :class="stockDescriptor.pill">
          {{ stockDescriptor.label }}
        </span>
      </div>

      <div class="flex flex-wrap gap-3 text-sm text-slate-600">
        <span class="rounded-full border border-slate-200 px-3 py-1">Pago seguro</span>
        <span class="rounded-full border border-slate-200 px-3 py-1">Envío rápido</span>
        <span v-if="product.store?.slug" class="rounded-full border border-slate-200 px-3 py-1">Tienda: {{ product.store.slug }}</span>
      </div>

      <div class="flex flex-wrap gap-3 pt-2">
        <button
          @click="cart.addProduct(product)"
          class="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow transition"
          :class="{ 'cursor-not-allowed opacity-60': !canAddToCart }"
          :disabled="!canAddToCart"
          :style="{ backgroundColor: accentColor }"
        >
          <ShoppingCart class="h-4 w-4" aria-hidden="true" />
          {{ canAddToCart ? 'Agregar al carrito' : 'Sin stock' }}
        </button>
        <NuxtLink
          v-if="product.store?.slug"
          :to="`/store/${product.store.slug}`"
          class="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-800 hover:border-slate-300"
        >
          Ir a la tienda
        </NuxtLink>
              <NuxtLink
                v-if="canEditProduct && product.store?.slug"
                :to="`/store/${product.store.slug}/admin/productos/${product.slug}/editar`"
                class="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-800 hover:border-slate-300"
              >
                Editar producto
              </NuxtLink>
      </div>

      <section class="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs uppercase tracking-[0.2em] text-slate-500">Reseñas</p>
            <h2 class="text-lg font-semibold text-slate-900">Opiniones y valoración</h2>
          </div>
          <span class="flex items-center gap-1 text-sm font-semibold text-amber-600" v-if="averageRating">
            <Star class="h-4 w-4" aria-hidden="true" />
            {{ averageRating }}
          </span>
        </div>

        <div class="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3">
          <label class="text-sm font-semibold text-slate-700">Deja tu reseña</label>
          <div class="grid gap-2 sm:grid-cols-2">
            <input v-model="reviewForm.customer_name" type="text" placeholder="Tu nombre" class="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <div class="flex flex-col gap-1">
              <span class="text-xs uppercase tracking-wide text-slate-500">Tu valoración</span>
              <div class="flex items-center gap-1">
                <button
                  v-for="star in 5"
                  :key="star"
                  type="button"
                  class="transition"
                  @mouseenter="reviewHover = star"
                  @mouseleave="reviewHover = 0"
                  @click="selectRating(star)"
                  :aria-label="`Asignar ${star} estrellas`"
                >
                  <Star
                    class="h-5 w-5 transition"
                    :class="star <= (reviewHover || reviewForm.rating)
                      ? 'text-amber-500 fill-amber-500 stroke-amber-500'
                      : 'text-slate-300 fill-transparent stroke-slate-300'"
                  />
                </button>
                <span class="text-xs text-slate-500">
                  {{ reviewHover || reviewForm.rating ? ((reviewHover || reviewForm.rating) + ' / 5') : 'Selecciona una valoración' }}
                </span>
              </div>
            </div>
          </div>
          <textarea v-model="reviewForm.comment" rows="3" placeholder="Escribe tu comentario" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"></textarea>
          <div class="flex flex-wrap items-center gap-3">
            <button
              class="rounded-xl px-4 py-2 text-sm font-semibold text-white shadow disabled:opacity-50"
              :style="{ backgroundColor: accentColor }"
              :disabled="sendingReview || !canSubmitReview"
              @click="sendReview"
            >
              {{ sendingReview ? 'Enviando…' : 'Publicar reseña' }}
            </button>
            <span class="text-xs text-slate-500">Tu reseña se publica abajo de inmediato.</span>
            <p v-if="reviewMessage" class="text-sm" :class="reviewStatus === 'error' ? 'text-red-600' : 'text-green-600'">{{ reviewMessage }}</p>
          </div>
        </div>

        <div class="space-y-3">
          <p class="text-xs uppercase tracking-[0.2em] text-slate-500">Reseñas recientes</p>
          <div class="space-y-3" v-if="reviews.length">
            <article v-for="review in reviews" :key="review.id" class="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
              <div class="flex flex-col gap-1 text-sm text-slate-700 sm:flex-row sm:items-center sm:justify-between">
                <div class="flex items-center gap-2">
                  <span class="font-semibold">{{ review.customer_name || 'Cliente' }}</span>
                  <span v-if="review.pending" class="text-[11px] font-semibold uppercase tracking-widest text-amber-600">Pendiente</span>
                </div>
                <div class="flex items-center gap-1 text-amber-500">
                  <Star
                    v-for="star in 5"
                    :key="`${review.id}-star-${star}`"
                    class="h-4 w-4"
                    :class="star <= Number(review.rating)
                      ? 'text-amber-500 fill-amber-500 stroke-amber-500'
                      : 'text-slate-300 fill-transparent stroke-slate-300'"
                  />
                </div>
              </div>
              <p class="mt-1 text-sm text-slate-600">{{ review.comment }}</p>
              <p class="text-xs text-slate-400">{{ new Date(review.created_at).toLocaleDateString() }}</p>
            </article>
          </div>
          <p v-else class="text-sm text-slate-600">Aún no hay reseñas.</p>
        </div>
      </section>
    </div>
  </div>

  <div v-else class="text-gray-500 text-center py-20">
    Producto no encontrado
  </div>

  <Teleport to="body">
    <div
      v-if="zoomOpen"
      class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-label="Imagen ampliada del producto"
    >
      <button
        type="button"
        class="absolute right-6 top-6 rounded-full bg-white/90 p-2 text-slate-800 shadow"
        @click="zoomOpen = false"
        aria-label="Cerrar zoom"
      >
        <X class="h-5 w-5" aria-hidden="true" />
      </button>
      <img :src="activeImage" :alt="product?.name" class="max-h-[85vh] w-auto rounded-3xl border border-white/20 object-contain" />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useProducts } from '~/composables/useProducts'
import { useCartStore } from '~/stores/cart'
import { useImages } from '~/composables/useImages'
import { useThemeStore } from '~/stores/theme'
import { useRuntimeConfig } from 'nuxt/app'
import { useAuthStore } from '~/stores/auth'
import { useTenantStore } from '~/stores/tenant'
import { ShoppingCart, Star, Search, Plus, X } from 'lucide-vue-next'
import { useNotificationStore } from '~/stores/notifications'

const route = useRoute()
const cart = useCartStore()
const theme = useThemeStore()
const config = useRuntimeConfig()
const auth = useAuthStore()
const tenantStore = useTenantStore()
const { getProductBySlug } = useProducts()
const { getProductImage, optimizeCloudinary } = useImages()
const notificationStore = useNotificationStore()

const product = ref<any>(null)
const reviews = ref<any[]>([])
const sendingReview = ref(false)
const reviewMessage = ref('')
const reviewStatus = ref<'ok' | 'error'>('ok')
const reviewForm = ref({ rating: 0, comment: '', customer_name: '' })
const reviewHover = ref(0)
const accentColor = computed(() => theme.accent || '#2563eb')
const REVIEW_EVENT = 'pymeweb:review-created'
const placeholderImage = 'https://via.placeholder.com/640x640.png?text=Producto'
const zoomed = ref(false)
const zoomCoords = ref({ x: 50, y: 50 })
const galleryImages = computed(() => {
  if (!product.value) return [placeholderImage]
  const raw = (product.value.images || [])
    .map((img: any) => optimizeCloudinary(img?.image))
    .filter(Boolean)
  if (raw.length) return raw
  return [getProductImage(product.value)]
})
const activeImageIndex = ref(0)
const activeImage = computed(() => galleryImages.value[activeImageIndex.value] || placeholderImage)
const zoomOpen = ref(false)
const averageRating = computed(() => {
  if (!reviews.value.length) return null
  const avg = reviews.value.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) / reviews.value.length
  return avg.toFixed(1)
})
const canSubmitReview = computed(() => reviewForm.value.rating > 0 && reviewForm.value.comment.trim().length > 0)
const canEditProduct = computed(() => {
  const memberships = (auth.user as any)?.memberships || []
  const storeSlug = product.value?.store?.slug || (route.params.slug as string)
  return memberships.some((m: any) => m?.store?.slug === storeSlug && (m.roles || []).some((r: string) => r?.toLowerCase?.() === 'admin'))
})

const describeStock = (value: number) => {
  if (value <= 0) {
    return {
      label: 'Sin stock disponible',
      tone: 'text-red-600',
      pill: 'bg-red-50 text-red-700',
    }
  }
  if (value <= 5) {
    return {
      label: `Últimas ${value} unidades`,
      tone: 'text-amber-600',
      pill: 'bg-amber-50 text-amber-700',
    }
  }
  return {
    label: `${value} unidades disponibles`,
    tone: 'text-emerald-600',
    pill: 'bg-emerald-50 text-emerald-700',
  }
}

const availableStock = computed(() => {
  const value = Number(product.value?.stock_available ?? 0)
  return Number.isFinite(value) ? value : 0
})
const stockDescriptor = computed(() => describeStock(availableStock.value))
const canAddToCart = computed(() => availableStock.value > 0)

const withPendingFlag = (review: any = {}) => ({
  ...review,
  pending: review?.status ? review.status !== 'APPROVED' : false,
})

const fetchReviews = async () => {
  if (!product.value) return
  try {
    const data = await $fetch<any[]>(`${config.public.apiBase}/store/${route.params.slug}/resenas/reviews/product/${product.value.slug}/`)
    reviews.value = (data || []).map(withPendingFlag)
  } catch (error) {
    reviews.value = []
  }
}

const sendReview = async () => {
  if (!product.value) return
  if (reviewForm.value.rating <= 0) {
    reviewStatus.value = 'error'
    reviewMessage.value = 'Selecciona una valoración antes de enviar.'
    return
  }
  sendingReview.value = true
  reviewMessage.value = ''
  try {
    const created = await $fetch<any>(`${config.public.apiBase}/store/${route.params.slug}/resenas/reviews/product/${product.value.slug}/create/`, {
      method: 'POST',
      body: {
        rating: reviewForm.value.rating,
        comment: reviewForm.value.comment,
        customer_name: reviewForm.value.customer_name,
        product_slug: product.value.slug,
      },
    })
    const pendingReview = withPendingFlag(created)
    reviewMessage.value = 'Gracias, tu reseña ya aparece para otros compradores.'
    reviewStatus.value = 'ok'
    reviewForm.value = { rating: 0, comment: '', customer_name: '' }
    reviewHover.value = 0
    reviews.value = [pendingReview, ...reviews.value]
    notificationStore.pushNotification({
      type: 'review:new',
      message: `Nueva reseña para ${product.value?.name}`,
      count: 1,
      store: product.value?.store?.slug,
      product_slug: pendingReview.product_slug || product.value?.slug,
    })
    if (process.client) {
      window.dispatchEvent(
        new CustomEvent(REVIEW_EVENT, {
          detail: {
            store: product.value?.store?.slug,
            product: pendingReview.product_slug || product.value?.slug,
          },
        })
      )
    }
  } catch (error: any) {
    reviewMessage.value = error?.response?._data || 'No pudimos enviar la reseña'
    reviewStatus.value = 'error'
  } finally {
    sendingReview.value = false
  }
}

const selectRating = (value: number) => {
  reviewForm.value.rating = value
  reviewMessage.value = ''
  reviewStatus.value = 'ok'
}

const selectImage = (index: number) => {
  activeImageIndex.value = index
  zoomed.value = false
}

const toggleZoom = () => {
  zoomed.value = !zoomed.value
  if (!zoomed.value) {
    zoomCoords.value = { x: 50, y: 50 }
  }
}

const handleZoomMove = (event: MouseEvent) => {
  if (!zoomed.value) return
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * 100
  const y = ((event.clientY - rect.top) / rect.height) * 100
  zoomCoords.value = { x, y }
}

const handleZoomLeave = () => {
  if (!zoomed.value) {
    zoomCoords.value = { x: 50, y: 50 }
  }
}


watch(
  galleryImages,
  (images) => {
    if (!images.length) {
      activeImageIndex.value = 0
      return
    }
    if (activeImageIndex.value > images.length - 1) {
      activeImageIndex.value = 0
    }
    zoomed.value = false
  }
)

onMounted(async () => {
  try {
    const slug = route.params.slug as string
    tenantStore.setSlug(slug)
    theme.applyStoreTheme(slug)
    product.value = await getProductBySlug(route.params.product_slug as string)
    await fetchReviews()
    activeImageIndex.value = 0
  } catch (e) {
    console.error('Error cargando producto', e)
  }
})
</script>
