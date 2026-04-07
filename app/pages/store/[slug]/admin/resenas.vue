<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Reseñas de la tienda</h1>
        <p class="text-sm text-gray-500">Aprueba o rechaza reseñas públicas de esta tienda.</p>
      </div>
      <button @click="loadReviews" class="text-sm bg-gray-200 px-4 py-2 rounded-lg">Actualizar</button>
    </div>

    <div v-if="errorMessage" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ errorMessage }}
    </div>

    <div v-if="loading" class="rounded-xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
      Cargando reseñas...
    </div>

    <div v-else class="space-y-3">
      <div v-if="!reviews.length" class="rounded-xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
        No hay reseñas registradas.
      </div>

      <article v-for="review in reviews" :key="review.id" class="rounded-xl border bg-white p-4 shadow-sm">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p class="font-semibold text-slate-900">{{ review.product_name || `Producto #${review.product}` }}</p>
            <p class="text-xs text-slate-500">{{ review.customer_name || 'Cliente sin nombre' }} • {{ formatDate(review.created_at) }}</p>
            <p class="mt-2 text-sm text-slate-700">{{ review.comment || 'Sin comentario.' }}</p>
          </div>
          <div class="flex flex-col items-start gap-2 sm:items-end">
            <span class="rounded-full px-3 py-1 text-xs font-semibold" :class="statusClasses(review.status)">
              {{ review.status }}
            </span>
            <span class="text-sm text-amber-600">{{ '★'.repeat(review.rating) }}</span>
          </div>
        </div>
        <div class="mt-3 flex flex-wrap gap-2">
          <button class="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50" :disabled="review.status === 'APPROVED' || savingId === review.id" @click="updateStatus(review, 'APPROVED')">
            Aprobar
          </button>
          <button class="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50" :disabled="review.status === 'REJECTED' || savingId === review.id" @click="updateStatus(review, 'REJECTED')">
            Rechazar
          </button>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRuntimeConfig } from 'nuxt/app'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'admin', middleware: ['tenant', 'auth'], requiresAuth: true })

type ReviewRow = {
  id: number
  product: number
  product_name?: string
  rating: number
  comment: string
  customer_name: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  created_at: string
}

const route = useRoute()
const config = useRuntimeConfig()
const auth = useAuthStore()
const slug = route.params.slug as string

const reviews = ref<ReviewRow[]>([])
const loading = ref(false)
const errorMessage = ref('')
const savingId = ref<number | null>(null)

const authedFetch = async <T>(url: string, options: Record<string, any> = {}) => {
  if (!auth.token) throw new Error('No autenticado')
  const doFetch = (token: string) =>
    $fetch<T>(url, {
      ...options,
      headers: { Authorization: `Bearer ${token}`, ...(options.headers || {}) },
    })

  try {
    return await doFetch(auth.token)
  } catch (error: any) {
    const code = error?.response?._data?.code
    if (code === 'token_not_valid' && auth.refreshToken) {
      const refreshed = await auth.refreshTokens()
      if (refreshed) return doFetch(refreshed)
    }
    throw error
  }
}

const loadReviews = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    reviews.value = await authedFetch<ReviewRow[]>(`${config.public.apiBase}/store/${slug}/admin/resenas/reviews/`)
  } catch (error: any) {
    errorMessage.value = error?.response?._data?.detail || 'No se pudieron cargar las reseñas.'
    reviews.value = []
  } finally {
    loading.value = false
  }
}

const updateStatus = async (review: ReviewRow, status: ReviewRow['status']) => {
  savingId.value = review.id
  errorMessage.value = ''
  try {
    const updated = await authedFetch<ReviewRow>(`${config.public.apiBase}/store/${slug}/admin/resenas/reviews/${review.id}/`, {
      method: 'PATCH',
      body: { status },
    })
    reviews.value = reviews.value.map((item) => (item.id === review.id ? { ...item, ...updated } : item))
  } catch (error: any) {
    errorMessage.value = error?.response?._data?.detail || 'No se pudo actualizar la reseña.'
  } finally {
    savingId.value = null
  }
}

const statusClasses = (status: ReviewRow['status']) => {
  if (status === 'APPROVED') return 'bg-emerald-100 text-emerald-700'
  if (status === 'REJECTED') return 'bg-rose-100 text-rose-700'
  return 'bg-amber-100 text-amber-700'
}

const formatDate = (value: string) => new Date(value).toLocaleString('es-CL')

onMounted(loadReviews)
</script>