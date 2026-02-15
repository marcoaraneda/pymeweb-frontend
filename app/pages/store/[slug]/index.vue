<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <section class="relative overflow-hidden bg-gradient-to-br from-[var(--gradient-from,#111827)] to-[var(--gradient-to,#0b2358)] text-white">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_45%)]" aria-hidden="true" />
      <div class="relative mx-auto flex max-w-6xl flex-col gap-10 px-6 py-16 lg:flex-row lg:items-center lg:py-20">
        <div class="space-y-5 lg:w-1/2">
          <p class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.25em]">Tienda oficial</p>
          <div class="flex items-center gap-3">
            <h1 class="text-4xl font-bold leading-tight md:text-5xl">{{ tenantStore.data?.name || 'Tu tienda online' }}</h1>
            <button
              v-if="canEditTheme"
              class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/20"
              title="Editar tienda"
              @click="showStoreForm = true"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-5 w-5">
                <path d="M13.586 3.586a2 2 0 0 1 2.828 2.828l-8.5 8.5a2 2 0 0 1-.878.512l-3.12.89a.5.5 0 0 1-.62-.62l.89-3.12a2 2 0 0 1 .512-.878l8.5-8.5Z" />
                <path d="M12.5 4.75 15.25 7.5" />
              </svg>
            </button>
          </div>
          <p class="max-w-2xl text-lg text-white/80">
            {{ heroDescription }}
          </p>
          <div class="flex flex-wrap gap-3">
            <NuxtLink
              :to="`/store/${slug}/productos`"
              class="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold shadow-lg shadow-black/20 transition hover:-translate-y-0.5"
              :style="accentStyle"
            >
              Ver catálogo
              <span aria-hidden="true">→</span>
            </NuxtLink>
            <a href="#destacados" class="inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white hover:border-white/40 hover:bg-white/5 transition">
              Ofertas y destacados
            </a>
          </div>
          <div class="flex flex-wrap gap-2 text-sm text-white/75">
            <span class="rounded-full border border-white/15 px-3 py-1">Pago seguro</span>
            <span class="rounded-full border border-white/15 px-3 py-1">Envíos rápidos</span>
              <span v-if="tenantStore.categories.length" class="rounded-full border border-white/15 px-3 py-1">{{ tenantStore.categories.length }} categorías</span>
              <span v-for="cat in tenantStore.categories" :key="cat.slug || cat" class="rounded-full border border-slate-200 px-3 py-1 text-slate-700">{{ cat.name || cat }}</span>
          </div>
        </div>

        <div class="relative lg:w-1/2">
          <div class="absolute -inset-6 rounded-3xl bg-white/10 blur-2xl" />
          <div class="relative rounded-3xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur">
            <p class="text-sm text-white/80">Vista rápida</p>
            <div class="mt-4 grid gap-4 sm:grid-cols-2">
              <div v-for="product in previewProducts" :key="product.id" class="rounded-2xl bg-white/10 p-4 shadow-inner">
                <p class="text-xs uppercase text-white/60">{{ product.category?.name || 'General' }}</p>
                <p class="text-lg font-semibold">{{ product.name }}</p>
                <p class="text-sm text-white/80">${{ product.price }}</p>
              </div>
            </div>
            <p v-if="!previewProducts.length" class="text-white/70">Aún no hay productos cargados.</p>
          </div>
        </div>
      </div>
    </section>

    <section v-if="canEditTheme && showStoreForm" class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/70 px-4 py-10" id="brand">
      <div class="relative w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <button
          class="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-100"
          @click="showStoreForm = false"
          aria-label="Cerrar edición"
        >
          ×
        </button>

        <div class="space-y-4">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="text-xs uppercase tracking-[0.25em] text-slate-500">Datos de la tienda</p>
              <h2 class="text-xl font-semibold text-slate-900">Nombre, slug y logo</h2>
              <p class="text-slate-600">Se guardan en el servidor para esta tienda.</p>
            </div>
            <div v-if="updateMessage" class="text-sm" :class="updateStatus === 'error' ? 'text-red-600' : 'text-emerald-600'">{{ updateMessage }}</div>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <div class="space-y-2">
              <label class="text-sm text-slate-600">Nombre de la tienda</label>
              <input v-model="storeForm.name" type="text" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div class="space-y-2">
              <label class="text-sm text-slate-600">Slug (se usa en la URL)</label>
              <input v-model="storeForm.slug" type="text" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              <p class="text-xs text-slate-500">Ejemplo: /store/{{ storeForm.slug || 'mitienda' }}</p>
            </div>
            <div class="space-y-2 md:col-span-2">
              <label class="text-sm text-slate-600">Descripción</label>
              <textarea v-model="storeForm.description" rows="3" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"></textarea>
            </div>
            <div class="space-y-2 md:col-span-2">
              <label class="text-sm text-slate-600">Acerca de nosotros (página Acerca)</label>
              <textarea v-model="storeForm.about" rows="3" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="Cuenta la historia, misión o promesa de tu tienda."></textarea>
            </div>
            <div class="space-y-2">
              <label class="text-sm text-slate-600">Email de contacto</label>
              <input v-model="storeForm.contact_email" type="email" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div class="space-y-2">
              <label class="text-sm text-slate-600">Teléfono</label>
              <input v-model="storeForm.phone" type="text" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div class="space-y-2 md:col-span-2">
              <label class="text-sm text-slate-600">Logo (URL)</label>
              <input v-model="storeForm.logo_url" type="url" placeholder="https://..." class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              <p class="text-xs text-slate-500">Al guardar, el header usará esta imagen.</p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <button
              class="rounded-xl px-4 py-2 text-sm font-semibold text-white shadow"
              :style="accentStyle"
              :disabled="updatingStore"
              @click="saveStore"
            >
              {{ updatingStore ? 'Guardando...' : 'Guardar cambios de tienda' }}
            </button>
            <p class="text-sm text-slate-600">Cambiar el slug redirige a la nueva URL.</p>
          </div>
        </div>
      </div>
    </section>

    <section v-if="canEditTheme" class="mx-auto max-w-6xl px-6 py-10" id="personaliza">
      <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-xs uppercase tracking-[0.25em] text-slate-500">Tema de esta tienda</p>
            <h2 class="text-xl font-semibold text-slate-900">Personaliza colores de acento y fondo</h2>
            <p class="text-slate-600">Se guarda localmente por tienda.</p>
          </div>
          <div class="flex flex-wrap gap-3">
            <div class="flex items-center gap-2">
              <span class="text-sm text-slate-600">Acento</span>
              <button
                v-for="c in palette"
                :key="c"
                class="h-8 w-8 rounded-full border border-slate-200 shadow-inner transition hover:-translate-y-0.5"
                :style="{ backgroundColor: c }"
                @click="setAccent(c)"
              />
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm text-slate-600">Degradado</span>
              <button
                v-for="g in gradients"
                :key="g.from"
                class="h-10 w-14 rounded-xl border border-slate-200 shadow-inner transition hover:-translate-y-0.5"
                :style="{ backgroundImage: `linear-gradient(120deg, ${g.from}, ${g.to})` }"
                @click="setGradient(g.from, g.to)"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-6xl px-6 py-4" id="destacados">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs uppercase tracking-[0.2em] text-slate-500">Ofertas</p>
          <h2 class="text-2xl font-semibold">Destacados de la semana</h2>
        </div>
        <NuxtLink :to="`/store/${slug}/productos`" class="text-sm font-semibold text-slate-700 hover:text-slate-900">Ver todo</NuxtLink>
      </div>
      <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ProductCard
          v-for="product in featuredProducts"
          :key="product.id"
          :product="product"
          :accent="accentColor"
        />
        <p v-if="!featuredProducts.length" class="text-slate-600">No hay productos destacados todavía.</p>
      </div>
    </section>

    <section class="mx-auto max-w-6xl px-6 py-10" id="catalogo">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-xs uppercase tracking-[0.2em] text-slate-500">Catálogo completo</p>
          <h2 class="text-2xl font-semibold text-slate-900">Explora todos los productos</h2>
        </div>
        <div class="flex flex-wrap gap-3 text-sm">
          <select
            v-model="catalogCategory"
            class="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-inner focus:border-slate-400 focus:outline-none"
          >
            <option value="">Todas las categorías</option>
            <option v-for="cat in catalogCategories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
          <select
            v-model="catalogSort"
            class="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-inner focus:border-slate-400 focus:outline-none"
          >
            <option value="">Ordenar por precio</option>
            <option value="asc">Menor a mayor</option>
            <option value="desc">Mayor a menor</option>
          </select>
        </div>
      </div>

      <div v-if="tenantStore.loading" class="mt-6 text-slate-500">Cargando productos...</div>
      <div v-else-if="!filteredCatalog.length" class="mt-6 rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-slate-600">
        Aún no hay productos cargados en esta tienda.
      </div>
      <div v-else class="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <ProductCard
          v-for="product in filteredCatalog"
          :key="product.id"
          :product="product"
          :accent="accentColor"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import ProductCard from '~/components/ProductCard.vue'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { definePageMeta } from '#imports'
