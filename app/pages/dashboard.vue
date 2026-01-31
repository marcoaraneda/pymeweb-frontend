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
          <p class="text-white/70">Resumen rápido de tus tiendas, actividad y accesos. Accede al carrito del marketplace desde aquí.</p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <select
            v-model="selectedStore"
            class="rounded-xl border border-white/30 bg-white text-sm text-slate-900 px-3 py-2 focus:border-slate-300 focus:outline-none shadow-sm"
          >
            <option value="all">Todas mis tiendas</option>
            <option v-for="store in storesMine" :key="store.slug" :value="store.slug">{{ store.name }}</option>
          </select>
          <NuxtLink
            :to="cartTarget"
            class="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-black/25 transition hover:-translate-y-0.5"
            :style="{ backgroundColor: theme.accent }"
          >
            Ir al carrito
          </NuxtLink>
        </div>
      </header>

      <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Tiendas activas" :value="storesMine.length" :icon="Building2" :accent="theme.accent" />
        <StatCard title="Visitantes (7d)" :value="analytics.visits" :icon="Eye" :accent="theme.accent" />
        <StatCard title="Conversiones" :value="analytics.conversions" :icon="ShoppingCart" :accent="theme.accent" />
        <StatCard title="Tickets abiertos" :value="analytics.support" :icon="Headset" :accent="theme.accent" />
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

          <div class="mt-6">
            <h3 class="text-lg font-semibold text-white">Reseñas de mis productos</h3>
            <div v-if="ownerReviewsLoading" class="text-white/70 mt-2">Cargando reseñas...</div>
            <div v-else-if="!ownerReviews.length" class="mt-2 text-white/70">No hay reseñas aún.</div>
            <div v-else class="mt-3 space-y-3">
              <article v-for="r in ownerReviews" :key="r.id" class="rounded-xl border border-white/10 bg-white/5 p-3">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <p class="text-sm font-semibold text-white">{{ r.product.name }}</p>
                    <p class="text-xs text-white/70">{{ r.customer_name || 'Anónimo' }} — {{ new Date(r.created_at).toLocaleString() }}</p>
                    <p class="mt-2 text-sm text-white/80">{{ r.comment }}</p>
                  </div>
                  <div class="text-sm text-amber-200 font-semibold">{{ r.rating }} ★</div>
                </div>
              </article>
            </div>
          </div>
          <div class="mt-6 flex items-center gap-3 rounded-2xl bg-white/5 p-4 text-white/80">
            <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-lg">
              <Lightbulb class="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p class="text-sm font-semibold">Tip</p>
              <p class="text-xs text-white/60">Personaliza el color en la home para reflejar tu marca en todos los CTA.</p>
            </div>
          </div>
        </div>
      </section>

      <section class="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="text-xs uppercase tracking-[0.2em] text-white/60">Más vendidos</p>
            <h2 class="text-xl font-semibold">Productos con más compras</h2>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <select
              v-model="topCategoryFilter"
              class="rounded-lg border border-white/20 bg-white text-sm text-slate-900 px-3 py-1 shadow-sm"
            >
              <option value="">Todas las categorías</option>
              <option v-for="cat in topCategories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
            <button
              class="rounded-lg border border-white/15 px-3 py-1 text-sm text-white/80 hover:border-white/40"
              @click="exportTopProducts"
              :disabled="!filteredTopProducts.length"
            >
              Exportar Excel
            </button>
            <NuxtLink v-if="storesMine[0]" :to="`/store/${storesMine[0].slug}/productos`" class="text-sm font-semibold text-white/80 hover:text-white">Ver catálogo</NuxtLink>
          </div>
        </div>
        <div v-if="!topProducts.length" class="mt-4 text-white/70">No hay datos aún.</div>
        <div v-else class="mt-4 divide-y divide-white/10">
          <div v-for="prod in filteredTopProducts" :key="prod.id + (prod.store_slug || prod.store?.slug || '')" class="flex items-center justify-between py-3 text-white/80">
            <div>
              <p class="font-semibold text-white">{{ prod.name }}</p>
              <p class="text-xs text-white/60">{{ prod.category?.name || 'General' }} • {{ prod.store?.slug || prod.store_slug || 'tienda' }}</p>
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
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p class="text-xs uppercase tracking-[0.2em] text-white/60">Pedidos en proceso</p>
              <h2 class="text-xl font-semibold">Pendientes / Preparando / En tránsito</h2>
            </div>
            <div class="flex items-center gap-2">
              <span class="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-100">{{ pendingOrders.length }}</span>
            </div>
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
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p class="text-xs uppercase tracking-[0.2em] text-white/60">Entregados</p>
              <h2 class="text-xl font-semibold">Llegó a destino / Finalizado</h2>
            </div>
            <div class="flex items-center gap-2">
              <span class="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-100">{{ deliveredOrders.length }}</span>
            </div>
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
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="text-xs uppercase tracking-[0.2em] text-white/60">Comentarios</p>
            <h2 class="text-xl font-semibold">Lo que dicen los clientes</h2>
          </div>
          <button
            class="inline-flex items-center gap-2 rounded-2xl border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 hover:text-white"
            @click="loadRecentReviews"
          >
            <MessageSquare class="h-4 w-4" aria-hidden="true" />
            Actualizar
          </button>
        </div>
        <div v-if="loadingReviews" class="mt-4 text-white/70">Cargando comentarios...</div>
        <div v-else-if="!recentReviews.length" class="mt-4 text-white/70">Aún no hay reseñas registradas en tus tiendas.</div>
        <div v-else class="mt-4 space-y-3">
          <NuxtLink
            v-for="review in recentReviews"
            :key="review.id + review.created_at"
            :to="review.product_slug ? `/store/${review.store_slug}/productos/${review.product_slug}` : `/store/${review.store_slug}`"
            class="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 transition hover:border-white/40"
          >
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p class="text-white font-semibold">{{ review.product_name || 'Producto' }}</p>
                <p class="text-xs text-white/60">{{ review.customer_name || 'Cliente' }} • {{ review.store_slug }}</p>
              </div>
              <div class="flex items-center gap-1 text-amber-300">
                <StarIcon
                  v-for="star in 5"
                  :key="`${review.id}-star-${star}`"
                  class="h-4 w-4"
                  :class="star <= Number(review.rating) ? 'text-amber-400 fill-amber-400 stroke-amber-400' : 'text-white/30 fill-transparent stroke-white/40'"
                />
              </div>
            </div>
            <p class="mt-2 text-white/80">{{ review.comment }}</p>
            <p class="text-[11px] text-white/50">{{ new Date(review.created_at).toLocaleString() }}</p>
          </NuxtLink>
        </div>
      </section>

      <section class="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p class="text-xs uppercase tracking-[0.2em] text-white/60">Soporte</p>
            <h2 class="text-xl font-semibold">Tickets</h2>
          </div>
          <div class="flex items-center gap-2">
            <span class="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">{{ tickets.length }}</span>
          </div>
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
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { navigateTo, useRuntimeConfig } from 'nuxt/app'
import StoreCard from '~/components/StoreCard.vue'
import StatCard from '~/components/StatCard.vue'
import { Building2, Eye, ShoppingCart, Headset, Lightbulb, MessageSquare, Star as StarIcon } from 'lucide-vue-next'
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
const selectedStore = ref<'all' | string>('all')
const loading = ref(true)
const topProducts = ref<any[]>([])
const topCategoryFilter = ref('')
const orders = ref<any[]>([])
const pendingPage = ref(1)
const deliveredPage = ref(1)
const pageSize = 6
const config = useRuntimeConfig()
const apiBase = String(config.public.apiBase || '')
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
const cartTarget = computed(() => {
  if (selectedStore.value && selectedStore.value !== 'all') {
    return `/store/${selectedStore.value}/carrito`
  }
  const firstStore = storesMine.value[0]
  if (firstStore?.slug) {
    return `/store/${firstStore.slug}/carrito`
  }
  // Fallback si no hay tiendas asignadas
  return '/marketplace/carrito'
})
const topCategories = computed(() => {
  const set = new Set<string>()
  topProducts.value.forEach((p: any) => {
    const name = p.category?.name || p.category_name
    if (name) set.add(name)
  })
  return Array.from(set).sort((a, b) => a.localeCompare(b))
})
const filteredTopProducts = computed(() => {
  if (!topCategoryFilter.value) return topProducts.value
  return topProducts.value.filter((p: any) => (p.category?.name || p.category_name) === topCategoryFilter.value)
})
const tickets = ref<TicketItem[]>([])
const loadingTickets = ref(true)
const selectedTicket = ref<TicketItem | null>(null)
const showTicketModal = ref(false)
const editStatus = ref('open')
const editPriority = ref('normal')
const newComment = ref('')
const savingTicket = ref(false)
const recentReviews = ref<ReviewFeedItem[]>([])
const loadingReviews = ref(false)
const REVIEW_EVENT = 'pymeweb:review-created'

