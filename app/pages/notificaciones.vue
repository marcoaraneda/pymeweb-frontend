<template>
  <div class="min-h-screen bg-slate-50 px-4 py-10">
    <div class="mx-auto max-w-4xl space-y-6">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-xs uppercase tracking-[0.25em] text-slate-500">Centro</p>
          <h1 class="text-3xl font-bold text-slate-900">Notificaciones</h1>
          <p class="text-slate-600">Revisa alertas recientes y el historial completo.</p>
        </div>
        <div class="flex flex-wrap gap-3">
          <button
            class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300"
            @click="refreshUnread"
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
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-slate-900">Recientes</h2>
          <span class="text-sm text-slate-500">{{ unread.length }} pendientes</span>
        </div>
        <div class="mt-4">
          <template v-if="unread.length">
            <ul class="space-y-3">
              <li v-for="(n, idx) in unread" :key="`unread-${idx}`" class="rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-center gap-3">
                <span v-if="n.type?.includes('ticket')" class="inline-block h-3 w-3 rounded-full bg-blue-500"></span>
                <span v-else-if="n.type?.includes('order')" class="inline-block h-3 w-3 rounded-full bg-green-500"></span>
                <span v-else-if="n.type?.includes('review')" class="inline-block h-3 w-3 rounded-full bg-amber-500"></span>
                <span v-else class="inline-block h-3 w-3 rounded-full bg-slate-400"></span>
                <div>
                  <p class="text-sm font-semibold text-slate-900">{{ n.message }}</p>
                  <p class="text-xs text-slate-500">Tipo: {{ n.type }}</p>
                </div>
              </li>
            </ul>
          </template>
          <p v-else class="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">No tienes notificaciones nuevas.</p>
        </div>
        <button type="button" class="mt-4 block text-xs font-semibold text-blue-600 hover:underline w-full text-left" @click="refreshUnread">
          Actualizar notificaciones
        </button>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-slate-900">Historial</h2>
          <button class="text-xs text-slate-500 underline hover:text-slate-900" @click="clearHistory" :disabled="!history.length">
            Limpiar historial
          </button>
        </div>
        <div class="mt-4">
          <template v-if="history.length">
            <ul class="space-y-3">
              <li v-for="item in history" :key="item.id" class="rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-center gap-3">
                <span v-if="item.type?.includes('ticket')" class="inline-block h-3 w-3 rounded-full bg-blue-500"></span>
                <span v-else-if="item.type?.includes('order')" class="inline-block h-3 w-3 rounded-full bg-green-500"></span>
                <span v-else-if="item.type?.includes('review')" class="inline-block h-3 w-3 rounded-full bg-amber-500"></span>
                <span v-else class="inline-block h-3 w-3 rounded-full bg-slate-400"></span>
                <div class="flex-1">
                  <div class="flex items-center justify-between">
                    <p class="text-sm font-semibold text-slate-900">{{ item.message }}</p>
                    <span class="text-xs text-slate-500">{{ formatDate(item.readAt) }}</span>
                  </div>
                  <p class="text-xs text-slate-500">Tipo: {{ item.type }} 2 Veces: {{ item.count }}</p>
                </div>
              </li>
            </ul>
          </template>
          <p v-else class="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">Aan no tienes historial.</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRuntimeConfig } from 'nuxt/app'
import { useAuthStore } from '~/stores/auth'
import { useNotificationStore } from '~/stores/notifications'

const auth = useAuthStore()
const config = useRuntimeConfig()
const notificationStore = useNotificationStore()
const refreshing = ref(false)
const unread = computed(() => notificationStore.unread)
const history = computed(() => notificationStore.history)

const refreshUnread = async () => {
  if (!auth.token) return
  refreshing.value = true
  try {
    const data = await $fetch<{ notifications?: { type: string; message: string; count: number }[] }>(
      `${config.public.apiBase}/support/dashboard/summary/`,
      {
        headers: { Authorization: `Bearer ${auth.token}` },
      }
    )
    notificationStore.setUnread(data.notifications || [])
  } catch (error) {
    console.warn('No se pudieron actualizar las notificaciones', error)
  } finally {
    refreshing.value = false
  }
}

const clearHistory = () => {
  notificationStore.clearHistory()
}

const formatDate = (iso: string) => {
  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso))
}

onMounted(() => {
  notificationStore.loadHistory()
  refreshUnread()
})
</script>
