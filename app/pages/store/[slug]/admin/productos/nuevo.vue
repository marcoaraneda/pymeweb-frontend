<template>
  <div class="bg-slate-50 px-4 py-10 min-h-screen">
    <div class="mx-auto max-w-3xl space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs uppercase tracking-[0.25em] text-slate-500">Productos</p>
          <h1 class="text-2xl font-bold text-slate-900">Nuevo producto</h1>
        </div>
        <NuxtLink :to="`/store/${slug}/productos`" class="text-sm font-semibold text-slate-700 hover:text-slate-900">Volver</NuxtLink>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div class="grid gap-4">
          <div class="space-y-2">
            <label class="text-sm text-slate-600">Nombre</label>
            <input v-model="form.name" type="text" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div class="space-y-2">
            <label class="text-sm text-slate-600">Slug</label>
            <input v-model="form.slug" type="text" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <p class="text-xs text-slate-500">Se usa en la URL. Usa letras, números y guiones.</p>
          </div>
          <div class="space-y-2">
            <label class="text-sm text-slate-600">Descripción</label>
            <textarea v-model="form.description" rows="3" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"></textarea>
          </div>
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="space-y-2">
              <label class="text-sm text-slate-600">Precio</label>
              <input v-model.number="form.price" type="number" step="0.01" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div class="space-y-2">
              <label class="text-sm text-slate-600">Precio oferta (opcional)</label>
              <input v-model.number="form.offer_price" type="number" step="0.01" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </div>
          </div>
          <div class="space-y-2">
            <label class="text-sm text-slate-600">Categoría</label>
            <select v-model="form.category" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
              <option value="">Sin categoría</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
            <p class="text-xs text-slate-500">Selecciona una categoría disponible.</p>
          </div>
          <div class="space-y-2">
            <label class="text-sm text-slate-600">Imagen (URL)</label>
            <input v-model="form.image_url" type="url" placeholder="https://..." class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <p class="text-xs text-slate-500">Pegamos la URL y se sube a Cloudinary automáticamente.</p>
          </div>
          <div class="flex flex-wrap gap-4">
            <label class="inline-flex items-center gap-2 text-sm text-slate-700">
              <input v-model="form.is_featured" type="checkbox" />
              Producto destacado
            </label>
            <label class="inline-flex items-center gap-2 text-sm text-slate-700">
              <input v-model="form.product_of_week" type="checkbox" />
              Producto de la semana
            </label>
            <label class="inline-flex items-center gap-2 text-sm text-slate-700">
              <input v-model="form.is_active" type="checkbox" />
              Activo
            </label>
            <label class="inline-flex items-center gap-2 text-sm text-slate-700">
              <input v-model="form.is_marketplace" type="checkbox" />
              Publicar en marketplace
            </label>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button
            class="rounded-xl px-4 py-2 text-sm font-semibold text-white shadow"
            :style="accentStyle"
            :disabled="saving"
            @click="save"
          >
            {{ saving ? 'Guardando...' : 'Guardar producto' }}
          </button>
          <p class="text-sm" v-if="message" :class="messageType === 'error' ? 'text-red-600' : 'text-green-600'">{{ message }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRuntimeConfig } from 'nuxt/app'
import { definePageMeta } from '#imports'
import { useAuthStore } from '~/stores/auth'
import { useThemeStore } from '~/stores/theme'
import { useTenantStore } from '~/stores/tenant'

definePageMeta({ layout: 'store' })

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const auth = useAuthStore()
const theme = useThemeStore()
const tenantStore = useTenantStore()

const slug = route.params.slug as string

const form = reactive({
  name: '',
  slug: '',
  description: '',
  price: 0,
  offer_price: null as number | null,
  category: '' as string | number,
  is_featured: false,
  product_of_week: false,
  is_active: true,
  image_url: '',
  is_marketplace: false,
})

const saving = ref(false)
const message = ref('')
const messageType = ref<'ok' | 'error'>('ok')
const categories = ref<any[]>([])

const accentStyle = computed(() => ({ backgroundColor: theme.accent || 'var(--accent,#2563eb)', color: '#fff' }))

const loadCategories = async () => {
  try {
    tenantStore.setSlug(slug)
    categories.value = await $fetch(`${config.public.apiBase}/store/${slug}/catalogo/categories/`)
  } catch (error) {
    categories.value = []
  }
}
const save = async () => {
  if (!auth.token) {
    message.value = 'Inicia sesión para crear productos'
    messageType.value = 'error'
    return
  }

  saving.value = true
  message.value = ''

  const slugValue = form.slug || form.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')
  const buildPayload = () => ({
    name: form.name,
    slug: slugValue,
    description: form.description,
    price: form.price,
    offer_price: form.offer_price,
    is_featured: form.is_featured,
    product_of_week: form.product_of_week,
    is_active: form.is_active,
    is_marketplace: form.is_marketplace,
    ...(form.category ? { category: form.category } : {}),
    ...(form.image_url ? { image_url: form.image_url } : {}),
  })
  const doSave = (tokenOverride?: string) =>
    $fetch(`${config.public.apiBase}/store/${slug}/admin/catalogo/products/`, {
      method: 'POST',
      body: buildPayload(),
      headers: { Authorization: `Bearer ${tokenOverride || auth.token}` },
    })

  try {
    // Refresca el token antes de enviar para evitar expirados
    if (auth.refreshToken) {
      await auth.refreshTokens()
    }

    await doSave()
    message.value = 'Producto creado'
    messageType.value = 'ok'
    router.push(`/store/${slug}/productos`)
  } catch (error: any) {
    const code = error?.response?._data?.code
    if (code === 'token_not_valid' && auth.refreshToken) {
      const refreshed = await auth.refreshTokens()
      if (refreshed) {
        try {
          await doSave(refreshed)
          message.value = 'Producto creado'
          messageType.value = 'ok'
          router.push(`/store/${slug}/productos`)
        } catch (e) {
          console.error('Retry after refresh failed', e)
        }
      }
    }
    const apiError = error?.response?._data
    if (apiError && typeof apiError === 'object') {
      const combined = Object.values(apiError).flat().join(' ')
      message.value = combined || 'No pudimos crear el producto'
    } else {
      message.value = apiError || 'No pudimos crear el producto'
    }
    messageType.value = 'error'
    console.error('Error al crear producto', error)
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  auth.restoreFromCookies()
  if (auth.token && !auth.user) {
    await auth.fetchProfile()
  }
  theme.loadFromStorage()
  theme.applyStoreTheme(slug)
  tenantStore.setSlug(slug)
  await loadCategories()
})
</script>
