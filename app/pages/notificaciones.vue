<template>
  <div class="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_32%),linear-gradient(180deg,_#f8fafc_0%,_#fff_100%)] px-4 py-8 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-6xl space-y-6">
      <div class="overflow-hidden rounded-[32px] border border-slate-200 bg-slate-950 text-white shadow-[0_24px_60px_-30px_rgba(15,23,42,0.45)]">
        <div class="grid gap-6 p-6 md:grid-cols-[1.1fr,0.9fr] md:p-8">
          <div class="space-y-4">
            <p class="text-xs uppercase tracking-[0.3em] text-slate-300">Centro de notificaciones</p>
            <h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">Notificaciones</h1>
            <p class="max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">Alertas operativas de pedidos, envíos, reseñas y tickets en una vista más clara y profesional.</p>
            <div class="flex flex-wrap gap-3">
              <button
                class="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 disabled:opacity-60"
                @click="refreshFeed"
                :disabled="refreshing"
              >
                {{ refreshing ? 'Actualizando...' : 'Actualizar feed' }}
              </button>
              <NuxtLink to="/dashboard" class="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">
                Volver al dashboard
              </NuxtLink>
            </div>
          </div>

          <div class="grid gap-3 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3">
            <article class="rounded-3xl bg-white/10 p-4 backdrop-blur">
              <p class="text-xs uppercase tracking-[0.22em] text-slate-300">Sin leer</p>
              <p class="mt-2 text-3xl font-semibold text-white">{{ unreadCount }}</p>
            </article>
            <article class="rounded-3xl bg-white/10 p-4 backdrop-blur">
              <p class="text-xs uppercase tracking-[0.22em] text-slate-300">Totales</p>
              <p class="mt-2 text-3xl font-semibold text-white">{{ feed.length }}</p>
            </article>
            <article class="rounded-3xl bg-white/10 p-4 backdrop-blur">
              <p class="text-xs uppercase tracking-[0.22em] text-slate-300">Filtradas</p>
              <p class="mt-2 text-3xl font-semibold text-white">{{ filteredFeed.length }}</p>
            </article>
          </div>
        </div>
      </div>

      <section class="rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.22)] sm:p-6">
        <div class="flex flex-col gap-4 border-b border-slate-100 pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div class="space-y-1">
            <p class="text-xs uppercase tracking-[0.25em] text-slate-500">Feed</p>
            <h2 class="text-2xl font-semibold text-slate-900">Recientes</h2>
            <p class="text-sm text-slate-500">{{ unreadCount }} sin leer</p>
          </div>
          <div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto] lg:items-center">
            <select v-model="typeFilter" class="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-400">
              <option value="all">Todos los tipos</option>
              <option v-for="t in availableTypes" :key="t" :value="t">{{ formatType(t) }}</option>
            </select>
            <label class="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700">
              <input type="checkbox" v-model="onlyUnread" class="h-4 w-4 rounded border-slate-300" /> Solo sin leer
            </label>
            <button class="h-11 rounded-2xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40" @click="markAllRead" :disabled="!feed.length">Marcar leído</button>
            <button class="h-11 rounded-2xl border border-rose-200 px-4 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-40" @click="clearAll" :disabled="!feed.length">Limpiar</button>
          </div>
        </div>

        <div v-if="!filteredFeed.length" class="mt-5 rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
          No hay notificaciones para este filtro.
        </div>

        <ul v-else class="mt-5 space-y-3">
          <li
            v-for="item in paginatedFeed"
            :key="item.id"
            class="group rounded-[24px] border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
          >
            <div class="flex items-start gap-4">
              <div class="mt-1 h-3 w-3 rounded-full" :class="item.read ? 'bg-slate-300' : 'bg-emerald-500'" />
              <div class="min-w-0 flex-1">
                <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div class="min-w-0">
                    <p class="text-sm font-semibold text-slate-900">{{ item.message }}</p>
                    <p class="mt-1 text-xs text-slate-500">{{ formatType(item.type) }} • {{ item.store || 'tienda' }}</p>
                  </div>
                  <div class="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span>{{ formatDate(item.created_at) }}</span>
                    <button
                      class="rounded-full px-3 py-1 text-[11px] font-semibold transition"
                      :class="item.read ? 'bg-slate-200 text-slate-700' : 'bg-emerald-100 text-emerald-700'"
                      @click="toggleRead(item)"
                    >
                      {{ item.read ? 'Leída' : 'Marcar leída' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </li>
        </ul>

        <div v-if="filteredFeed.length > perPage" class="mt-5 flex flex-col gap-3 rounded-[24px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 sm:flex-row sm:items-center sm:justify-between">
          <button
            class="rounded-xl border border-slate-200 px-3 py-2 font-semibold transition hover:bg-slate-50 disabled:opacity-40"
            :disabled="page === 1"
            @click="page -= 1"
          >
            Anterior
          </button>
          <p>Mostrando {{ pageStart }}-{{ pageEnd }} de {{ filteredFeed.length }}</p>
          <button
            class="rounded-xl border border-slate-200 px-3 py-2 font-semibold transition hover:bg-slate-50 disabled:opacity-40"
            :disabled="page === totalPages"
            @click="page += 1"
          >
            Siguiente
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRuntimeConfig } from 'nuxt/app'
import { useAuthStore } from '~/stores/auth'
import { useNotificationStore, type NotificationFeedItem } from '~/stores/notifications'

definePageMeta({ middleware: ['auth'], requiresAuth: true })

const auth = useAuthStore()
const config = useRuntimeConfig()
const notificationStore = useNotificationStore()
const refreshing = ref(false)
const typeFilter = ref<'all' | string>('all')
const onlyUnread = ref(false)
const page = ref(1)
const perPage = 12

const availableTypes = computed(() => notificationStore.types)
const feed = computed(() => notificationStore.feed)
const unreadCount = computed(() => notificationStore.totalUnread)

const filteredFeed = computed(() => {
  return feed.value
    .filter((n) => (typeFilter.value === 'all' ? true : n.type === typeFilter.value))
    .filter((n) => (onlyUnread.value ? !n.read : true))
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredFeed.value.length / perPage)))
const paginatedFeed = computed(() => {
  const start = (page.value - 1) * perPage
  return filteredFeed.value.slice(start, start + perPage)
})
const pageStart = computed(() => (filteredFeed.value.length ? (page.value - 1) * perPage + 1 : 0))
const pageEnd = computed(() => Math.min(page.value * perPage, filteredFeed.value.length))