type OwnerReview = {
  id: number | string
  rating: number
  comment: string
  customer_name: string
  created_at: string
  product: { name: string; slug?: string }
}

const ownerReviews = ref<OwnerReview[]>([])
const ownerReviewsLoading = ref(false)

const loadOwnerReviews = async () => {
  if (!auth.token) {
    ownerReviews.value = []
    return
  }
  ownerReviewsLoading.value = true
  const params: Record<string, any> = {}
  if (selectedStore.value !== 'all') params.store = selectedStore.value
  try {
    ownerReviews.value = await $fetch<OwnerReview[]>(`${apiBase}/resenas/owner/reviews/` as any, {
      headers: { Authorization: `Bearer ${auth.token}` },
      params,
    })
  } catch (error) {
    console.warn('No se pudieron cargar reseñas del dueño', error)
    ownerReviews.value = []
  } finally {
    ownerReviewsLoading.value = false
  }
}

type ReviewFeedItem = {
  id: number | string
  rating: number
  comment: string
  customer_name: string
  created_at: string
  store_slug: string
  product_slug?: string
  product_name?: string
  status?: string
}

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
  const slugFromFilter = selectedStore.value !== 'all' ? selectedStore.value : undefined
  const slug = slugFromFilter || firstStore?.slug
  return slug ? `/store/${slug}/admin/orders/${orderId}` : '#'
}

