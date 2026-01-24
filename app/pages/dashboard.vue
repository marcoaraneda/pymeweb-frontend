<template>
  <div class="relative min-h-screen bg-slate-950 text-white">
    <div class="pointer-events-none absolute inset-0" aria-hidden="true">
      <div class="absolute -left-10 top-10 h-60 w-60 rounded-full bg-gradient-to-r from-[var(--gradient-from,#111827)] to-[var(--gradient-to,#0b2358)] blur-3xl opacity-70" />
      <div class="absolute -right-10 bottom-10 h-72 w-72 rounded-full bg-gradient-to-r from-[var(--gradient-from,#111827)] to-[var(--gradient-to,#0b2358)] blur-3xl opacity-60" />
    </div>

    <div class="relative z-10 mx-auto max-w-6xl px-6 py-10 space-y-10">
      <header class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p class="text-xs uppercase tracking-[0.2em] text-white/60">Panel</p>
          <h1 class="text-3xl font-extrabold">Dashboard de tiendas</h1>
          <p class="text-white/70">Resumen rápido de tus tiendas, actividad y accesos.</p>
        </div>
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-black/25 transition hover:-translate-y-0.5"
          :style="{ backgroundColor: theme.accent }"
        >
          Ir al marketplace
        </NuxtLink>
      </header>

      <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Tiendas activas" :value="storesMine.length" icon="🏪" :accent="theme.accent" />
        <StatCard title="Visitantes (7d)" :value="analytics.visits" icon="👀" :accent="theme.accent" />
        <StatCard title="Conversiones" :value="analytics.conversions" icon="🛒" :accent="theme.accent" />
        <StatCard title="Tickets abiertos" :value="analytics.support" icon="🎧" :accent="theme.accent" />
      </section>

      <section class="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div class="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs uppercase tracking-[0.2em] text-white/60">Mis tiendas</p>
              <h2 class="text-xl font-semibold">Accesos directos</h2>
            </div>
            <button
              class="rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-black/25 transition hover:-translate-y-0.5"
              :style="{ backgroundColor: theme.accent }"
              @click="refresh"
            >
              Actualizar
            </button>
          </div>

          <div v-if="loading" class="mt-4 text-white/70">Cargando...</div>
          <div v-else-if="storesMine.length === 0" class="mt-4 rounded-2xl border border-dashed border-white/15 bg-white/5 p-5 text-white/70">
            Aún no tienes tiendas asignadas. Pide acceso o crea una nueva desde administración.
          </div>
          <div v-else class="mt-4 grid gap-4 sm:grid-cols-2">
            <StoreCard
              v-for="store in storesMine"
              :key="store.slug"
              :store="store"
              :accent="theme.accent"
              :canDelete="true"
              @delete="confirmDeleteStore"
            />
          </div>
        </div>

        <div class="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
          <p class="text-xs uppercase tracking-[0.2em] text-white/60">Actividad</p>
          <h2 class="text-xl font-semibold">Visitantes recientes</h2>
          <p class="text-white/70">Curva suave para los últimos 7 días</p>

          <div class="mt-6 flex items-end gap-2">
            <div
              v-for="(day, idx) in sparkline"
              :key="idx"
              class="flex-1 rounded-t-xl bg-white/20"
              :style="{ height: `${day}px`, backgroundColor: barColor(idx) }"
            />
          </div>

          <div class="mt-6 flex items-center gap-3 rounded-2xl bg-white/5 p-4 text-white/80">
            <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-lg">💡</span>
            <div>
              <p class="text-sm font-semibold">Tip</p>
              <p class="text-xs text-white/60">Personaliza el color en la home para reflejar tu marca en todos los CTA.</p>
            </div>
          </div>
        </div>
      </section>

      <section class="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs uppercase tracking-[0.2em] text-white/60">Más vendidos</p>
            <h2 class="text-xl font-semibold">Productos con más compras</h2>
          </div>
          <NuxtLink v-if="storesMine[0]" :to="`/store/${storesMine[0].slug}/productos`" class="text-sm font-semibold text-white/80 hover:text-white">Ver catálogo</NuxtLink>
        </div>
        <div v-if="!topProducts.length" class="mt-4 text-white/70">No hay datos aún.</div>
        <div v-else class="mt-4 divide-y divide-white/10">
          <div v-for="prod in topProducts" :key="prod.id" class="flex items-center justify-between py-3 text-white/80">
            <div>
              <p class="font-semibold text-white">{{ prod.name }}</p>
              <p class="text-xs text-white/60">{{ prod.category?.name || 'General' }} • {{ prod.store?.slug || 'tienda' }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm">{{ prod.total_quantity }} ventas</p>
              <p class="text-xs text-white/60">
                <span v-if="prod.offer_price" class="mr-1 line-through opacity-60">${{ prod.price }}</span>
                <span :style="{ color: theme.accent }">${{ prod.offer_price || prod.price }}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="grid gap-4 lg:grid-cols-2">
        <div class="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs uppercase tracking-[0.2em] text-white/60">Pedidos en proceso</p>
              <h2 class="text-xl font-semibold">Pendientes / Preparando / En tránsito</h2>
            </div>
            <span class="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-100">{{ pendingOrders.length }}</span>
          </div>
          <div v-if="!pendingOrders.length" class="mt-4 text-white/70">No hay pedidos en proceso.</div>
          <div v-else class="mt-4 space-y-3">
            <NuxtLink
              v-for="o in pendingPageOrders"
              :key="o.id"
              :to="orderLink(o.id)"
              class="block rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 transition hover:border-white/30"
            >
              <div class="flex items-center justify-between">
                <p class="font-semibold text-white">#{{ o.id }} — {{ o.customer }}</p>
                <span class="text-xs text-white/60">{{ o.date }}</span>
              </div>
              <p class="text-xs text-white/60">Tracking {{ o.tracking || '—' }}</p>
              <div class="mt-1 flex items-center justify-between">
                <span class="font-semibold" :style="{ color: theme.accent }">{{ currency(o.total) }}</span>
                <span :class="['rounded-full px-2 py-0.5 text-[11px] font-semibold', statusBadge(o.status).classes]">{{ statusBadge(o.status).label }}</span>
              </div>
            </NuxtLink>
            <div class="flex items-center justify-between text-xs text-white/70" v-if="pendingTotalPages > 1">
              <button class="rounded-lg border border-white/20 px-3 py-1 hover:border-white/40 disabled:opacity-40" :disabled="pendingPage === 1" @click="pendingPage--">Anterior</button>
              <span>Página {{ pendingPage }} / {{ pendingTotalPages }}</span>
              <button class="rounded-lg border border-white/20 px-3 py-1 hover:border-white/40 disabled:opacity-40" :disabled="pendingPage === pendingTotalPages" @click="pendingPage++">Siguiente</button>
            </div>
          </div>
        </div>

        <div class="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs uppercase tracking-[0.2em] text-white/60">Entregados</p>
              <h2 class="text-xl font-semibold">Llegó a destino / Finalizado</h2>
            </div>
            <span class="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-100">{{ deliveredOrders.length }}</span>
          </div>
          <div v-if="!deliveredOrders.length" class="mt-4 text-white/70">Sin entregas registradas.</div>
          <div v-else class="mt-4 space-y-3">
            <NuxtLink
              v-for="o in deliveredPageOrders"
              :key="o.id"
              :to="orderLink(o.id)"
              class="block rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 transition hover:border-white/30"
            >
              <div class="flex items-center justify-between">
                <p class="font-semibold text-white">#{{ o.id }} — {{ o.customer }}</p>
                <span class="text-xs text-white/60">{{ o.date }}</span>
              </div>
              <p class="text-xs text-white/60">Tracking {{ o.tracking || '—' }}</p>
              <div class="mt-1 flex items-center justify-between">
                <span class="font-semibold" :style="{ color: theme.accent }">{{ currency(o.total) }}</span>
                <span :class="['rounded-full px-2 py-0.5 text-[11px] font-semibold', statusBadge(o.status).classes]">{{ statusBadge(o.status).label }}</span>
              </div>
            </NuxtLink>
            <div class="flex items-center justify-between text-xs text-white/70" v-if="deliveredTotalPages > 1">
              <button class="rounded-lg border border-white/20 px-3 py-1 hover:border-white/40 disabled:opacity-40" :disabled="deliveredPage === 1" @click="deliveredPage--">Anterior</button>
              <span>Página {{ deliveredPage }} / {{ deliveredTotalPages }}</span>
              <button class="rounded-lg border border-white/20 px-3 py-1 hover:border-white/40 disabled:opacity-40" :disabled="deliveredPage === deliveredTotalPages" @click="deliveredPage++">Siguiente</button>
            </div>
          </div>
        </div>
      </section>

      <section class="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs uppercase tracking-[0.2em] text-white/60">Soporte</p>
            <h2 class="text-xl font-semibold">Tickets</h2>
          </div>
          <span class="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">{{ tickets.length }}</span>
        </div>
        <div v-if="loadingTickets" class="mt-4 text-white/70">Cargando tickets...</div>
        <div v-else-if="!tickets.length" class="mt-4 text-white/70">No hay tickets abiertos.</div>
        <div v-else class="mt-4 divide-y divide-white/10">
          <button
            v-for="t in tickets"
            :key="t.id"
            class="w-full py-3 flex items-start justify-between gap-3 text-left transition hover:bg-white/5"
            @click="openTicket(t)"
          >
            <div class="space-y-1">
              <p class="text-sm font-semibold text-white">{{ t.title }}</p>
              <p class="text-xs text-white/60">{{ t.store_slug || 'Sin tienda' }} • Prioridad {{ t.priority }}</p>
              <p class="text-sm text-white/80 line-clamp-2">{{ t.description }}</p>
            </div>
            <span :class="['rounded-full px-3 py-1 text-[11px] font-semibold', ticketBadge(t.status).classes]">{{ ticketBadge(t.status).label }}</span>
          </button>
        </div>
      </section>

      <div v-if="showTicketModal" class="fixed inset-0 z-30 flex items-center justify-center bg-black/50 px-4 py-6">
        <div class="relative w-full max-w-2xl rounded-3xl bg-slate-900 p-6 shadow-2xl border border-white/10">
          <button class="absolute right-4 top-4 text-white/70 hover:text-white" @click="closeTicket">✕</button>
          <p class="text-xs uppercase tracking-[0.2em] text-white/60">Ticket</p>
          <h3 class="text-2xl font-semibold text-white">{{ selectedTicket?.title }}</h3>
          <p class="text-sm text-white/70 mt-1">{{ selectedTicket?.store_slug || 'Sin tienda' }}</p>

          <div class="mt-4 grid gap-4 md:grid-cols-2">
            <div class="space-y-2">
              <label class="text-xs text-white/60">Estado</label>
              <select v-model="editStatus" class="w-full rounded-xl border border-white/20 bg-white text-sm text-slate-900 px-3 py-2">
                <option value="open">Abierto</option>
                <option value="in_progress">En progreso</option>
                <option value="resolved">Resuelto</option>
                <option value="closed">Cerrado</option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="text-xs text-white/60">Prioridad</label>
              <select v-model="editPriority" class="w-full rounded-xl border border-white/20 bg-white text-sm text-slate-900 px-3 py-2">
                <option value="low">Baja</option>
                <option value="normal">Normal</option>
                <option value="high">Alta</option>
              </select>
            </div>
          </div>

          <div class="mt-4">
            <p class="text-xs uppercase tracking-[0.2em] text-white/60">Descripción</p>
            <p class="mt-2 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white/80 whitespace-pre-line">{{ selectedTicket?.description }}</p>
          </div>

          <div class="mt-4 space-y-2">
            <label class="text-xs text-white/60">Agregar comentario (visible para el cliente)</label>
            <textarea v-model="newComment" rows="3" class="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white/90" placeholder="Escribe una actualización"></textarea>
          </div>

          <div class="mt-6 flex items-center gap-3">
            <button
              class="rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-black/25 transition hover:-translate-y-0.5 disabled:opacity-60"
              :style="{ backgroundColor: theme.accent }"
              :disabled="savingTicket"
              @click="saveTicket"
            >
              {{ savingTicket ? 'Guardando...' : 'Guardar cambios' }}
            </button>
            <button class="text-sm text-white/70 hover:text-white" @click="closeTicket">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { navigateTo, useRuntimeConfig } from 'nuxt/app'
import StoreCard from '~/components/StoreCard.vue'
import StatCard from '~/components/StatCard.vue'
import { useAuthStore } from '~/stores/auth'
import { useThemeStore } from '~/stores/theme'

type TicketItem = {
  id: number
  title: string
  description: string
  status: string
  priority: string
  store_slug?: string | null
}

const auth = useAuthStore()
const theme = useThemeStore()
const storesMine = ref<{ id: number; name: string; slug: string }[]>([])
const loading = ref(true)
const topProducts = ref<any[]>([])
const orders = ref<any[]>([])
const pendingPage = ref(1)
const deliveredPage = ref(1)
const pageSize = 6
const config = useRuntimeConfig()
const deletingStore = ref(false)

type DashboardSummary = {
  active_stores: number
  visits_last_7d: number
  conversions: number
  support_open: number
  pending_products: number
  notifications?: { type: string; message: string; count: number }[]
}

const analytics = ref<{ visits: number; conversions: number; support: number; pending_products: number }>({ visits: 0, conversions: 0, support: 0, pending_products: 0 })
const sparkline = computed(() => [60, 90, 80, 120, 140, 110, 170])
const tickets = ref<TicketItem[]>([])
const loadingTickets = ref(true)
const selectedTicket = ref<TicketItem | null>(null)
const showTicketModal = ref(false)
const editStatus = ref('open')
const editPriority = ref('normal')
const newComment = ref('')
const savingTicket = ref(false)

const barColor = (idx: number) => (idx === sparkline.value.length - 1 ? theme.accent : 'rgba(255,255,255,0.25)')

const pendingOrders = computed(() => orders.value.filter((o) => ['pending', 'preparing', 'in_transit'].includes(o.status)))
const deliveredOrders = computed(() => orders.value.filter((o) => ['delivered', 'completed'].includes(o.status)))

const pendingTotalPages = computed(() => Math.max(1, Math.ceil(pendingOrders.value.length / pageSize)))
const deliveredTotalPages = computed(() => Math.max(1, Math.ceil(deliveredOrders.value.length / pageSize)))

const pendingPageOrders = computed(() => {
  const start = (pendingPage.value - 1) * pageSize
  return pendingOrders.value.slice(start, start + pageSize)
})

const deliveredPageOrders = computed(() => {
  const start = (deliveredPage.value - 1) * pageSize
  return deliveredOrders.value.slice(start, start + pageSize)
})

const statusLabel = (status: string) => {
  const map: Record<string, string> = {
    pending: 'Pendiente',
    preparing: 'Preparando',
    in_transit: 'En tránsito',
    delivered: 'Llegó a destino',
    completed: 'Finalizado',
    cancelled: 'Cancelado',
  }
  return map[status] || status
}

const statusBadge = (status: string) => {
  const map: Record<string, { label: string; classes: string }> = {
    pending: { label: statusLabel('pending'), classes: 'bg-amber-100/70 text-amber-900' },
    preparing: { label: statusLabel('preparing'), classes: 'bg-sky-100/70 text-sky-900' },
    in_transit: { label: statusLabel('in_transit'), classes: 'bg-indigo-100/70 text-indigo-900' },
    delivered: { label: statusLabel('delivered'), classes: 'bg-emerald-100/70 text-emerald-900' },
    completed: { label: statusLabel('completed'), classes: 'bg-slate-200 text-slate-900' },
    cancelled: { label: statusLabel('cancelled'), classes: 'bg-red-100 text-red-700' },
  }
  return map[status] || { label: statusLabel(status), classes: 'bg-white/20 text-white' }
}

const ticketBadge = (status: string) => {
  const map: Record<string, { label: string; classes: string }> = {
    open: { label: 'Abierto', classes: 'bg-amber-500/20 text-amber-100' },
    in_progress: { label: 'En progreso', classes: 'bg-sky-500/20 text-sky-100' },
    resolved: { label: 'Resuelto', classes: 'bg-emerald-500/20 text-emerald-100' },
    closed: { label: 'Cerrado', classes: 'bg-slate-500/20 text-slate-100' },
  }
  return map[status] || { label: status, classes: 'bg-white/10 text-white' }
}

const currency = (value: number) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(Number(value) || 0)

const orderLink = (orderId: number) => {
  const firstStore = storesMine.value[0]
  if (!firstStore) return '#'
  return `/store/${firstStore.slug}/admin/orders/${orderId}`
}

const loadData = async () => {
  loading.value = true
  storesMine.value = await auth.fetchMyStores()
  await Promise.all([loadTopProducts(), loadOrders(), loadSummary(), loadTickets()])
  loading.value = false
}

const confirmDeleteStore = async (store: any) => {
  if (deletingStore.value) return
  const ok = window.confirm(`¿Eliminar la tienda “${store.name}”? Esto la desactivará y ya no estará visible.`)
  if (!ok) return
  deletingStore.value = true
  try {
    await $fetch(`${config.public.apiBase}/stores/${store.slug}/`, {
      method: 'DELETE',
      headers: auth.token ? { Authorization: `Bearer ${auth.token}` } : {},
    })
    await loadData()
    alert('Tienda eliminada')
  } catch (error: any) {
    console.error('No se pudo eliminar', error)
    alert('No se pudo eliminar la tienda (revisa permisos)')
  } finally {
    deletingStore.value = false
  }
}

const loadTopProducts = async () => {
  topProducts.value = []
  const firstStore = storesMine.value[0]
  if (!firstStore || !auth.token) return
  try {
    topProducts.value = await $fetch(`${config.public.apiBase}/orders/store/${firstStore.slug}/top-products/`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    })
  } catch (error) {
    console.warn('No se pudieron cargar los más vendidos')
  }
}