const formatType = (type: string) => {
  const map: Record<string, string> = {
    order_sold: 'Producto vendido',
    order_completed: 'Pedido finalizado',
    shipping_pending: 'Pendiente de envío',
    shipping_followup: 'Seguimiento en tránsito',
    review_new: 'Nueva reseña',
    review_pending: 'Reseñas por aprobar',
    ticket: 'Ticket',
    ticket_update: 'Actualización de ticket',
    ticket_detail: 'Detalle de ticket',
    order: 'Pedidos',
    order_new: 'Nuevo pedido',
    product: 'Producto',
  }
  return map[type] || type
}

const refreshFeed = async () => {
  if (!auth.token) return
  refreshing.value = true
  try {
    const data = await $fetch<{ results: NotificationFeedItem[] }>(`${config.public.apiBase}/support/notifications/feed/`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    })
    notificationStore.setFeed(data.results || [])
  } catch (error) {
    console.warn('No se pudieron actualizar las notificaciones', error)
  } finally {
    refreshing.value = false
  }
}

const markAllRead = () => notificationStore.markAllRead()
const clearAll = () => notificationStore.clearAll()
const toggleRead = (item: NotificationFeedItem) => {
  if (!item.read) {
    notificationStore.markRead(item.id)
  }
}

const formatDate = (value: string | Date) => {
  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

onMounted(() => {
  notificationStore.loadReadIds()
  refreshFeed()
})

watch([typeFilter, onlyUnread], () => {
  page.value = 1
})

watch(filteredFeed, () => {
  if (page.value > totalPages.value) page.value = totalPages.value
})
</script>
