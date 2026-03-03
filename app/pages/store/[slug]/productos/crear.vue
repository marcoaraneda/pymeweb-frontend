<template>
  <div class="bg-slate-50 px-4 py-10">
    <div class="mx-auto max-w-5xl space-y-6">
      <NuxtLink :to="`/store/${slug}/productos`" class="text-sm font-semibold text-slate-700 hover:text-slate-900">← Volver</NuxtLink>

      <div class="grid gap-8 md:grid-cols-[1.1fr,0.9fr] md:items-start">
        <div class="space-y-4">
          <div class="relative aspect-square overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <img :src="previewImage" alt="Imagen del producto" class="h-full w-full object-cover" />
          </div>

          <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
            <label class="text-sm font-semibold text-slate-700">URL de imagen principal</label>
            <input
              v-model="form.image_url"
              type="url"
              placeholder="https://..."
              class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <p class="text-xs text-slate-500">Se usará como portada. Puedes cambiarla luego desde el detalle.</p>
          </div>
        </div>

        <div class="space-y-5">
          <div class="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-slate-500">
            <span>{{ selectedCategoryLabel }}</span>
            <span class="rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-800">Nuevo</span>
          </div>

          <input
            v-model="form.name"
            type="text"
            placeholder="Nombre del producto"
            class="w-full rounded-xl border border-slate-200 px-3 py-3 text-2xl font-semibold text-slate-900"
          />
          <p class="text-xs text-slate-500">Requerido: nombre visible para el cliente.</p>

          <textarea
            v-model="form.description"
            rows="3"
            placeholder="Describe tu producto"
            class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          ></textarea>

          <div class="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div class="grid gap-3 sm:grid-cols-2">
              <div class="space-y-1">
                <label class="text-xs uppercase tracking-[0.2em] text-slate-500">Precio</label>
                <input v-model.number="form.price" type="number" step="0.01" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                <p class="text-xs text-slate-500">Requerido: mayor a 0.</p>
              </div>
              <div class="space-y-1">
                <label class="text-xs uppercase tracking-[0.2em] text-slate-500">Precio oferta</label>
                <input v-model.number="form.offer_price" type="number" step="0.01" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              </div>
            </div>
            <div class="space-y-1">
              <label class="text-xs uppercase tracking-[0.2em] text-slate-500">Categoría</label>
              <select v-model="form.category" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                <option value="">Sin categoría</option>
                <option v-for="cat in categories" :key="cat.slug || cat.id" :value="cat.id || cat.slug">{{ cat.name }}</option>
              </select>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <button
              class="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow"
              :style="{ backgroundColor: accentColor }"
              :disabled="saving || !isStoreOwner || !isValidForm"
              @click="createProduct"
            >
              {{ saving ? 'Guardando...' : 'Guardar producto' }}
            </button>
            <NuxtLink
              :to="`/store/${slug}/productos`"
              class="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-800 hover:border-slate-300"
            >
              Cancelar
            </NuxtLink>
          </div>

          <p v-if="message" class="text-sm" :class="messageStatus === 'error' ? 'text-red-600' : 'text-emerald-600'">
            {{ message }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { definePageMeta, useRuntimeConfig } from 'nuxt/app'
import { useAuthStore } from '~/stores/auth'
import { useTenantStore } from '~/stores/tenant'
import { useThemeStore } from '~/stores/theme'
import { useImages } from '~/composables/useImages'

definePageMeta({ layout: 'store', middleware: ['tenant', 'auth'], requiresAuth: true })

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const tenantStore = useTenantStore()
const theme = useThemeStore()
const { getProductImage } = useImages()
const config = useRuntimeConfig()

const slug = route.params.slug as string

const form = reactive({
  name: '',
  description: '',
  price: 0,
  offer_price: null as number | null,
  category: '' as string | number,
  image_url: '',
})

const saving = ref(false)
const loadingCategories = ref(false)
const message = ref('')
const messageStatus = ref<'ok' | 'error'>('ok')
const categories = ref<any[]>([])

const accentColor = computed(() => theme.accent || '#2563eb')
const previewImage = computed(() => form.image_url || getProductImage({}) )
const isStoreOwner = computed(() => {
  const memberships = (auth.user as any)?.memberships || []
  return memberships.some((m: any) => {
    const roles = (m?.roles || []).map((r: any) => r?.code || r)?.map((r: string) => r?.toLowerCase?.())
    return m?.store?.slug === slug && roles.some((r: string) => ['admin', 'owner', 'manager'].includes(r))
  })
})
const selectedCategoryLabel = computed(() => {
  if (!form.category) return 'General'
  const found = categories.value.find((c: any) => c.id === form.category || c.slug === form.category)
  return found?.name || 'General'
})

const isValidForm = computed(() => {
  return Boolean(form.name.trim() && Number(form.price) > 0)
})

const loadCategories = async () => {
  try {
    loadingCategories.value = true
    tenantStore.setSlug(slug)
    categories.value = await $fetch(`${config.public.apiBase}/store/${slug}/catalogo/categories/`)
  } catch (error) {
    categories.value = []
  } finally {
    loadingCategories.value = false
  }
}

const ensureOwnership = () => {
  if (!isStoreOwner.value) {
    message.value = 'Solo el dueño puede crear productos en esta tienda'
    messageStatus.value = 'error'
  }
}

const createProduct = async () => {
  if (!isStoreOwner.value) {
    ensureOwnership()
    return
  }
  if (!isValidForm.value) {
    message.value = 'Completa nombre y precio (>0)'
    messageStatus.value = 'error'
    return
  }
  if (!auth.token) {
    message.value = 'Inicia sesión para crear productos'
    messageStatus.value = 'error'
    return
  }

  saving.value = true
  message.value = ''
  const slugValue = form.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const payload: any = {
    name: form.name.trim(),
    slug: slugValue,
    description: form.description?.trim?.() || '',
    price: Number(form.price),
    offer_price: form.offer_price != null ? Number(form.offer_price) : null,
    is_active: true,
    is_marketplace: false,
    ...(form.category ? { category: form.category } : {}),
    ...(form.image_url ? { image_url: form.image_url } : {}),
  }

  const doCreate = (tokenOverride?: string) =>
    $fetch(`${config.public.apiBase}/store/${slug}/admin/catalogo/products/`, {
      method: 'POST',
      body: payload,
      headers: { Authorization: `Bearer ${tokenOverride || auth.token}` },
    })

  try {
    if (auth.refreshToken) {
      await auth.refreshTokens()
    }
    const created = await doCreate()
    message.value = 'Producto creado'
    messageStatus.value = 'ok'
    const targetSlug = created?.slug || slugValue
    await router.push(`/store/${slug}/productos/${targetSlug}`)
  } catch (error: any) {
    const code = error?.response?._data?.code
    if (code === 'token_not_valid' && auth.refreshToken) {
      const refreshed = await auth.refreshTokens()
      if (refreshed) {
        try {
          const created = await doCreate(refreshed)
          message.value = 'Producto creado'
          messageStatus.value = 'ok'
          const targetSlug = created?.slug || slugValue
          await router.push(`/store/${slug}/productos/${targetSlug}`)
          return
        } catch (retryErr) {
          console.error('Retry create failed', retryErr)
        }
      }
    }
    const apiError = error?.response?._data
    const apiDetail = apiError?.detail || apiError
    message.value = typeof apiDetail === 'string' ? apiDetail : 'No pudimos crear el producto'
    messageStatus.value = 'error'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  auth.restoreFromCookies()
  if (auth.token && !auth.user) {
    await auth.fetchProfile()
  }
  tenantStore.setSlug(slug)
  theme.loadFromStorage()
  theme.applyStoreTheme(slug)
  await tenantStore.fetchTienda()
  await loadCategories()
  ensureOwnership()
  if (!isStoreOwner.value) {
    await router.replace(`/store/${slug}/productos`)
  }
})
</script>