const loadOrders = async () => {
  orders.value = []
  const firstStore = storesMine.value[0]
  if (!firstStore || !auth.token) return
  try {
    orders.value = await $fetch(`${config.public.apiBase}/orders/`, {
      params: { store: firstStore.slug },
      headers: { Authorization: `Bearer ${auth.token}` },
    })
    pendingPage.value = 1
    deliveredPage.value = 1
  } catch (error) {
    console.warn('No se pudieron cargar pedidos')
  }
}

const loadTickets = async () => {
  loadingTickets.value = true
  tickets.value = []
  const firstStore = storesMine.value[0]
  if (!auth.token || !firstStore) {
    loadingTickets.value = false
    return
  }
  try {
    tickets.value = await $fetch<TicketItem[]>(`${config.public.apiBase}/support/tickets/`, {
      headers: { Authorization: `Bearer ${auth.token}` },
      params: { status: 'open', store: firstStore.slug },
    })
  } catch (error) {
    console.warn('No se pudieron cargar tickets', error)
    tickets.value = []
  } finally {
    loadingTickets.value = false
  }
}

const openTicket = (t: any) => {
  selectedTicket.value = { ...t }
  editStatus.value = t.status
  editPriority.value = t.priority
  newComment.value = ''
  showTicketModal.value = true
}

