<template>
  <ClientOnly>
    <NuxtPage v-if="!isDashboardRoot" />
    <div v-else class="relative min-h-screen bg-slate-950 text-white">
    <div class="pointer-events-none absolute inset-0" aria-hidden="true">
      <div class="absolute -left-10 top-10 h-60 w-60 rounded-full bg-gradient-to-r from-[var(--gradient-from,#111827)] to-[var(--gradient-to,#0b2358)] blur-3xl opacity-70" />
      <div class="absolute -right-10 bottom-10 h-72 w-72 rounded-full bg-gradient-to-r from-[var(--gradient-from,#111827)] to-[var(--gradient-to,#0b2358)] blur-3xl opacity-60" />
    </div>

    <div class="relative z-10 mx-auto max-w-6xl px-6 py-10 space-y-10">
      <nav class="flex flex-wrap items-center justify-center gap-2">
        <NuxtLink
          v-for="link in dashboardLinks"
          :key="link.to"
          :to="link.to"
          class="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-lg"
          :class="route.path === link.to ? 'ring-2 ring-white/40' : ''"
          :style="{ background: link.color }"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>

      <header class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p class="text-xs uppercase tracking-[0.2em] text-white/60">Panel</p>
          <h1 class="text-3xl font-extrabold">Dashboard de tiendas</h1>
          <p class="text-white/70">Resumen rápido de tus tiendas, actividad y accesos. Revisa todas tus notificaciones desde aquí.</p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <select
            v-model="selectedStore"
            class="rounded-xl border border-white/30 bg-white text-sm text-slate-900 px-3 py-2 focus:border-slate-300 focus:outline-none shadow-sm"
          >
            <option disabled value="">Selecciona una tienda</option>
            <option v-for="store in storesMine" :key="store.slug" :value="store.slug">{{ store.name }}</option>
          </select>
          <NuxtLink
            to="/notificaciones"
            class="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-black/25 transition hover:-translate-y-0.5"
            :style="{ backgroundColor: theme.accent }"
          >
            Ver todas las notificaciones
          </NuxtLink>
        </div>
      </header>

      <Transition name="fade">
        <div
          v-if="toast"
          class="fixed left-1/2 top-6 sm:top-8 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl px-4 py-3 text-sm font-semibold shadow-lg"
          :class="toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'"
        >
          {{ toast.text }}
        </div>
      </Transition>

      <div v-if="loadError" class="rounded-2xl border border-red-400/40 bg-red-500/15 px-4 py-3 text-sm text-red-100">
        {{ loadError }}
      </div>

      <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <template v-if="statsLoading">
          <div v-for="n in 4" :key="n" class="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div class="h-4 w-32 rounded bg-white/20 animate-pulse" />
            <div class="mt-3 h-7 w-16 rounded bg-white/30 animate-pulse" />
            <div class="mt-3 h-6 w-24 rounded bg-white/10 animate-pulse" />
          </div>
        </template>
        <template v-else>
          <StatCard title="Pedidos totales" :value="analytics.totalOrders" :icon="ShoppingCart" :accent="theme.accent" />
          <StatCard title="Pedidos pagados" :value="analytics.paidOrders" :icon="Eye" :accent="theme.accent" />
          <StatCard title="Ingresos" :value="currency(analytics.revenue)" :icon="Building2" :accent="theme.accent" />
          <StatCard title="Ticket promedio" :value="currency(analytics.avgTicket)" :icon="Headset" :accent="theme.accent" />
        </template>
      </section>

      <section class="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div class="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs uppercase tracking-[0.2em] text-white/60">Mis tiendas</p>
              <h2 class="text-xl font-semibold">Accesos directos</h2>
            </div>
            <button
              class="rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-black/25 transition hover:-translate-y-0.5 disabled:opacity-60"
              :style="{ backgroundColor: theme.accent }"
              :disabled="loading"
              @click="refresh(true)"
            >
              <span v-if="loading">Actualizando...</span>
              <span v-else>Actualizar</span>
            </button>
          </div>

          <div v-if="loading" class="mt-4 grid gap-4 sm:grid-cols-2">
            <div v-for="n in 2" :key="n" class="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div class="h-4 w-32 rounded bg-white/20 animate-pulse" />
              <div class="mt-2 h-3 w-24 rounded bg-white/10 animate-pulse" />
              <div class="mt-4 h-28 w-full rounded-xl bg-white/5 animate-pulse" />
            </div>
          </div>
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
          <h2 class="text-xl font-semibold">Ventas diarias</h2>
          <p class="text-white/70">Pedidos y montos agregados por día</p>

          <div class="mt-6 flex items-end gap-2" v-if="sparklineBars.length">
            <div
              v-for="(day, idx) in sparklineBars"
              :key="idx"
              class="flex-1 rounded-t-xl bg-white/20"
              :style="{ height: `${day}px`, backgroundColor: barColor(idx) }"
            />
          </div>
          <div v-else class="mt-6 h-24 rounded-2xl border border-white/10 bg-white/5" />

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
            <button
              class="rounded-lg border border-white/15 px-3 py-1 text-sm text-white/80 hover:border-white/40"
              @click="exportTopProducts"
              :disabled="!topProducts.length"
            >
              Exportar Excel
            </button>
            <NuxtLink v-if="storesMine[0]" :to="`/store/${storesMine[0].slug}/productos`" class="text-sm font-semibold text-white/80 hover:text-white">Ver catálogo</NuxtLink>
          </div>
        </div>
        <div v-if="topLoading" class="mt-4 space-y-3">
          <div v-for="n in 3" :key="n" class="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
            <div class="space-y-2">
              <div class="h-4 w-40 rounded bg-white/20 animate-pulse" />
              <div class="h-3 w-28 rounded bg-white/10 animate-pulse" />
            </div>
            <div class="space-y-2 text-right">
              <div class="h-4 w-16 rounded bg-white/20 animate-pulse ml-auto" />
              <div class="h-3 w-24 rounded bg-white/10 animate-pulse ml-auto" />
            </div>
          </div>
        </div>
        <div v-else-if="!topProducts.length" class="mt-4 text-white/70">No hay datos aún.</div>
        <div v-else class="mt-4 divide-y divide-white/10">
          <div v-for="prod in topProducts" :key="prod.id + (prod.store_slug || prod.store?.slug || '')" class="flex items-center justify-between py-3 text-white/80">
            <div>
              <p class="font-semibold text-white">{{ prod.name }}</p>
              <p class="text-xs text-white/60">{{ prod.store_slug || 'tienda' }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm">{{ prod.total_quantity }} ventas</p>
              <p class="text-xs text-white/60">Ingresos ${{ prod.revenue || '0' }}</p>
            </div>
          </div>
        </div>
      </section>

      <section class="grid gap-4 lg:grid-cols-2">
        <div class="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p class="text-xs uppercase tracking-[0.2em] text-white/60">Pedidos en proceso</p>
              <h2 class="text-xl font-semibold">Pendientes</h2>
            </div>
            <div class="flex items-center gap-2">
              <span class="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-100">{{ pendingOrders.length }}</span>
            </div>
          </div>
          <div v-if="ordersLoading" class="mt-4 space-y-3">
            <div v-for="n in 3" :key="n" class="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div class="flex items-center justify-between">
                <div class="h-4 w-32 rounded bg-white/20 animate-pulse" />
                <div class="h-3 w-20 rounded bg-amber-200/40 animate-pulse" />
              </div>
              <div class="mt-2 h-3 w-24 rounded bg-white/10 animate-pulse" />
            </div>
          </div>
          <div v-else-if="!pendingOrders.length" class="mt-4 text-white/70">No hay pedidos en proceso.</div>
          <div v-else class="mt-4 space-y-3">
            <NuxtLink
              v-for="o in pendingPageOrders"
              :key="o.id"
              :to="orderLink(o.id)"
              class="block rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 transition hover:border-white/30"
            >
              <div class="flex items-center justify-between">
                <p class="font-semibold text-white">#{{ o.id }} — {{ o.name || 'Cliente' }}</p>
                <span class="text-xs text-white/60">{{ formatDate(o.created_at) }}</span>
              </div>
              <p class="text-xs text-white/60">{{ o.store_slug || 'tienda' }}</p>
              <div class="mt-2 flex flex-wrap items-center justify-between gap-2">
                <span class="font-semibold" :style="{ color: theme.accent }">{{ currency(o.total) }}</span>
                <div class="flex items-center gap-2">
                  <span :class="['rounded-full px-2 py-0.5 text-[11px] font-semibold', statusBadge(o.status).classes]">{{ statusBadge(o.status).label }}</span>
                  <select
                    class="rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-[11px] text-white"
                    :value="o.status"
                    @change="(e) => updateOrderStatus(o.id, (e.target as HTMLSelectElement).value)"
                  >
                    <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                  </select>
                </div>
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
              <h2 class="text-xl font-semibold">Productos finalizados</h2>
            </div>
            <div class="flex items-center gap-2">
              <span class="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-100">{{ deliveredOrders.length }}</span>
            </div>
          </div>
          <div v-if="ordersLoading" class="mt-4 space-y-3">
            <div v-for="n in 3" :key="n" class="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div class="flex items-center justify-between">
                <div class="h-4 w-32 rounded bg-white/20 animate-pulse" />
                <div class="h-3 w-20 rounded bg-emerald-200/40 animate-pulse" />
              </div>
              <div class="mt-2 h-3 w-24 rounded bg-white/10 animate-pulse" />
            </div>
          </div>
          <div v-else-if="!deliveredOrders.length" class="mt-4 text-white/70">No hay pedidos entregados.</div>
          <div v-else class="mt-4 space-y-3">
            <NuxtLink
              v-for="o in deliveredPageOrders"
              :key="o.id"
              :to="orderLink(o.id)"
              class="block rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 transition hover:border-white/30"
            >
              <div class="flex items-center justify-between">
                <p class="font-semibold text-white">#{{ o.id }} — {{ o.name || 'Cliente' }}</p>
                <span class="text-xs text-white/60">{{ formatDate(o.created_at) }}</span>
              </div>
              <p class="text-xs text-white/60">{{ o.store_slug || 'tienda' }}</p>
              <div class="mt-2 flex flex-wrap items-center justify-between gap-2">
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
            @click="loadRecentReviews(true)"
          >
            <MessageSquare class="h-4 w-4" aria-hidden="true" />
            Actualizar
          </button>
        </div>
        <div v-if="loadingReviews" class="mt-4 space-y-3">
          <div v-for="n in 3" :key="n" class="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div class="flex items-center justify-between">
              <div class="h-4 w-32 rounded bg-white/20 animate-pulse" />
              <div class="h-4 w-16 rounded bg-amber-200/30 animate-pulse" />
            </div>
            <div class="mt-2 h-3 w-40 rounded bg-white/10 animate-pulse" />
            <div class="mt-1 h-3 w-52 rounded bg-white/10 animate-pulse" />
          </div>
        </div>
        <div v-else-if="!recentReviews.length" class="mt-4 text-white/70">Aún no hay reseñas registradas en tus tiendas.</div>
        <div v-else class="mt-4 space-y-3">
          <div
            v-for="review in recentReviews"
            :key="review.id + review.created_at"
            class="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80"
          >
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p class="text-white font-semibold">Producto {{ review.product || '—' }}</p>
                <p class="text-xs text-white/60">{{ review.customer_name || 'Cliente' }} • {{ review.store_slug }}</p>
              </div>
              <div class="flex items-center gap-1 text-amber-300">
                <StarIcon
                  v-for="star in 5"
                  :key="star"
                  class="h-4 w-4"
                  :class="star <= Number(review.rating) ? 'text-amber-400 fill-amber-400 stroke-amber-400' : 'text-white/30 fill-transparent stroke-white/40'"
                />
              </div>
            </div>
            <p class="mt-2 text-white/80">{{ review.comment }}</p>
            <p class="text-[11px] text-white/50">{{ new Date(review.created_at).toLocaleString() }}</p>
          </div>
        </div>
      </section>

      <section v-if="false" class="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p class="text-xs uppercase tracking-[0.2em] text-white/60">Soporte</p>
            <h2 class="text-xl font-semibold">Tickets</h2>
          </div>
          <div class="flex items-center gap-2">
            <span class="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">{{ tickets.length }}</span>
          </div>
        </div>
        <div v-if="loadingTickets" class="mt-4 space-y-3">
          <div v-for="n in 3" :key="n" class="rounded-2xl border border-white/10 bg-white/5 p-3">
            <div class="h-4 w-48 rounded bg-white/20 animate-pulse" />
            <div class="mt-2 h-3 w-32 rounded bg-white/10 animate-pulse" />
            <div class="mt-2 h-3 w-40 rounded bg-white/10 animate-pulse" />
          </div>
        </div>
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
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { navigateTo, useRuntimeConfig } from 'nuxt/app'
import { useRoute } from 'vue-router'
import StoreCard from '~/components/StoreCard.vue'
import StatCard from '~/components/StatCard.vue'
import { Building2, Eye, ShoppingCart, Headset, Lightbulb, MessageSquare, Star as StarIcon } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useThemeStore } from '~/stores/theme'
import { useDashboardAccess } from '~/composables/useDashboardAccess'

