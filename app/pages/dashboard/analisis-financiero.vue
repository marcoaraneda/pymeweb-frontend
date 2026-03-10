<template>
  <ClientOnly>
    <div class="min-h-screen bg-slate-950 text-white">
    <div class="mx-auto max-w-6xl px-6 py-10 space-y-8">
      <nav class="flex flex-wrap items-center justify-center gap-2">
        <NuxtLink
          to="/dashboard"
          class="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-lg"
          style="background:#1d4ed8"
        >
          Dashboard
        </NuxtLink>
        <NuxtLink
          to="/dashboard/recursos-humanos"
          class="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-lg"
          style="background:#b45309"
        >
          Recursos Humanos
        </NuxtLink>
        <NuxtLink
          to="/dashboard/analisis-financiero"
          class="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-lg ring-2 ring-white/40"
          style="background:#0f172a"
        >
          Análisis financiero
        </NuxtLink>
        <NuxtLink
          to="/dashboard/analisis"
          class="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-lg"
          style="background:#0f766e"
        >
          Análisis de datos
        </NuxtLink>
      </nav>

      <header class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p class="text-xs uppercase tracking-[0.2em] text-white/60">Dashboard</p>
          <h1 class="text-3xl font-extrabold">Análisis financiero</h1>
          <p class="text-white/70">Ingresos, aprobaciones y distribución por método de pago.</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <NuxtLink
            to="/dashboard"
            class="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 hover:border-white/40"
          >
            Volver
          </NuxtLink>
        </div>
      </header>

      <section class="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
        <div class="grid gap-4 md:grid-cols-4">
          <div class="space-y-1">
            <label class="text-xs text-white/60">Tienda</label>
            <select v-model="filters.store" class="w-full rounded-xl border border-white/20 bg-white text-sm text-slate-900 px-3 py-2">
              <option disabled value="">Selecciona una tienda</option>
              <option v-for="s in storeOptions" :key="s.slug" :value="s.slug">{{ s.name }}</option>
            </select>
          </div>
          <div class="space-y-1">
            <label class="text-xs text-white/60">Granularidad</label>
            <select v-model="filters.granularity" class="w-full rounded-xl border border-white/20 bg-white text-sm text-slate-900 px-3 py-2">
              <option value="day">Día</option>
              <option value="month">Mes</option>
              <option value="quarter">Trimestre</option>
              <option value="year">Año</option>
            </select>
          </div>
          <div class="space-y-1" v-if="filters.granularity === 'day'">
            <label class="text-xs text-white/60">Desde / Hasta</label>
            <div class="flex gap-2">
              <input v-model="filters.start" type="date" class="w-1/2 rounded-xl border border-white/20 bg-white text-sm text-slate-900 px-3 py-2" />
              <input v-model="filters.end" type="date" class="w-1/2 rounded-xl border border-white/20 bg-white text-sm text-slate-900 px-3 py-2" />
            </div>
          </div>
          <div class="space-y-1" v-else>
            <label class="text-xs text-white/60">Periodo</label>
            <div class="grid grid-cols-2 gap-2" v-if="filters.granularity === 'month'">
              <select v-model.number="filters.year" class="rounded-xl border border-white/20 bg-white text-sm text-slate-900 px-3 py-2">
                <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
              </select>
              <select v-model.number="filters.month" class="rounded-xl border border-white/20 bg-white text-sm text-slate-900 px-3 py-2">
                <option v-for="m in monthOptions" :key="m.value" :value="m.value">{{ m.label }}</option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-2" v-else-if="filters.granularity === 'quarter'">
              <select v-model.number="filters.year" class="rounded-xl border border-white/20 bg-white text-sm text-slate-900 px-3 py-2">
                <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
              </select>
              <select v-model.number="filters.quarter" class="rounded-xl border border-white/20 bg-white text-sm text-slate-900 px-3 py-2">
                <option v-for="q in quarterOptions" :key="q" :value="q">Q{{ q }}</option>
              </select>
            </div>
            <div v-else>
              <select v-model.number="filters.year" class="w-full rounded-xl border border-white/20 bg-white text-sm text-slate-900 px-3 py-2">
                <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
              </select>
            </div>
          </div>
        </div>
        <div class="mt-4 flex flex-wrap items-center gap-3">
          <button
            class="rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-black/25 transition hover:-translate-y-0.5"
            :style="{ backgroundColor: theme.accent }"
            @click="loadAll"
            :disabled="loading"
          >
            {{ loading ? 'Actualizando...' : 'Aplicar filtros' }}
          </button>
          <span class="text-xs text-white/60">Rango efectivo: {{ rangeLabel }}</span>
        </div>
      </section>

      <div v-if="loadError" class="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
        {{ loadError }}
      </div>

      <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="card in summaryCards" :key="card.label" class="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p class="text-xs uppercase tracking-[0.2em] text-white/60">{{ card.label }}</p>
          <p class="mt-2 text-2xl font-semibold text-white">{{ card.value }}</p>
          <p class="text-xs text-white/60">{{ card.note }}</p>
        </div>
      </section>

      <section class="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
        <div class="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs uppercase tracking-[0.2em] text-white/60">Flujo de caja</p>
              <h2 class="text-xl font-semibold">Ingresos por periodo</h2>
            </div>
            <span class="text-xs text-white/60">{{ periodSeries.length }} puntos</span>
          </div>
          <div v-if="!periodSeries.length" class="mt-4 text-white/70">Sin datos para este rango.</div>
          <div v-else class="mt-4 flex items-end gap-2">
            <div
              v-for="(p, idx) in chartBars"
              :key="p.label + idx"
              class="flex-1 rounded-t-xl bg-white/20"
              :style="{ height: `${p.height}px`, backgroundColor: barColor(idx) }"
              :title="`${p.label}: ${money(p.value)}`"
            />
          </div>
        </div>

        <div class="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
          <p class="text-xs uppercase tracking-[0.2em] text-white/60">Metodos de pago</p>
          <h2 class="text-xl font-semibold">Rendimiento</h2>
          <div v-if="!paymentMethods.length" class="mt-4 text-white/70">Sin datos.</div>
          <div v-else class="mt-4 space-y-3">
            <div v-for="item in paymentMethods" :key="item.payment_type_code + '-' + item.response_code" class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
              <div class="flex items-center justify-between">
                <p class="font-semibold text-white">{{ item.payment_type_code || 'N/A' }}</p>
                <span class="text-xs text-white/60">Resp {{ item.response_code ?? '—' }}</span>
              </div>
              <p class="text-xs text-white/60">Intentos {{ item.attempts }} • Aprobados {{ item.paid }}</p>
              <p class="text-sm font-semibold" :style="{ color: theme.accent }">{{ money(item.amount) }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRuntimeConfig, navigateTo } from 'nuxt/app'