const loadData = async () => {
  loading.value = true
  storesMine.value = await auth.fetchMyStores()
  if (storesMine.value.length && selectedStore.value === 'all') {
    selectedStore.value = 'all'
  }
  await Promise.all([loadTopProducts(), loadOrders(), loadSummary(), loadTickets(), loadRecentReviews(), loadOwnerReviews()])
  loading.value = false
}

const confirmDeleteStore = async (store: any) => {
  if (deletingStore.value) return
  const ok = window.confirm(`¿Eliminar la tienda “${store.name}”? Esto la desactivará y ya no estará visible.`)
  if (!ok) return
  deletingStore.value = true
  try {
    await $fetch(`${apiBase}/stores/${store.slug}/` as any, {
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
  if (!auth.token || !storesMine.value.length) return

  // If filtering by a specific store, fetch its top products. If "all", merge top lists across stores.
  const targetSlugs = (selectedStore.value === 'all' ? storesMine.value.map((s) => s.slug) : [selectedStore.value]).filter(
    (slug): slug is string => typeof slug === 'string' && slug.length > 0
  )
  if (!targetSlugs.length) return

  try {
    const results = await Promise.all(
      targetSlugs.map((slug) =>
        $fetch(`${apiBase}/orders/store/${slug}/top-products/` as any, {
          headers: { Authorization: `Bearer ${auth.token}` },
        }).catch(() => [])
      )
    )

    const merged: Record<string, any> = {}
    results.flat().forEach((prod: any) => {
      const storeSlug = prod.store?.slug || prod.store_slug || 'na'
      const key = `${storeSlug}-${prod.id}`
      if (!merged[key]) {
        merged[key] = { ...prod, store_slug: storeSlug }
      } else {
        merged[key].total_quantity = (merged[key].total_quantity || 0) + (prod.total_quantity || 0)
      }
    })

    topProducts.value = Object.values(merged).sort((a: any, b: any) => (b.total_quantity || 0) - (a.total_quantity || 0))
  } catch (error) {
    console.warn('No se pudieron cargar los más vendidos')
  }
}

const loadOrders = async () => {
  orders.value = []
  if (!auth.token || !storesMine.value.length) return
  const params: Record<string, any> = {}
  if (selectedStore.value !== 'all') params.store = selectedStore.value
  try {
    orders.value = await $fetch<any[]>(`${apiBase}/orders/` as any, {
      params,
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
  if (!auth.token) {
    loadingTickets.value = false
    return
  }
  const params: Record<string, any> = { status: 'open' }
  if (selectedStore.value !== 'all') params.store = selectedStore.value
  try {
    tickets.value = await $fetch<TicketItem[]>(`${apiBase}/support/tickets/` as any, {
      headers: { Authorization: `Bearer ${auth.token}` },
      params,
    })
  } catch (error) {
    console.warn('No se pudieron cargar tickets', error)
    tickets.value = []
  } finally {
    loadingTickets.value = false
  }
}

const loadRecentReviews = async () => {
  if (!auth.token) {
    recentReviews.value = []
    return
  }
  loadingReviews.value = true
  const params: Record<string, any> = {}
  if (selectedStore.value !== 'all') params.store = selectedStore.value
  try {
    // Primary: try support dashboard reviews endpoint
    recentReviews.value = await $fetch<ReviewFeedItem[]>(`${apiBase}/support/dashboard/reviews/` as any, {
      headers: { Authorization: `Bearer ${auth.token}` },
      params,
    })
  } catch (error) {
    console.warn('No se pudieron cargar reseñas desde support dashboard, intentando owner endpoint', error)
    // Fallback: try owner-aggregated reviews endpoint (created in backend)
    try {
      recentReviews.value = await $fetch<ReviewFeedItem[]>(`${apiBase}/resenas/owner/reviews/` as any, {
        headers: { Authorization: `Bearer ${auth.token}` },
        params,
      })
    } catch (err2) {
      console.warn('No se pudieron cargar reseñas desde owner endpoint', err2)
      recentReviews.value = []
    }
  } finally {
    loadingReviews.value = false
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
    const updated = await $fetch<TicketItem>(`${apiBase}/support/tickets/${selectedTicket.value.id}/` as any, {
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
  if (!auth.token) return
  const params: Record<string, any> = {}
  if (selectedStore.value !== 'all') params.store = selectedStore.value
  try {
    const summary = await $fetch<DashboardSummary>(`${apiBase}/support/dashboard/summary/` as any, {
      headers: { Authorization: `Bearer ${auth.token}` },
      params,
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

const exportCsv = (filename: string, rows: Record<string, any>[], headers: { key: string; label: string }[]) => {
  if (!rows.length) return
  const csvRows = []
  csvRows.push(headers.map((h) => '"' + (h.label || '').replace(/"/g, '""') + '"').join(','))
  rows.forEach((row) => {
    csvRows.push(
      headers
        .map((h) => {
          const val = row[h.key] ?? ''
          return '"' + String(val).replace(/"/g, '""') + '"'
        })
        .join(',')
    )
  })
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
}

const exportTopProducts = () => {
  exportCsv('top-products', filteredTopProducts.value, [
    { key: 'name', label: 'Producto' },
    { key: 'store_slug', label: 'Tienda' },
    { key: 'total_quantity', label: 'Ventas' },
    { key: 'price', label: 'Precio' },
    { key: 'offer_price', label: 'Oferta' },
  ])
}

onMounted(async () => {
  if (!auth.isAuthenticated) {
    await navigateTo('/login')
    return
  }
  await loadData()
  theme.applyTheme()
  if (process.client) {
    window.addEventListener(REVIEW_EVENT, handleReviewEvent as EventListener)
  }
})

const handleReviewEvent = () => {
  if (!auth.isAuthenticated) return
  loadRecentReviews()
}

onBeforeUnmount(() => {
  if (process.client) {
    window.removeEventListener(REVIEW_EVENT, handleReviewEvent as EventListener)
  }
})

watch(selectedStore, async () => {
  pendingPage.value = 1
  deliveredPage.value = 1
  await Promise.all([loadTopProducts(), loadOrders(), loadSummary(), loadTickets(), loadRecentReviews(), loadOwnerReviews()])
})
</script>