definePageMeta({ middleware: ['auth'], requiresAuth: true, ssr: false })

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
const route = useRoute()
const isDashboardRoot = computed(() => route.path === '/dashboard')
const { dashboardLinks } = useDashboardAccess()
const storesMine = ref<{ id: number; name: string; slug: string }[]>([])
const selectedStore = ref('')
const loading = ref(true)
const loadError = ref('')
const toast = ref<{ text: string; type: 'success' | 'error' } | null>(null)
let toastTimer: ReturnType<typeof setTimeout> | null = null
const topProducts = ref<any[]>([])
const topLoading = ref(true)
const orders = ref<any[]>([])
const ordersLoading = ref(true)
const pendingPage = ref(1)
const deliveredPage = ref(1)
const pendingPageSize = 6
const deliveredPageSize = 10
const config = useRuntimeConfig()
const apiBase = String(config.public.apiBase || '')
const deletingStore = ref(false)
const statusOptions = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'preparing', label: 'Preparando' },
  { value: 'in_transit', label: 'En tránsito' },
  { value: 'delivered', label: 'Listo / Entregado' },
  { value: 'completed', label: 'Finalizado' },
  { value: 'cancelled', label: 'Cancelado' },
]

const authedFetch = async <T>(url: string, options: Record<string, any> = {}) => {
  if (!auth.token) throw new Error('No autenticado')
  const doFetch = (token: string) =>
    $fetch<T>(url as any, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
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

const ensureAuthReady = async () => {
  return Boolean(await auth.initializeSession({ forceProfile: true }))
}

type DashboardSummary = {
  total_orders: number
  paid_orders: number
  total_revenue: number
  avg_ticket: number
  status_counts?: Record<string, number>
}

const analytics = ref<{ totalOrders: number; paidOrders: number; revenue: number; avgTicket: number }>({ totalOrders: 0, paidOrders: 0, revenue: 0, avgTicket: 0 })
const statsLoading = ref(true)
const dailyStats = ref<{ day: string; orders: number; revenue: number }[]>([])
const dailyLoading = ref(true)
const sparklineBars = computed(() => {
  const values = dailyStats.value.map((d) => Number(d.revenue) || Number(d.orders) || 0)
  if (!values.length) return []
  const max = Math.max(...values, 1)
  return values.map((v) => 24 + Math.round((v / max) * 120))
})
const showToast = (text: string, type: 'success' | 'error' = 'success') => {
  toast.value = { text, type }
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = null), 3200)
}
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

