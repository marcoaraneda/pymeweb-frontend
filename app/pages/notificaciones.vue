<template>
  <div class="min-h-screen bg-slate-50 px-4 py-10">
    <div class="mx-auto max-w-4xl space-y-6">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-xs uppercase tracking-[0.25em] text-slate-500">Centro</p>
          <h1 class="text-3xl font-bold text-slate-900">Notificaciones</h1>
          <p class="text-slate-600">Alertas operativas de pedidos, envíos y reseñas.</p>
        </div>
        <div class="flex flex-wrap gap-3">
          <button
            class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300"
            @click="refreshFeed"
            :disabled="refreshing"
          >
            {{ refreshing ? 'Actualizando...' : 'Actualizar' }}
          </button>
          <NuxtLink to="/dashboard" class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300">
            Volver al dashboard
          </NuxtLink>
        </div>
      </div>

      <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="space-y-1">
            <h2 class="text-lg font-semibold text-slate-900">Recientes</h2>
            <p class="text-sm text-slate-500">{{ unreadCount }} sin leer</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <select v-model="typeFilter" class="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
              <option value="all">Todos los tipos</option>
              <option v-for="t in availableTypes" :key="t" :value="t">{{ formatType(t) }}</option>
            </select>
            <label class="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" v-model="onlyUnread" class="h-4 w-4 rounded border-slate-300" /> Solo sin leer
            </label>
            <button class="text-sm font-semibold text-slate-700 underline" @click="markAllRead" :disabled="!feed.length">Marcar todo leído</button>
            <button class="text-sm text-rose-600 underline" @click="clearAll" :disabled="!feed.length">Limpiar</button>
          </div>
        </div>

        <div v-if="!filteredFeed.length" class="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
          No hay notificaciones para este filtro.
        </div>

        <ul v-else class="mt-4 space-y-3">
          <li
            v-for="item in filteredFeed"
            :key="item.id"
            class="rounded-xl border border-slate-200 bg-slate-50 p-4"
          >
            <div class="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p class="text-sm font-semibold text-slate-900">{{ item.message }}</p>
                <p class="text-xs text-slate-500">{{ formatType(item.type) }} • {{ item.store || 'tienda' }}</p>
              </div>
              <div class="flex items-center gap-2 text-xs text-slate-500">
                <span>{{ formatDate(item.created_at) }}</span>
                <button
                  class="rounded-full px-3 py-1 text-[11px] font-semibold"
                  :class="item.read ? 'bg-slate-200 text-slate-700' : 'bg-emerald-100 text-emerald-700'"
                  @click="toggleRead(item)"
                >
                  {{ item.read ? 'Leída' : 'Marcar leída' }}
                </button>
              </div>
            </div>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
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

const availableTypes = computed(() => notificationStore.types)
const feed = computed(() => notificationStore.feed)
const unreadCount = computed(() => notificationStore.totalUnread)

const filteredFeed = computed(() => {
  return feed.value
    .filter((n) => (typeFilter.value === 'all' ? true : n.type === typeFilter.value))
    .filter((n) => (onlyUnread.value ? !n.read : true))
})

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
</script>
