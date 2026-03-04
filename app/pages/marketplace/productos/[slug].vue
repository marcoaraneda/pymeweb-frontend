<template>
  <div class="min-h-screen bg-slate-50 px-4 py-10">
    <div class="mx-auto max-w-5xl space-y-6">
      <NuxtLink to="/marketplace#productos" class="text-sm font-semibold text-slate-700 hover:text-slate-900">← Volver</NuxtLink>

      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div v-if="loading" class="text-slate-500">Cargando producto...</div>
        <div v-else-if="error" class="text-red-600">{{ error }}</div>
        <div v-else-if="!product" class="text-slate-600">Producto no encontrado.</div>
        <div v-else class="grid gap-6 md:grid-cols-[1.3fr,1fr] md:items-start">
          <div class="space-y-3">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-500">{{ product.category?.name || 'General' }}</p>
            <h1 class="text-2xl font-bold text-slate-900">{{ product.name }}</h1>
            <p class="text-sm text-slate-600 whitespace-pre-line">{{ product.description }}</p>
            <div class="flex flex-wrap items-center gap-2">
              <span v-if="product.product_of_week" class="rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-800">Producto de la semana</span>
              <span v-else-if="product.offer_price" class="rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-800">Oferta</span>
              <span class="rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-900">Marketplace</span>
            </div>
            <p class="text-2xl font-bold" :class="product.offer_price ? 'text-red-600' : 'text-slate-900'">
              <span v-if="product.offer_price" class="mr-2 text-lg text-slate-400 line-through">${{ product.price }}</span>
              ${{ product.offer_price || product.price }}
            </p>
            <div class="flex flex-wrap gap-3 text-xs text-slate-500">
              <span v-if="product.submitted_by_name">
                Vendedor:
                <NuxtLink
                  v-if="product.submitted_by"
                  :to="`/marketplace/vendedores/${product.submitted_by}`"
                  class="font-semibold text-amber-700 hover:underline"
                >
                  {{ product.submitted_by_name }}
                </NuxtLink>
                <span v-else>{{ product.submitted_by_name }}</span>
              </span>
              <span>ID: {{ product.id }}</span>
            </div>
          </div>

          <div class="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div class="aspect-[4/3] overflow-hidden rounded-lg bg-white">
              <img :src="productImage" :alt="product.name" class="h-full w-full object-cover" />
            </div>
            <NuxtLink
              v-if="product.store?.slug && !product.store_is_marketplace"
              :to="`/store/${product.store.slug}/productos/${product.slug}`"
              class="block w-full rounded-xl px-4 py-3 text-center text-sm font-semibold text-white shadow"
              :style="accentStyle"
            >
              Ver en tienda
            </NuxtLink>
            <button
              class="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white shadow"
              :style="accentStyle"
              @click="handleAddToCart"
            >
              Agregar al carrito
            </button>
            <NuxtLink
              v-if="canEdit"
              to="/marketplace#mis-productos"
              class="block w-full rounded-xl border border-amber-200 px-4 py-3 text-center text-sm font-semibold text-amber-800 hover:bg-amber-50"
            >
              Editar mi publicación
            </NuxtLink>
          </div>
        </div>

        <div v-if="canEdit" class="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <div class="flex items-center justify-between gap-2">
            <h2 class="text-sm font-semibold text-amber-900">Editar publicación</h2>
            <span class="text-[11px] font-semibold text-amber-700">Solo visible para quien la subió</span>
          </div>
          <div class="mt-3 grid gap-3 md:grid-cols-2">
            <div class="space-y-1">
              <label class="text-xs text-amber-800">Nombre</label>
              <input v-model="editForm.name" type="text" class="w-full rounded-xl border border-amber-200 px-3 py-2 text-sm" />
            </div>
            <div class="space-y-1">
              <label class="text-xs text-amber-800">Precio</label>
              <input v-model.number="editForm.price" type="number" step="0.01" class="w-full rounded-xl border border-amber-200 px-3 py-2 text-sm" />
            </div>
            <div class="space-y-1">
              <label class="text-xs text-amber-800">Precio oferta</label>
              <input v-model.number="editForm.offer_price" type="number" step="0.01" class="w-full rounded-xl border border-amber-200 px-3 py-2 text-sm" />
            </div>
            <div class="space-y-1">
              <label class="text-xs text-amber-800">Categoría</label>
              <select v-model="editForm.category" class="w-full rounded-xl border border-amber-200 px-3 py-2 text-sm">
                <option value="">Sin categoría</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
            </div>
            <div class="space-y-1">
              <label class="text-xs text-amber-800">Stock disponible</label>
              <input v-model.number="editForm.stock_available" type="number" min="0" step="1" class="w-full rounded-xl border border-amber-200 px-3 py-2 text-sm" />
            </div>
            <div class="space-y-1">
              <label class="text-xs text-amber-800">Stock mínimo</label>
              <input v-model.number="editForm.stock_minimum" type="number" min="0" step="1" class="w-full rounded-xl border border-amber-200 px-3 py-2 text-sm" />
            </div>
            <div class="space-y-1 md:col-span-2">
              <label class="text-xs text-amber-800">Imagen (URL)</label>
              <input v-model="editForm.image_url" type="url" class="w-full rounded-xl border border-amber-200 px-3 py-2 text-sm" placeholder="https://..." />
              <div class="flex items-center gap-3 text-xs text-amber-700">
                <label class="inline-flex items-center gap-2 rounded-lg border border-amber-200 px-3 py-2 text-sm font-semibold text-amber-800 cursor-pointer hover:-translate-y-0.5 transition">
                  <input type="file" accept="image/*" class="hidden" @change="onFileSelect" />
                  <span>{{ uploadingImage ? 'Subiendo...' : 'Subir archivo' }}</span>
                </label>
                <span>o pega un enlace</span>
              </div>
              <p v-if="uploadError" class="text-xs text-red-600">{{ uploadError }}</p>
            </div>
            <div class="space-y-1 md:col-span-2">
              <label class="text-xs text-amber-800">Descripción</label>
              <textarea v-model="editForm.description" rows="3" class="w-full rounded-xl border border-amber-200 px-3 py-2 text-sm"></textarea>
            </div>
          </div>
          <div class="mt-3 flex flex-wrap items-center gap-3">
            <button
              class="rounded-xl px-4 py-2 text-sm font-semibold text-white shadow"
              :style="accentStyle"
              :disabled="saving"
              @click="saveEdits"
            >
              {{ saving ? 'Guardando...' : 'Guardar cambios' }}
            </button>
            <p v-if="saveMessage" class="text-sm text-emerald-700">{{ saveMessage }}</p>
            <p v-if="saveError" class="text-sm text-red-600">{{ saveError }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useRuntimeConfig, navigateTo } from 'nuxt/app'