type ReviewFeedItem = {
  id: number | string
  rating: number
  comment: string
  customer_name: string
  created_at: string
  store_slug: string
  product?: number
  status?: string
}

const barColor = (idx: number) => (idx === sparklineBars.value.length - 1 ? theme.accent : 'rgba(255,255,255,0.25)')

const pendingOrders = computed(() => orders.value.filter((o) => ['pending', 'preparing', 'in_transit'].includes(o.status)))
const deliveredOrders = computed(() => orders.value.filter((o) => ['completed', 'delivered', 'paid'].includes(o.status)))

const pendingTotalPages = computed(() => Math.max(1, Math.ceil(pendingOrders.value.length / pendingPageSize)))
const deliveredTotalPages = computed(() => Math.max(1, Math.ceil(deliveredOrders.value.length / deliveredPageSize)))

const pendingPageOrders = computed(() => {
  const start = (pendingPage.value - 1) * pendingPageSize
  return pendingOrders.value.slice(start, start + pendingPageSize)
})

const deliveredPageOrders = computed(() => {
  const start = (deliveredPage.value - 1) * deliveredPageSize
  return deliveredOrders.value.slice(start, start + deliveredPageSize)
})

const statusLabel = (status: string) => {
  const map: Record<string, string> = {
    pending: 'Pendiente',
    preparing: 'Preparando',
    in_transit: 'En tránsito',
    delivered: 'Listo / Entregado',
    completed: 'Finalizado',
    paid: 'Pagado',
    cancelled: 'Cancelado',
  }
  return map[status] || status
}

