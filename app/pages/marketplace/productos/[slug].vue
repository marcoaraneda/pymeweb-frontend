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
            <NuxtLink
              v-if="canEdit"
              to="/marketplace#mis-productos"
              class="block w-full rounded-xl border border-amber-200 px-4 py-3 text-center text-sm font-semibold text-amber-800 hover:bg-amber-50"
            >
              Editar mi publicación
            </NuxtLink>
          </div>
        </div>

        <div v-if="canEdit" class="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <div class="flex items-center justify-between gap-2">
            <h2 class="text-sm font-semibold text-amber-900">Editar publicación</h2>
            <span class="text-[11px] font-semibold text-amber-700">Solo visible para quien la subió</span>
          </div>
          <div class="mt-3 grid gap-3 md:grid-cols-2">
            <div class="space-y-1">
              <label class="text-xs text-amber-800">Nombre</label>
              <input v-model="editForm.name" type="text" class="w-full rounded-xl border border-amber-200 px-3 py-2 text-sm" />
            </div>
            <div class="space-y-1">
              <label class="text-xs text-amber-800">Precio</label>
              <input v-model.number="editForm.price" type="number" step="0.01" class="w-full rounded-xl border border-amber-200 px-3 py-2 text-sm" />
            </div>
            <div class="space-y-1">
              <label class="text-xs text-amber-800">Precio oferta</label>
              <input v-model.number="editForm.offer_price" type="number" step="0.01" class="w-full rounded-xl border border-amber-200 px-3 py-2 text-sm" />
            </div>
            <div class="space-y-1 md:col-span-2">
              <label class="text-xs text-amber-800">Descripción</label>
              <textarea v-model="editForm.description" rows="3" class="w-full rounded-xl border border-amber-200 px-3 py-2 text-sm"></textarea>
            </div>
          </div>
          <div class="mt-3 flex flex-wrap items-center gap-3">
            <button
              class="rounded-xl px-4 py-2 text-sm font-semibold text-white shadow"
              :style="accentStyle"
              :disabled="saving"
              @click="saveEdits"
            >
              {{ saving ? 'Guardando...' : 'Guardar cambios' }}
            </button>
            <p v-if="saveMessage" class="text-sm text-emerald-700">{{ saveMessage }}</p>
            <p v-if="saveError" class="text-sm text-red-600">{{ saveError }}</p>
          </div>
        </div>
      
      <section class="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs uppercase tracking-[0.2em] text-slate-500">Reseñas</p>
            <h2 class="text-lg font-semibold text-slate-900">Opiniones y valoración</h2>
          </div>
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
              :style="accentStyle"
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
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useRuntimeConfig } from 'nuxt/app'
import { definePageMeta } from '#imports'
import { useCartStore } from '~/stores/cart'
import { useNotificationStore } from '~/stores/notifications'
import { useTenantStore } from '~/stores/tenant'
import { useThemeStore } from '~/stores/theme'
import { useAuthStore } from '~/stores/auth'
import { useImages } from '~/composables/useImages'

definePageMeta({ layout: 'store' })

const route = useRoute()
const slugParam = route.params.slug as string
const config = useRuntimeConfig()
const cart = useCartStore()
const tenantStore = useTenantStore()
const theme = useThemeStore()
const auth = useAuthStore()
const { getProductImage } = useImages()
const notificationStore = useNotificationStore()
const REVIEW_EVENT = 'pymeweb:review-created'

const product = ref<any | null>(null)
const loading = ref(true)
const error = ref('')
const saving = ref(false)
const saveMessage = ref('')
const saveError = ref('')
const editForm = ref({ name: '', description: '', price: 0, offer_price: null as number | null })

const accentStyle = computed(() => ({ backgroundColor: theme.accent || '#2563eb', color: '#fff' }))
const productImage = computed(() => getProductImage(product.value))
const canEdit = computed(() => {
  const userId = (auth.user as any)?.id
  return Boolean(userId && product.value?.submitted_by === userId)
})

const reviews = ref<any[]>([])
const sendingReview = ref(false)
const reviewMessage = ref('')
const reviewStatus = ref<'ok' | 'error'>('ok')
const reviewForm = ref({ rating: 0, comment: '', customer_name: '' })
const reviewHover = ref(0)
const canSubmitReview = computed(() => reviewForm.value.rating > 0 && reviewForm.value.comment.trim().length > 0)

const withPendingFlag = (review: any = {}) => ({
  ...review,
  pending: review?.status ? review.status !== 'APPROVED' : false,
})