import { definePageMeta } from '#imports'
import { useCartStore } from '~/stores/cart'
import { useTenantStore } from '~/stores/tenant'
import { useThemeStore } from '~/stores/theme'
import { useAuthStore } from '~/stores/auth'
import { useImages } from '~/composables/useImages'

definePageMeta({ layout: 'default' })

const route = useRoute()
const slugParam = route.params.slug as string
const config = useRuntimeConfig()
const cart = useCartStore()
const tenantStore = useTenantStore()
const theme = useThemeStore()
const auth = useAuthStore()
const { getProductImage } = useImages()

const product = ref<any | null>(null)
const loading = ref(true)
const error = ref('')
const saving = ref(false)
const saveMessage = ref('')
const saveError = ref('')
const editForm = ref({ name: '', description: '', price: 0, offer_price: null as number | null, category: '' as string | number, stock_available: 0, stock_minimum: 0, image_url: '' })
const categories = ref<any[]>([])
const uploadingImage = ref(false)
const uploadError = ref('')

const accentStyle = computed(() => ({ backgroundColor: theme.accent || '#2563eb', color: '#fff' }))
const productImage = computed(() => getProductImage(product.value))
const canEdit = computed(() => {
  const userId = (auth.user as any)?.id
  return Boolean(userId && product.value?.submitted_by === userId)
})

const isHttpsUrl = (value?: string) => {
  if (!value) return false
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'https:'
  } catch {
    return false
  }
}

const cloudinaryUploadUrl = computed(() => {
  if (config.public.cloudinaryUploadUrl) return config.public.cloudinaryUploadUrl
  if (config.public.cloudinaryCloudName) return `https://api.cloudinary.com/v1_1/${config.public.cloudinaryCloudName}/upload`
  return ''
})

const loadProduct = async () => {
  loading.value = true
  error.value = ''
  try {
    const data = await $fetch<any>(`${config.public.apiBase}/marketplace/products/${encodeURIComponent(slugParam)}/`)
    product.value = data
    editForm.value = {
      name: data.name || '',
      description: data.description || '',
      price: Number(data.price) || 0,
      offer_price: data.offer_price ? Number(data.offer_price) : null,
      category: data.category?.id || '',
      stock_available: Number(data.stock_available || 0),
      stock_minimum: Number(data.stock_minimum || 0),
      image_url: data.image_url || '',
    }
    if (data?.store?.slug) {
      tenantStore.setSlug(data.store.slug)
      theme.applyStoreTheme(data.store.slug)
    } else {
      theme.loadFromStorage()
      theme.applyTheme()
    }
  } catch (err: any) {
    // Fallback: intentar por ID si el slug falla y parece numérico
    const numericId = Number(slugParam)
    if (!product.value && Number.isFinite(numericId)) {
      try {
        const data = await $fetch<any>(`${config.public.apiBase}/marketplace/products/${numericId}/`)
        product.value = data
        editForm.value = {
          name: data.name || '',
          description: data.description || '',
          price: Number(data.price) || 0,
          offer_price: data.offer_price ? Number(data.offer_price) : null,
          category: data.category?.id || '',
          stock_available: Number(data.stock_available || 0),
          stock_minimum: Number(data.stock_minimum || 0),
          image_url: data.image_url || '',
        }
        if (data?.store?.slug) {
          tenantStore.setSlug(data.store.slug)
          theme.applyStoreTheme(data.store.slug)
        } else {
          theme.loadFromStorage()
          theme.applyTheme()
        }
        return
      } catch (err2: any) {
        /* fallthrough */
      }
    }
    const detail = err?.response?._data?.detail || err?.response?._data
    error.value = typeof detail === 'string' ? detail : 'Producto no encontrado'
    product.value = null
  } finally {
    loading.value = false
  }
}