const closeTicket = () => {
  showTicketModal.value = false
  selectedTicket.value = null
}

const saveTicket = async () => {
  if (!selectedTicket.value) return
  savingTicket.value = true
  try {
    const body: Record<string, any> = {
      status: editStatus.value,
      priority: editPriority.value,
    }
    if (newComment.value.trim()) {
      body.description = `${selectedTicket.value.description}\n\n[Admin] ${newComment.value.trim()}`
    }
    const updated = await $fetch<TicketItem>(`${config.public.apiBase}/support/tickets/${selectedTicket.value.id}/`, {
      method: 'PATCH',
      body,
      headers: { Authorization: `Bearer ${auth.token}` },
    })
    // refresh list locally
    tickets.value = tickets.value.map((t) => (t.id === updated.id ? updated : t))
    selectedTicket.value = updated
    newComment.value = ''
    showTicketModal.value = false
  } catch (error) {
    console.error('No se pudo guardar el ticket', error)
  } finally {
    savingTicket.value = false
  }
}

const loadSummary = async () => {
  const firstStore = storesMine.value[0]
  if (!auth.token) return
  try {
    const summary = await $fetch<DashboardSummary>(`${config.public.apiBase}/support/dashboard/summary/`, {
      headers: { Authorization: `Bearer ${auth.token}` },
      params: firstStore ? { store: firstStore.slug } : {},
    })
    analytics.value = {
      visits: summary?.visits_last_7d || 0,
      conversions: summary?.conversions || 0,
      support: summary?.support_open || 0,
      pending_products: summary?.pending_products || 0,
    }
  } catch (error) {
    console.warn('No se pudo cargar el resumen', error)
  }
}

const refresh = async () => {
  await loadData()
}

onMounted(async () => {
  if (!auth.isAuthenticated) {
    await navigateTo('/login')
    return
  }
  await loadData()
  theme.applyTheme()
})
</script>