import { useRuntimeConfig } from 'nuxt/app'
import { useTenantStore } from '~/stores/tenant'
import { useCartStore } from '~/stores/cart'
import { useThemeStore } from '~/stores/theme'
import { useImages } from '~/composables/useImages'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'store' })

const route = useRoute()
const router = useRouter()
const slug = computed(() => route.params.slug as string)

const tenantStore = useTenantStore()
const cart = useCartStore()
const theme = useThemeStore()
const auth = useAuthStore()
const { getProductImage } = useImages()
const config = useRuntimeConfig()

const storeForm = reactive({ name: '', slug: '', logo_url: '', description: '', about: '', contact_email: '', phone: '' })
const showStoreForm = ref(false)
const updatingStore = ref(false)
const updateMessage = ref('')
const updateStatus = ref<'ok' | 'error'>('ok')
const shouldAutoOpen = computed(() => {
  const edit = route.query.edit
  return edit === 'true' || edit === '1' || edit === 'yes'
})

const palette = [
  '#2563eb', // azul
  '#16a34a', // verde
  '#f59e0b', // ámbar
  '#e11d48', // rosa/rojo
  '#7c3aed', // violeta
  '#0ea5e9', // celeste
  '#f97316', // naranjo
  '#10b981', // esmeralda
  '#9333ea', // púrpura profundo
  '#0d9488', // teal oscuro
  '#64748b', // slate
  '#111827', // negro grafito
]
const gradients = [
  { from: '#0f172a', to: '#0b2358' },
  { from: '#0b3b2e', to: '#0f766e' },
  { from: '#2b0b3f', to: '#7c3aed' },
  { from: '#3b0a1a', to: '#e11d48' },
  { from: '#1d4ed8', to: '#06b6d4' },
  { from: '#15803d', to: '#84cc16' },
  { from: '#c2410c', to: '#f97316' },
  { from: '#7c2d12', to: '#f59e0b' },
  { from: '#312e81', to: '#9333ea' },
]

