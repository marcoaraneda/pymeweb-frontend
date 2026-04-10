<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <section class="mx-auto max-w-4xl px-6 py-10 space-y-6 reveal">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs uppercase tracking-[0.2em] text-slate-500">Soporte</p>
          <h1 class="text-3xl font-bold text-slate-900">Enviar ticket</h1>
          <p class="text-slate-600">Cuéntanos el problema, lo asignaremos al equipo correcto.</p>
        </div>
        <NuxtLink :to="`/store/${slug}`" class="text-sm font-semibold text-slate-700 hover:text-slate-900">Regresar</NuxtLink>
      </div>

      <div class="mt-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/5">
        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <label class="text-sm text-slate-600">Título</label>
            <input v-model="form.title" type="text" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="Ej. Problema con pago" />
          </div>
          <div class="space-y-2">
            <label class="text-sm text-slate-600">Prioridad</label>
            <select v-model="form.priority" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
              <option value="normal">Normal</option>
              <option value="high">Alta</option>
              <option value="low">Baja</option>
            </select>
          </div>
          <div class="space-y-2 md:col-span-2">
            <label class="text-sm text-slate-600">Descripción</label>
            <textarea v-model="form.description" rows="4" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="Describe qué sucede, pasos para reproducir y pantallas afectadas."></textarea>
          </div>
        </div>

        <div class="mt-4 flex flex-wrap items-center gap-3">
          <button class="rounded-xl px-4 py-2 text-sm font-semibold text-white shadow" :style="accentStyle" :disabled="sending" @click="submit">
            {{ sending ? 'Enviando...' : 'Enviar ticket' }}
          </button>
          <span class="text-sm text-slate-600">Se asociará a esta tienda.</span>
          <span v-if="message" :class="messageClass" class="text-sm">{{ message }}</span>
        </div>
      </div>

      <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/5 reveal" style="animation-delay: 0.05s;">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold text-slate-900">Tus tickets</h2>
          <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{{ tickets.length }}</span>
        </div>
        <div v-if="loading" class="mt-4 text-slate-600">Cargando...</div>
        <div v-else-if="!tickets.length" class="mt-4 text-slate-600">Aún no has enviado tickets.</div>
        <div v-else class="mt-4 divide-y divide-slate-200">
          <article v-for="t in paginatedTickets" :key="t.id" class="py-4 space-y-3">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="font-semibold text-slate-900">{{ t.title }}</p>
                <p class="text-xs text-slate-500">{{ formatStatus(t.status) }} • Prioridad {{ t.priority }}</p>
                <p class="text-[11px] text-slate-400">Actualizado {{ formatDate(t.updated_at) }}</p>
              </div>
              <span :class="['rounded-full px-3 py-1 text-[11px] font-semibold', badgeClass(t.status)]">{{ formatStatus(t.status) }}</span>
            </div>
            <div class="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700 whitespace-pre-line">
              {{ baseDescription(t.description) }}
            </div>
            <div v-if="adminReplies(t.description).length" class="space-y-2">
              <p class="text-xs font-semibold text-slate-600">Respuestas del administrador</p>
              <div class="space-y-2">
                <div
                  v-for="(reply, idx) in adminReplies(t.description)"
                  :key="idx"
                  class="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800"
                  :style="{ borderLeft: `4px solid ${accentColor}` }"
                >
                  {{ reply }}
                </div>
              </div>
            </div>
          </article>
        </div>

        <div v-if="tickets.length > perPage" class="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          <button
            class="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold hover:bg-slate-50 disabled:opacity-40"
            :disabled="page === 1"
            @click="page -= 1"
          >
            Anterior
          </button>
          <p>Mostrando {{ pageStart }}-{{ pageEnd }} de {{ tickets.length }}</p>
          <button
            class="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold hover:bg-slate-50 disabled:opacity-40"
            :disabled="page === totalPages"
            @click="page += 1"
          >
            Siguiente
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { navigateTo, useRuntimeConfig } from 'nuxt/app'
import { definePageMeta } from '#imports'
import { useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useThemeStore } from '~/stores/theme'