const fetchReviews = async () => {
  if (!product.value) return
  try {
    if (product.value?.store?.slug) {
      const data = await $fetch<any[]>(`${config.public.apiBase}/store/${product.value.store.slug}/resenas/reviews/product/${product.value.slug}/`)
      reviews.value = (data || []).map(withPendingFlag)
    } else {
      // Fallback: marketplace-specific reviews endpoint (if available)
      const idOrSlug = product.value.slug || product.value.id
      const data = await $fetch<any[]>(`${config.public.apiBase}/marketplace/products/${encodeURIComponent(idOrSlug)}/reviews/`)
      reviews.value = (data || []).map(withPendingFlag)
    }
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
    let created: any = null
    if (product.value?.store?.slug) {
      created = await $fetch<any>(`${config.public.apiBase}/store/${product.value.store.slug}/resenas/reviews/product/${product.value.slug}/create/`, {
        method: 'POST',
        body: {
          rating: reviewForm.value.rating,
          comment: reviewForm.value.comment,
          customer_name: reviewForm.value.customer_name,
          product_slug: product.value.slug,
        },
      })
    } else {
      const idOrSlug = product.value.slug || product.value.id
      created = await $fetch<any>(`${config.public.apiBase}/marketplace/products/${encodeURIComponent(idOrSlug)}/reviews/create/`, {
        method: 'POST',
        body: {
          rating: reviewForm.value.rating,
          comment: reviewForm.value.comment,
          customer_name: reviewForm.value.customer_name,
          product_slug: idOrSlug,
        },
      })
    }
    const pendingReview = withPendingFlag(created)
    reviewMessage.value = 'Gracias, tu reseña ya aparece para otros compradores.'
    reviewStatus.value = 'ok'
    reviewForm.value = { rating: 0, comment: '', customer_name: '' }
    reviewHover.value = 0
    reviews.value = [pendingReview, ...reviews.value]
    // Notificar al dueño de la tienda si aplica
    notificationStore.pushNotification({
      type: 'review:new',
      message: `Nueva reseña para ${product.value?.name}`,
      count: 1,
      store: product.value?.store?.slug,
      product_slug: pendingReview.product_slug || product.value?.slug,
    })
    if (process.client) {
      window.dispatchEvent(new CustomEvent(REVIEW_EVENT, { detail: { store: product.value?.store?.slug, product: pendingReview.product_slug || product.value?.slug } }))
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

const loadProduct = async () => {
  loading.value = true
  error.value = ''
  try {
    const data = await $fetch<any>(`${config.public.apiBase}/marketplace/products/${encodeURIComponent(slugParam)}/`)
    product.value = data
    editForm.value = {
      name: data.name || '',
      description: data.description || '',
      price: Number(data.price) || 0,
      offer_price: data.offer_price ? Number(data.offer_price) : null,
    }
    if (data?.store?.slug) {
      tenantStore.setSlug(data.store.slug)
      theme.applyStoreTheme(data.store.slug)
    } else {
      theme.loadFromStorage()
      theme.applyTheme()
    }
  } catch (err: any) {
    // Fallback: intentar por ID si el slug falla y parece numérico
    const numericId = Number(slugParam)
    if (!product.value && Number.isFinite(numericId)) {
      try {
        const data = await $fetch<any>(`${config.public.apiBase}/marketplace/products/${numericId}/`)
        product.value = data
        editForm.value = {
          name: data.name || '',
          description: data.description || '',
          price: Number(data.price) || 0,
          offer_price: data.offer_price ? Number(data.offer_price) : null,
        }
        if (data?.store?.slug) {
          tenantStore.setSlug(data.store.slug)
          theme.applyStoreTheme(data.store.slug)
        } else {
          theme.loadFromStorage()
          theme.applyTheme()
        }
        return
      } catch (err2: any) {
        /* fallthrough */
      }
    }
    error.value = err?.response?._data || 'Producto no encontrado'
    product.value = null
  } finally {
    loading.value = false
  }
}

const handleAddToCart = async () => {
  if (!product.value) return
  cart.setContext('marketplace')
  cart.addProduct(product.value)
  await navigateTo('/marketplace/carrito')
}

const saveEdits = async () => {
  if (!product.value || !auth.token) {
    saveError.value = 'Inicia sesión para editar tu publicación'
    return
  }
  saving.value = true
  saveMessage.value = ''
  saveError.value = ''
  try {
    const updated = await $fetch(`${config.public.apiBase}/marketplace/products/${encodeURIComponent(product.value.id || slugParam)}/`, {
      method: 'PATCH',
      body: {
        name: editForm.value.name,
        description: editForm.value.description,
        price: editForm.value.price,
        offer_price: editForm.value.offer_price,
      },
      headers: { Authorization: `Bearer ${auth.token}` },
    })
    product.value = updated
    saveMessage.value = 'Cambios guardados'
  } catch (err: any) {
    saveError.value = err?.response?._data || 'No pudimos guardar los cambios'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  theme.loadFromStorage()
  auth.restoreFromCookies()
  await loadProduct()
  await fetchReviews()
})
</script>