import { useAuthStore } from '~/stores/auth'
import { useThemeStore } from '~/stores/theme'

definePageMeta({ middleware: ['auth'], requiresAuth: true, ssr: false })

type StoreLite = { id: number; name: string; slug: string }
type MembershipLite = { store: StoreLite; roles: string[] }

const auth = useAuthStore()
const theme = useThemeStore()
const config = useRuntimeConfig()
const apiBase = String(config.public.apiBase || '')

const loading = ref(false)
const loadError = ref('')
const stores = ref<StoreLite[]>([])

const today = new Date()
const yearOptions = Array.from({ length: 5 }).map((_, idx) => today.getFullYear() - idx)
const monthOptions = [
  { value: 1, label: 'Ene' },
  { value: 2, label: 'Feb' },
  { value: 3, label: 'Mar' },
  { value: 4, label: 'Abr' },
  { value: 5, label: 'May' },
  { value: 6, label: 'Jun' },
  { value: 7, label: 'Jul' },
  { value: 8, label: 'Ago' },
  { value: 9, label: 'Sep' },
  { value: 10, label: 'Oct' },
  { value: 11, label: 'Nov' },
  { value: 12, label: 'Dic' },
]
const quarterOptions = [1, 2, 3, 4]

const filters = ref({
  store: '',
  granularity: 'month',
  start: '',
  end: '',
  year: today.getFullYear(),
  month: today.getMonth() + 1,
  quarter: Math.floor(today.getMonth() / 3) + 1,
})

const summary = ref({ total_orders: 0, paid_orders: 0, total_revenue: 0, avg_ticket: 0 })
const periodSeries = ref<{ period: string; orders_count: number; paid_orders: number; revenue: number }[]>([])
const paymentMethods = ref<any[]>([])

const allowedStoreSlugs = computed(() => {
  const memberships = (auth.user?.memberships || []) as MembershipLite[]
  const allowed = new Set(['ADMIN', 'REPORTS', 'FINANCE'])
  const slugs = new Set<string>()
  for (const membership of memberships) {
    if (membership.roles?.some((role) => allowed.has(role))) {
      slugs.add(membership.store.slug)
    }
  }
  return slugs
})

const storeOptions = computed(() => {
  if (!auth.user?.memberships?.length) return stores.value
  if (!allowedStoreSlugs.value.size) return []
  return stores.value.filter((s) => allowedStoreSlugs.value.has(s.slug))
})

const rangeLabel = computed(() => {
  const range = getRange()
  return `${range.start} a ${range.end}`
})