const accentColor = computed(() => theme.accent || '#2563eb')
const accentStyle = computed(() => ({ backgroundColor: accentColor.value, color: '#fff' }))
const heroDescription = computed(
  () =>
    tenantStore.data?.description ||
    'Explora un catálogo curado con envíos rápidos y una experiencia pensada para conversión. Personaliza el acento visual para alinear la tienda a tu marca.'
)
const canEditTheme = computed(() => {
  const membershipRaw = (auth.user as any)?.memberships
  const membership = Array.isArray(membershipRaw) ? membershipRaw : []
  const ownsStore = membership.some((m: any) => {
    const rolesRaw = m?.roles
    const roles = Array.isArray(rolesRaw) ? rolesRaw : []
    const storeSlug = m?.store?.slug
    const current = slug.value
    return storeSlug?.toString().toLowerCase() === current?.toString().toLowerCase() &&
      roles.map((r: string) => r?.toLowerCase?.()).some((r: string) => ['admin', 'owner', 'manager'].includes(r))
  })
  return Boolean((auth.user as any)?.is_staff || ownsStore)
})

const safeProducts = computed(() => Array.isArray(tenantStore.productos) ? tenantStore.productos : [])

const featuredProducts = computed(() => {
  const all = safeProducts.value
  const weekly = all.filter((p: any) => p?.product_of_week)
  if (weekly.length) return weekly
  const highlighted = all.filter((p: any) => p?.is_featured)
  if (highlighted.length) return highlighted
  return all.slice(0, 3)
})