const statusBadge = (status: string) => {
  const map: Record<string, { label: string; classes: string }> = {
    pending: { label: statusLabel('pending'), classes: 'bg-amber-100/70 text-amber-900' },
    preparing: { label: statusLabel('preparing'), classes: 'bg-amber-100/70 text-amber-900' },
    in_transit: { label: statusLabel('in_transit'), classes: 'bg-sky-100/80 text-sky-900' },
    delivered: { label: statusLabel('delivered'), classes: 'bg-emerald-100/70 text-emerald-900' },
    completed: { label: statusLabel('completed'), classes: 'bg-emerald-100/70 text-emerald-900' },
    paid: { label: statusLabel('paid'), classes: 'bg-emerald-100/70 text-emerald-900' },
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

const formatDate = (value?: string | Date) => {
  if (!value) return '—'
  const date = typeof value === 'string' ? new Date(value) : value
  return date.toLocaleString()
}

const orderLink = (orderId: number) => {
  const firstStore = storesMine.value[0]
  const slug = selectedStore.value || firstStore?.slug
  return slug ? `/store/${slug}/admin/orders/${orderId}` : '#'
}

const loadData = async () => {
  loading.value = true
  loadError.value = ''
  let success = true
  try {
    storesMine.value = await auth.fetchMyStores()
    if (!storesMine.value.length) {
      loadError.value = 'No tienes tiendas asignadas. Debes tener al menos una para ver el dashboard.'
      return false
    }
    if (!selectedStore.value || !storesMine.value.find((s) => s.slug === selectedStore.value)) {
      selectedStore.value = storesMine.value[0].slug
    }
    await Promise.all([loadOrders(), loadSummary(), loadDailyStats(), loadRecentReviews()])
  } catch (error) {
    console.error('No se pudo cargar el dashboard', error)
    loadError.value = 'No se pudo cargar el dashboard. Intenta actualizar.'
    success = false
  } finally {
    loading.value = false
  }
  return success
}

const confirmDeleteStore = async (store: any) => {
  if (deletingStore.value) return
  const ok = window.confirm(`¿Eliminar la tienda “${store.name}”? Esto la desactivará y ya no estará visible.`)
  if (!ok) return
  deletingStore.value = true
  try {
    await authedFetch(`${apiBase}/stores/${store.slug}/`, {
      method: 'DELETE',
    })
    await loadData()
    showToast('Tienda eliminada', 'success')
  } catch (error: any) {
    console.error('No se pudo eliminar', error)
    showToast('No se pudo eliminar la tienda (revisa permisos)', 'error')
  } finally {
    deletingStore.value = false
  }
}

const rebuildTopProductsFromOrders = (ordersList: any[]) => {
  const aggregated: Record<string, any> = {}
  ordersList.forEach((order) => {
    const storeSlug = order.store_slug || order.store?.slug || 'tienda'
    ;(order.items || []).forEach((item: any) => {
      const key = `${storeSlug}-${item.product}`
      const qty = Number(item.quantity) || 0
      const revenue = (Number(item.price) || 0) * qty
      if (!aggregated[key]) {
        aggregated[key] = {
          id: item.product,
          name: item.product_name || `Producto ${item.product}`,
          store_slug: storeSlug,
          total_quantity: 0,
          revenue: 0,
        }
      }
      aggregated[key].total_quantity += qty
      aggregated[key].revenue = Number((aggregated[key].revenue || 0) + revenue)
    })
  })
  topProducts.value = Object.values(aggregated).sort((a: any, b: any) => (b.total_quantity || 0) - (a.total_quantity || 0)).slice(0, 10)
}

const loadTopProducts = async () => {
  topLoading.value = true
  try {
    rebuildTopProductsFromOrders(orders.value)
  } finally {
    topLoading.value = false
  }
}

const loadOrders = async () => {
  ordersLoading.value = true
  topLoading.value = true
  orders.value = []
  if (!auth.token || !storesMine.value.length || !selectedStore.value) {
    ordersLoading.value = false
    return
  }
  const targetSlugs = [selectedStore.value]
  try {
    const collected: any[] = []
    for (const slug of targetSlugs) {
      const list = await authedFetch<any[]>(`${apiBase}/orders/`, { params: { store: slug } }).catch(() => [])
      const detailedIds = list.slice(0, 12).map((o) => o.id)
      const details = await Promise.all(
        detailedIds.map((id) => authedFetch<any>(`${apiBase}/orders/${id}/`).catch(() => null))
      )
      const detailMap = new Map<number, any>()
      details.forEach((d) => {
        if (d?.id) detailMap.set(d.id, d)
      })
      list.forEach((o) => {
        const enriched = detailMap.get(o.id)
        collected.push({ ...o, ...(enriched || {}), store_slug: slug })
      })
    }

    orders.value = collected.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    pendingPage.value = 1
    deliveredPage.value = 1
    rebuildTopProductsFromOrders(orders.value)
    topLoading.value = false
  } catch (error) {
    console.warn('No se pudieron cargar pedidos')
  } finally {
    ordersLoading.value = false
  }
}

const updateOrderStatus = async (orderId: number, status: string) => {
  if (!status || !orderId) return
  try {
    const updated = await authedFetch<any>(`${apiBase}/orders/${orderId}/`, {
      method: 'PATCH',
      body: { status },
    })
    orders.value = orders.value.map((o) => (o.id === orderId ? { ...o, status: updated.status || status } : o))
    rebuildTopProductsFromOrders(orders.value)
    showToast('Estado actualizado', 'success')
  } catch (error) {
    console.error('No se pudo actualizar estado', error)
    showToast('No se pudo actualizar estado', 'error')
  }
}

const loadTickets = async () => {
  loadingTickets.value = true
  tickets.value = []
  if (!auth.token || !selectedStore.value) {
    loadingTickets.value = false
    return
  }
  const params: Record<string, any> = { status: 'open', store: selectedStore.value }
  try {
    tickets.value = await authedFetch<TicketItem[]>(`${apiBase}/support/tickets/`, { params })
  } catch (error) {
    console.warn('No se pudieron cargar tickets', error)
    tickets.value = []
  } finally {
    loadingTickets.value = false
  }
}

const loadRecentReviews = async (notify = false) => {
  if (!auth.token) {
    recentReviews.value = []
    return false
  }
  if (!selectedStore.value) return false
  loadingReviews.value = true
  let success = false
  try {
    const targetSlugs = [selectedStore.value]
    const aggregated: ReviewFeedItem[] = []
    for (const slug of targetSlugs) {
      const rows = await authedFetch<ReviewFeedItem[]>(`${apiBase}/store/${slug}/admin/resenas/reviews/`, { params: {} }).catch(() => [])
      rows.forEach((r: any) => aggregated.push({ ...r, store_slug: slug } as any))
    }
    aggregated.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    recentReviews.value = aggregated.slice(0, 12)
    success = true
  } catch (error) {
    console.warn('No se pudieron cargar reseñas', error)
    recentReviews.value = []
  } finally {
    loadingReviews.value = false
    if (notify) {
      showToast(success ? 'Reseñas actualizadas' : 'No se pudieron cargar reseñas', success ? 'success' : 'error')
    }
  }
  return success
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
    const updated = await authedFetch<TicketItem>(`${apiBase}/support/tickets/${selectedTicket.value.id}/`, {
      method: 'PATCH',
      body,
    })
    // refresh list locally
    tickets.value = tickets.value.map((t) => (t.id === updated.id ? updated : t))
    selectedTicket.value = updated
    newComment.value = ''
    showTicketModal.value = false
    showToast('Ticket actualizado', 'success')
  } catch (error) {
    console.error('No se pudo guardar el ticket', error)
    showToast('No se pudo guardar el ticket', 'error')
  } finally {
    savingTicket.value = false
  }
}

const loadSummary = async () => {
  if (!auth.token) return false
  if (!selectedStore.value) return false
  const params: Record<string, any> = {}
  statsLoading.value = true
  let success = false
  try {
    const targetSlugs = [selectedStore.value]
    let totalOrders = 0
    let paidOrders = 0
    let revenue = 0
    let avgTicketSum = 0
    let avgCount = 0

    for (const slug of targetSlugs) {
      const summary = await authedFetch<any>(`${apiBase}/store/${slug}/admin/reportes/orders/summary/`, { params: {} }).catch(() => null)
      if (summary) {
        totalOrders += Number(summary.total_orders || 0)
        paidOrders += Number(summary.paid_orders || 0)
        revenue += Number(summary.total_revenue || 0)
        if (summary.avg_ticket) {
          avgTicketSum += Number(summary.avg_ticket)
          avgCount += 1
        }
      }
    }

    analytics.value = {
      totalOrders,
      paidOrders,
      revenue,
      avgTicket: avgCount ? avgTicketSum / avgCount : 0,
    }
    success = true
  } catch (error) {
    console.warn('No se pudo cargar el resumen', error)
  } finally {
    statsLoading.value = false
  }
  return success
}

const loadDailyStats = async () => {
  if (!auth.token) return false
  if (!selectedStore.value) return false
  dailyLoading.value = true
  const aggregated: Record<string, { orders: number; revenue: number }> = {}
  try {
    const targetSlugs = [selectedStore.value]
    for (const slug of targetSlugs) {
      const rows = await authedFetch<any[]>(`${apiBase}/store/${slug}/admin/reportes/orders/daily/`, { params: {} }).catch(() => [])
      rows.forEach((row: any) => {
        const day = row.day
        if (!aggregated[day]) aggregated[day] = { orders: 0, revenue: 0 }
        aggregated[day].orders += Number(row.orders_count || 0)
        aggregated[day].revenue += Number(row.revenue || 0)
      })
    }
    dailyStats.value = Object.entries(aggregated)
      .map(([day, vals]) => ({ day, orders: vals.orders, revenue: vals.revenue }))
      .sort((a, b) => (a.day > b.day ? 1 : -1))
  } catch (error) {
    console.warn('No se pudieron cargar métricas diarias', error)
  } finally {
    dailyLoading.value = false
  }
  return Boolean(dailyStats.value.length)
}

const refresh = async (notify = false) => {
  const ok = await loadData()
  if (notify) {
    showToast(ok ? 'Datos actualizados' : 'No se pudo actualizar', ok ? 'success' : 'error')
  }
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
  exportCsv('top-products', topProducts.value, [
    { key: 'name', label: 'Producto' },
    { key: 'store_slug', label: 'Tienda' },
    { key: 'total_quantity', label: 'Ventas' },
    { key: 'revenue', label: 'Ingresos' },
  ])
}

onMounted(async () => {
  const ready = await ensureAuthReady()
  if (!ready) {
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
  if (toastTimer) clearTimeout(toastTimer)
})

watch(selectedStore, async () => {
  if (!selectedStore.value) return
  pendingPage.value = 1
  deliveredPage.value = 1
  await Promise.all([loadOrders(), loadSummary(), loadDailyStats(), loadRecentReviews()])
})
</script>