const route = useRoute()
const slug = computed(() => route.params.slug as string)
const auth = useAuthStore()
const theme = useThemeStore()
const config = useRuntimeConfig()
const accentColor = computed(() => theme.accent || '#2563eb')

const form = ref({ title: '', description: '', priority: 'normal' })
const sending = ref(false)
const message = ref('')
const messageClass = computed(() => (message.value.toLowerCase().includes('error') ? 'text-red-600' : 'text-emerald-600'))
type TicketItem = {
  id: number
  title: string
  description: string
  status: string
  priority: string
  updated_at: string
}

const tickets = ref<TicketItem[]>([])
const loading = ref(false)
const page = ref(1)
const perPage = 8

const accentStyle = computed(() => ({ backgroundColor: accentColor.value }))
const totalPages = computed(() => Math.max(1, Math.ceil(tickets.value.length / perPage)))
const paginatedTickets = computed(() => {
  const start = (page.value - 1) * perPage
  return tickets.value.slice(start, start + perPage)
})
const pageStart = computed(() => (tickets.value.length ? (page.value - 1) * perPage + 1 : 0))
const pageEnd = computed(() => Math.min(page.value * perPage, tickets.value.length))

const formatStatus = (value: string) => {
  const map: Record<string, string> = {
    open: 'Abierto',
    in_progress: 'En progreso',
    resolved: 'Resuelto',
    closed: 'Cerrado',
  }
  return map[value] || value
}

const badgeClass = (value: string) => {
  const map: Record<string, string> = {
    open: 'bg-amber-100 text-amber-800',
    in_progress: 'bg-sky-100 text-sky-800',
    resolved: 'bg-emerald-100 text-emerald-800',
    closed: 'bg-slate-200 text-slate-800',
  }
  return map[value] || 'bg-slate-200 text-slate-800'
}

const baseDescription = (desc: string) => {
  const [first] = desc.split('[Admin')
  return (first || '').trim()
}

const adminReplies = (desc: string) => {
  const parts = desc.split('[Admin')
  return parts.slice(1).map((p) => p.replace(']', '').trim()).filter(Boolean)
}

const formatDate = (iso: string) => {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleString()
}

const loadTickets = async () => {
  if (!auth.token) return
  loading.value = true
  try {
    tickets.value = await $fetch<TicketItem[]>(`${config.public.apiBase}/support/tickets/`, {
      headers: { Authorization: `Bearer ${auth.token}` },
      params: { store: slug.value },
    })
  } catch (error) {
    console.warn('No se pudieron cargar tickets', error)
    tickets.value = []
  } finally {
    loading.value = false
  }
}

const submit = async () => {
  message.value = ''
  if (!form.value.title.trim() || !form.value.description.trim()) {
    message.value = 'Completa título y descripción'
    return
  }
  sending.value = true
  try {
    await $fetch(`${config.public.apiBase}/support/tickets/`, {
      method: 'POST',
      body: {
        title: form.value.title,
        description: form.value.description,
        priority: form.value.priority,
        store: slug.value,
      },
      headers: auth.token ? { Authorization: `Bearer ${auth.token}` } : {},
    })
    message.value = 'Ticket enviado'
    form.value = { title: '', description: '', priority: 'normal' }
    await loadTickets()
  } catch (error: any) {
    console.error(error)
    message.value = 'Error al enviar el ticket'
  } finally {
    sending.value = false
  }
}

onMounted(async () => {
  if (!auth.isAuthenticated) {
    await navigateTo('/login')
    return
  }
  await loadTickets()
})

watch(() => slug.value, () => loadTickets())

watch(tickets, () => {
  if (page.value > totalPages.value) page.value = totalPages.value
})
definePageMeta({ layout: 'store' })
</script>