const summaryCards = computed(() => {
  const approvalRate = summary.value.total_orders
    ? Math.round((summary.value.paid_orders / summary.value.total_orders) * 100)
    : 0
  const totalAttempts = paymentMethods.value.reduce((acc, item) => acc + Number(item.attempts || 0), 0)
  const totalPaid = paymentMethods.value.reduce((acc, item) => acc + Number(item.paid || 0), 0)
  const rejectionRate = totalAttempts ? Math.round(((totalAttempts - totalPaid) / totalAttempts) * 100) : 0

  return [
    { label: 'Ingresos cobrados', value: money(summary.value.total_revenue), note: 'Total en el rango' },
    { label: 'Ordenes pagadas', value: summary.value.paid_orders, note: 'Transacciones exitosas' },
    { label: 'Ticket promedio', value: money(summary.value.avg_ticket), note: 'Valor medio por orden' },
    { label: 'Aprobacion pagos', value: `${approvalRate}%`, note: `Rechazo ${rejectionRate}%` },
  ]
})

const chartBars = computed(() => {
  const values = periodSeries.value.map((p) => Number(p.revenue) || 0)
  const max = Math.max(...values, 1)
  return periodSeries.value.map((p) => ({
    label: formatPeriod(p.period),
    value: Number(p.revenue) || 0,
    height: 24 + Math.round(((Number(p.revenue) || 0) / max) * 120),
  }))
})

const barColor = (idx: number) => (idx === chartBars.value.length - 1 ? theme.accent : 'rgba(255,255,255,0.25)')

const money = (value: number) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(Number(value) || 0)

const formatPeriod = (value: string) => {
  if (!value) return '—'
  const date = new Date(value)
  if (filters.value.granularity === 'year') return String(date.getFullYear())
  if (filters.value.granularity === 'month') return `${date.getMonth() + 1}/${date.getFullYear()}`
  if (filters.value.granularity === 'quarter') return `Q${Math.floor(date.getMonth() / 3) + 1} ${date.getFullYear()}`
  return date.toLocaleDateString('es-CL')
}

const authedFetch = async <T>(url: string, options: Record<string, any> = {}) => {
  if (!auth.token) throw new Error('No autenticado')
  const doFetch = (token: string) =>
    $fetch<T>(url as any, {
      ...options,
      headers: { ...(options.headers || {}), Authorization: `Bearer ${token}` },
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
  if (!auth.token) {
    auth.restoreFromCookies()
  }
  if (!auth.token && auth.refreshToken) {
    await auth.refreshTokens()
  }
  if (!auth.token) return false
  if (!auth.user) {
    const profile = await auth.fetchProfile()
    if (!profile) return false
  }
  return true
}

const getRange = () => {
  const { granularity, year, month, quarter, start, end } = filters.value
  if (granularity === 'day') {
    const fallback = new Date()
    const startDate = start || new Date(fallback.getFullYear(), fallback.getMonth(), 1).toISOString().slice(0, 10)
    const endDate = end || fallback.toISOString().slice(0, 10)
    return { start: startDate, end: endDate }
  }
  if (granularity === 'month') {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0)
    return { start: startDate.toISOString().slice(0, 10), end: endDate.toISOString().slice(0, 10) }
  }
  if (granularity === 'quarter') {
    const startMonth = (quarter - 1) * 3
    const startDate = new Date(year, startMonth, 1)
    const endDate = new Date(year, startMonth + 3, 0)
    return { start: startDate.toISOString().slice(0, 10), end: endDate.toISOString().slice(0, 10) }
  }
  const startDate = new Date(year, 0, 1)
  const endDate = new Date(year, 11, 31)
  return { start: startDate.toISOString().slice(0, 10), end: endDate.toISOString().slice(0, 10) }
}

const loadAll = async () => {
  loadError.value = ''
  if (!filters.value.store) {
    loadError.value = 'Selecciona una tienda para ver el análisis financiero.'
    return
  }
  loading.value = true
  const range = getRange()
  const params = { start_date: range.start, end_date: range.end }
  try {
    summary.value = await authedFetch<any>(`${apiBase}/store/${filters.value.store}/admin/reportes/orders/summary/`, { params })
    periodSeries.value = await authedFetch<any[]>(`${apiBase}/store/${filters.value.store}/admin/reportes/orders/period/`, {
      params: { ...params, granularity: filters.value.granularity },
    })
    paymentMethods.value = await authedFetch<any[]>(`${apiBase}/store/${filters.value.store}/admin/reportes/payments/summary/methods/`, { params })
  } catch (error: any) {
    const detail = error?.response?._data?.detail || 'No pudimos cargar el análisis financiero.'
    loadError.value = detail
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  const ready = await ensureAuthReady()
  if (!ready) {
    await navigateTo('/login')
    return
  }
  stores.value = await auth.fetchMyStores()
  if (!storeOptions.value.length) {
    loadError.value = 'No tienes permisos de análisis financiero para ninguna tienda.'
    theme.applyTheme()
    return
  }
  const firstStore = stores.value[0]
  if (firstStore?.slug) {
    filters.value.store = storeOptions.value[0]?.slug || firstStore.slug
    await loadAll()
  } else {
    loadError.value = 'No tienes tiendas asignadas. Debes tener al menos una para ver este panel.'
  }
  theme.applyTheme()
})
</script>