const previewProducts = computed(() => safeProducts.value.slice(0, 4))

const catalogCategories = computed(() => {
  const names = new Set<string>()
  safeProducts.value.forEach((p: any) => {
    const name = p?.category?.name || p?.category
    if (name) names.add(name)
  })
  return Array.from(names).sort((a, b) => a.localeCompare(b))
})

const catalogCategory = ref('')
const catalogSort = ref('')

const filteredCatalog = computed(() => {
  let data = safeProducts.value
  if (catalogCategory.value) {
    data = data.filter((p: any) => (p?.category?.name || p?.category) === catalogCategory.value)
  }
  if (catalogSort.value) {
    data = [...data].sort((a: any, b: any) => {
      const pa = Number(a?.offer_price || a?.price || 0)
      const pb = Number(b?.offer_price || b?.price || 0)
      return catalogSort.value === 'asc' ? pa - pb : pb - pa
    })
  }
  return data
})

const setAccent = (color: string) => theme.setStoreTheme(slug.value, { accent: color })
const setGradient = (from: string, to: string) => theme.setStoreTheme(slug.value, { gradientFrom: from, gradientTo: to })

const maybeOpenEdit = () => {
  if (shouldAutoOpen.value && canEditTheme.value) {
    showStoreForm.value = true
  }
}

const loadData = async () => {
  tenantStore.setSlug(slug.value)
  await Promise.all([tenantStore.fetchTienda(), tenantStore.fetchProductos()])
}

const hydrateForm = () => {
  const data = tenantStore.data || {}
  storeForm.name = data.name || ''
  storeForm.slug = data.slug || slug.value || ''
  storeForm.logo_url = data.logo_url || data.logo || ''
  storeForm.description = data.description || ''
   storeForm.about = data.about || data.about_us || data.about_text || ''
  storeForm.contact_email = data.contact_email || data.email || ''
  storeForm.phone = data.phone || ''
}

const saveStore = async () => {
  if (!canEditTheme.value) return
  updatingStore.value = true
  updateMessage.value = ''
  const previousSlug = slug.value
  try {
    const payload: any = {
      name: storeForm.name,
      slug: storeForm.slug,
      logo_url: storeForm.logo_url,
      description: storeForm.description,
      contact_email: storeForm.contact_email,
      about: storeForm.about,
      phone: storeForm.phone,
    }

    const updated = await $fetch(`${config.public.apiBase}/stores/${previousSlug}/`, {
      method: 'PATCH',
      body: payload,
      headers: auth.token ? { Authorization: `Bearer ${auth.token}` } : {},
    })

    tenantStore.data = updated
    const nextSlug = updated.slug || storeForm.slug || previousSlug

    if (nextSlug !== previousSlug) {
      theme.renameStoreTheme(previousSlug, nextSlug)
      tenantStore.setSlug(nextSlug)
      await router.replace(`/store/${nextSlug}`)
    } else {
      tenantStore.setSlug(previousSlug)
    }

    await tenantStore.fetchTienda()
    hydrateForm()
    theme.applyStoreTheme(tenantStore.slug || nextSlug)
    updateStatus.value = 'ok'
    updateMessage.value = 'Cambios guardados'
    showStoreForm.value = false
  } catch (error: any) {
    updateStatus.value = 'error'
    updateMessage.value = error?.response?._data || 'No pudimos guardar la tienda'
  } finally {
    updatingStore.value = false
  }
}

onMounted(async () => {
  auth.restoreFromCookies()
  if (auth.token && !auth.user) {
    await auth.fetchProfile()
  }
  theme.loadFromStorage()
  theme.applyStoreTheme(slug.value)
  await loadData()
  hydrateForm()
  maybeOpenEdit()
})

watch(
  () => slug.value,
  async () => {
    theme.applyStoreTheme(slug.value)
    await loadData()
    hydrateForm()
  }
)

watch([shouldAutoOpen, canEditTheme], () => maybeOpenEdit())

watch(
  () => tenantStore.data,
  () => hydrateForm(),
  { immediate: true }
)
</script>