const handleAddToCart = async () => {
  if (!product.value) return
  cart.setContext('marketplace')
  cart.addProduct(product.value)
  await navigateTo('/marketplace/carrito')
}

const saveEdits = async () => {
  if (!product.value || !auth.token) {
    saveError.value = 'Inicia sesión para editar tu publicación'
    return
  }
  if (!editForm.value.name?.trim()) {
    saveError.value = 'Ingresa un nombre'
    return
  }
  if (!editForm.value.price || editForm.value.price <= 0) {
    saveError.value = 'El precio debe ser mayor a 0'
    return
  }
  if (editForm.value.offer_price != null) {
    if (editForm.value.offer_price <= 0) {
      saveError.value = 'La oferta debe ser mayor a 0'
      return
    }
    if (editForm.value.offer_price >= editForm.value.price) {
      saveError.value = 'La oferta debe ser menor al precio'
      return
    }
  }
  if (editForm.value.stock_available != null && editForm.value.stock_available < 0) {
    saveError.value = 'El stock no puede ser negativo'
    return
  }
  if (editForm.value.stock_minimum != null && editForm.value.stock_minimum < 0) {
    saveError.value = 'El stock mínimo no puede ser negativo'
    return
  }
  if (uploadingImage.value) {
    saveError.value = 'Espera a que termine la subida de imagen'
    return
  }
  if (editForm.value.image_url && !isHttpsUrl(editForm.value.image_url)) {
    saveError.value = 'La imagen debe ser un enlace válido con https'
    return
  }
  saving.value = true
  saveMessage.value = ''
  saveError.value = ''
  try {
    const updated = await $fetch(`${config.public.apiBase}/marketplace/products/${encodeURIComponent(product.value.id || slugParam)}/`, {
      method: 'PATCH',
      body: {
        name: editForm.value.name,
        description: editForm.value.description,
        price: editForm.value.price,
        offer_price: editForm.value.offer_price,
        category: editForm.value.category || null,
        stock_available: editForm.value.stock_available,
        stock_minimum: editForm.value.stock_minimum,
        image_url: editForm.value.image_url,
      },
      headers: { Authorization: `Bearer ${auth.token}` },
    })
    product.value = updated
    saveMessage.value = 'Cambios guardados'
  } catch (err: any) {
    const detail = err?.response?._data?.detail || err?.response?._data
    saveError.value = typeof detail === 'string' ? detail : 'No pudimos guardar los cambios'
  } finally {
    saving.value = false
  }
}

const fetchCategories = async () => {
  try {
    categories.value = await $fetch(`${config.public.apiBase}/marketplace/categories/`)
  } catch {
    categories.value = []
  }
}

const uploadToCloudinary = async (fileOrUrl: File | string, folder = 'upload/product') => {
  if (!cloudinaryUploadUrl.value || !config.public.cloudinaryUploadPreset) {
    throw new Error('Configura CLOUDINARY_CLOUD_NAME y CLOUDINARY_UPLOAD_PRESET')
  }
  const formData = new FormData()
  formData.append('file', fileOrUrl)
  formData.append('upload_preset', config.public.cloudinaryUploadPreset)
  formData.append('folder', folder)
  return $fetch<any>(cloudinaryUploadUrl.value, { method: 'POST', body: formData })
}

const onFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target?.files?.[0]
  if (!file) return
  uploadError.value = ''
  uploadingImage.value = true
  try {
    const result = await uploadToCloudinary(file)
    if (!result?.secure_url) throw new Error('No pudimos obtener la URL de la imagen')
    editForm.value.image_url = result.secure_url
    if (product.value) {
      product.value.image_url = result.secure_url
    }
  } catch (err: any) {
    uploadError.value = err?.message || 'No pudimos subir la imagen'
  } finally {
    uploadingImage.value = false
    if (target) target.value = ''
  }
}

onMounted(async () => {
  theme.loadFromStorage()
  auth.restoreFromCookies()
  cart.loadFromStorage()
  cart.setContext('marketplace')
  await fetchCategories()
  await loadProduct()
})
</script>
