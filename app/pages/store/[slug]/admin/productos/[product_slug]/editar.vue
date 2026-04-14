<template>
  <div class="bg-slate-50 px-4 py-10 min-h-screen">
    <div class="mx-auto max-w-3xl space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs uppercase tracking-[0.25em] text-slate-500">Productos</p>
          <h1 class="text-2xl font-bold text-slate-900">Editar producto</h1>
        </div>
        <NuxtLink :to="backPath" class="text-sm font-semibold text-slate-700 hover:text-slate-900">Volver</NuxtLink>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div class="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <p class="font-semibold text-slate-900">Tienda: {{ slug }}</p>
          <p class="text-slate-600">Slug del producto: {{ productSlug }}</p>
          <p class="mt-1 text-slate-600">Descripción actual: {{ form.description || 'Sin descripción aún' }}</p>
        </div>

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
              <input v-model.number="form.price" type="number" min="0" step="1" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div class="space-y-2">
              <label class="text-sm text-slate-600">Precio oferta por unidad (opcional)</label>
              <input v-model.number="form.offer_price" type="number" min="0" step="1" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              <p class="text-xs text-slate-500">Ej: 1990 para mostrar un pack como 3x1990.</p>
            </div>
            <div class="space-y-2 sm:col-span-2">
              <label class="text-sm text-slate-600">Cantidad mínima para oferta</label>
              <input v-model.number="form.offer_min_qty" type="number" min="1" step="1" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              <p class="text-xs text-slate-500">Ej: 3 para activar la oferta desde 3 unidades.</p>
            </div>
          </div>
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="space-y-2">
              <label class="text-sm text-slate-600">Stock disponible</label>
              <input v-model.number="form.stock_available" type="number" min="0" step="1" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div class="space-y-2">
              <label class="text-sm text-slate-600">Stock mínimo</label>
              <input v-model.number="form.stock_minimum" type="number" min="0" step="1" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </div>
          </div>
          <div class="space-y-2">
            <label class="text-sm text-slate-600">Categoría</label>
            <select v-model="form.category" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
              <option value="">Sin categoría</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
            <p class="text-xs text-slate-500">Selecciona una categoría para este producto.</p>
          </div>
          <div class="space-y-2">
            <label class="text-sm text-slate-600">Marca (opcional)</label>
            <input v-model="form.brand" type="text" placeholder="Ej: Nike, Samsung, Oster" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <p class="text-xs text-slate-500">Se usa para dividir vitrinas por marca dentro de cada categoría.</p>
          </div>
          <div v-if="requiresSizeQty" class="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div>
              <p class="text-sm font-semibold text-slate-900">Cantidad por talla {{ isShoesCategory ? 'de zapatilla' : '' }}</p>
              <p class="text-xs text-slate-500">Define unidades por talla. El total reemplaza el stock disponible.</p>
            </div>
            <div class="grid gap-2 sm:grid-cols-3">
              <label v-for="size in activeSizeOptions" :key="size" class="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                <span class="font-semibold text-slate-700">{{ size }}</span>
                <input v-model.number="sizeQty[size]" type="number" min="0" step="1" class="w-20 rounded-lg border border-slate-200 px-2 py-1 text-right" />
              </label>
            </div>
            <p class="text-xs text-slate-600">Total por talla: <span class="font-semibold">{{ sizeQtyTotal }}</span> unidades.</p>
          </div>

          <div class="flex flex-wrap gap-4">
            <label class="inline-flex items-center gap-2 text-sm text-slate-700">
              <input v-model="form.is_featured" type="checkbox" />
              Oferta destacada (palomita)
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
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p class="text-xs uppercase tracking-[0.2em] text-slate-500">Inventario registrado</p>
                <p class="text-lg font-semibold text-slate-900">{{ totalStock }} unidades</p>
                <p v-if="!variants.length" class="text-xs text-slate-500">Stock base del producto (sin variantes).</p>
              </div>
              <NuxtLink
                :to="`/store/${slug}/admin/inventario`"
                class="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300"
              >
                Abrir inventario
              </NuxtLink>
            </div>
            <div v-if="variants.length" class="rounded-xl border border-slate-200 bg-white">
              <div v-for="variant in variants" :key="variant.id" class="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0">
                <div>
                  <p class="text-sm font-semibold text-slate-900">{{ variant.name }}</p>
                  <p v-if="variant.sku" class="text-xs text-slate-500">SKU: {{ variant.sku }}</p>
                </div>
                <p class="text-sm font-semibold" :class="variantStockClass(variant.stock_available)">
                  {{ variantStockLabel(variant.stock_available) }}
                </p>
              </div>
            </div>
            <p v-else class="text-sm text-slate-600">Sin variantes; el stock editable está arriba.</p>
          </div>
          <div class="space-y-2">
            <label class="text-sm text-slate-600">Imagen (URL)</label>
            <input v-model="form.image_url" type="url" placeholder="https://..." class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <p class="text-xs text-slate-500">Se envía a Cloudinary y se guarda como imagen principal.</p>
          </div>
          <div class="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div class="flex items-center justify-between">
              <p class="text-sm font-semibold text-slate-800">Galería adicional</p>
              <span class="text-xs font-semibold text-slate-500">{{ galleryPreview.length }}/{{ MAX_GALLERY_IMAGES }}</span>
            </div>
            <p class="text-xs text-slate-500">Puedes agregar hasta {{ MAX_GALLERY_IMAGES }} imágenes en total (incluye la principal).</p>

            <div class="grid gap-3 sm:grid-cols-[1fr,auto]">
              <input
                v-model="galleryUrlInput"
                type="url"
                placeholder="https://..."
                class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                :disabled="!canAddMoreImages"
              />
              <button
                class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                :disabled="!canAddMoreImages"
                @click="addGalleryUrl"
              >
                Agregar URL
              </button>
            </div>

            <div class="flex flex-wrap items-center gap-3">
              <label class="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                <input type="file" accept="image/*" class="hidden" :disabled="!canAddMoreImages || uploadingGallery" @change="onGalleryFileSelect" />
                <span>{{ uploadingGallery ? 'Subiendo...' : 'Subir imagen' }}</span>
              </label>
              <span v-if="!canAddMoreImages" class="text-xs font-semibold text-amber-700">Máximo de imágenes alcanzado.</span>
            </div>

            <div v-if="galleryPreview.length" class="grid grid-cols-3 gap-2 sm:grid-cols-5">
              <div
                v-for="(image, index) in galleryPreview"
                :key="`${image}-${index}`"
                class="group relative overflow-hidden rounded-lg border border-slate-200 bg-white"
              >
                <img :src="image" :alt="`Imagen ${index + 1}`" class="h-20 w-full object-cover" />
                <button
                  v-if="index >= existingImageUrls.length"
                  type="button"
                  class="absolute right-1 top-1 hidden h-6 w-6 items-center justify-center rounded-full bg-black/70 text-xs font-bold text-white group-hover:inline-flex"
                  @click="removePendingImage(index - existingImageUrls.length)"
                >
                  ×
                </button>
              </div>
            </div>

            <p v-if="galleryMessage" class="text-xs" :class="galleryStatus === 'error' ? 'text-red-600' : 'text-emerald-700'">
              {{ galleryMessage }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button
            class="rounded-xl px-4 py-2 text-sm font-semibold text-white shadow"
            :style="accentStyle"
            :disabled="saving"
            @click="save"
          >
            {{ saving ? 'Guardando...' : 'Guardar cambios' }}
          </button>
          <button
            class="rounded-xl px-4 py-2 text-sm font-semibold text-white shadow bg-red-600"
            :disabled="deleting"
            @click="removeProduct"
          >
            {{ deleting ? 'Eliminando...' : 'Eliminar producto' }}
          </button>
          <p class="text-sm" v-if="message" :class="messageType === 'error' ? 'text-red-600' : 'text-green-600'">{{ message }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useRuntimeConfig, navigateTo } from 'nuxt/app'
import { definePageMeta } from '#imports'
import { useAuthStore } from '~/stores/auth'
import { useThemeStore } from '~/stores/theme'
import { useTenantStore } from '~/stores/tenant'
import { getCatalogCategorySeedsByStoreType } from '~/constants/catalogCategorySeeds'

definePageMeta({ layout: 'store', middleware: ['tenant', 'auth'], requiresAuth: true })
const route = useRoute() as any
const params = (route?.params || {}) as Record<string, string>
const config = useRuntimeConfig()
const auth = useAuthStore()
const theme = useThemeStore()
const tenantStore = useTenantStore()

// Force params to plain strings to avoid deep conditional route types
const slug = params.slug || ''
const productSlug = params.product_slug || ''
const backPath = computed(() => `/store/${slug}/productos`)

const form = reactive({
  id: null as number | null,
  name: '',
  slug: '',
  brand: '',
  description: '',
  price: 0,
  offer_price: null as number | null,
  offer_min_qty: 1,
  is_featured: false,
  product_of_week: false,
  is_active: true,
  image_url: '',
  is_marketplace: false,
  category: '' as string | number,
  stock_available: 0,
  stock_minimum: 0,
})
const MAX_GALLERY_IMAGES = 5
const existingImageUrls = ref<string[]>([])
const pendingExtraImages = ref<string[]>([])
const galleryUrlInput = ref('')
const uploadingGallery = ref(false)
const galleryMessage = ref('')
const galleryStatus = ref<'ok' | 'error'>('ok')

const saving = ref(false)
const deleting = ref(false)
const message = ref('')
const messageType = ref<'ok' | 'error'>('ok')
const variants = ref<any[]>([])
const clothingSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const shoeSizes = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44']
const sizeOptions = [...clothingSizes, ...shoeSizes]
const sizeQty = reactive<Record<string, number>>({})
sizeOptions.forEach((size) => {
  sizeQty[size] = 0
})

const accentStyle = computed(() => ({ backgroundColor: theme.accent, color: '#fff' }))
const categories = ref<any[]>([])
const cloudinaryUploadUrl = computed(() => {
  if (config.public.cloudinaryUploadUrl) return config.public.cloudinaryUploadUrl
  if (config.public.cloudinaryCloudName) return `https://api.cloudinary.com/v1_1/${config.public.cloudinaryCloudName}/upload`
  return ''
})
const galleryPreview = computed(() => [...existingImageUrls.value, ...pendingExtraImages.value].slice(0, MAX_GALLERY_IMAGES))
const canAddMoreImages = computed(() => galleryPreview.value.length < MAX_GALLERY_IMAGES)
const selectedCategoryName = computed(() => {
  const selected = categories.value.find((cat: any) => String(cat.id) === String(form.category))
  return String(selected?.name || '').toLowerCase()
})
const isShoesCategory = computed(() => /calzado|zapat|shoe|sneaker/.test(selectedCategoryName.value))
const isClothingCategory = computed(() => /ropa|vest|camis|pantal|polera|poleron|polerón/.test(selectedCategoryName.value))
const requiresSizeQty = computed(() => isShoesCategory.value || isClothingCategory.value)
const activeSizeOptions = computed(() => (isShoesCategory.value ? shoeSizes : clothingSizes))
const sizeQtyTotal = computed(() => activeSizeOptions.value.reduce((acc, size) => acc + (Number(sizeQty[size]) || 0), 0))

const normalizedSizeStockMap = computed(() => {
  const map: Record<string, number> = {}
  activeSizeOptions.value.forEach((size) => {
    const qty = Math.max(0, Number(sizeQty[size]) || 0)
    if (qty > 0) map[size] = qty
  })
  return map
})

watch(
  () => [requiresSizeQty.value, sizeQtyTotal.value],
  () => {
    if (requiresSizeQty.value) {
      form.stock_available = sizeQtyTotal.value
    }
  }
)

const authedFetch = async <T>(url: string, options: Record<string, any> = {}) => {
  if (!auth.token) {
    await auth.initializeSession()
  }
  if (!auth.token && auth.refreshToken) {
    await auth.refreshTokens()
  }
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

const normalizeStock = (value: any) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const variantStockLabel = (value: any) => {
  const stock = normalizeStock(value)
  if (stock <= 0) return 'Sin stock'
  if (stock <= 5) return `Stock bajo (${stock})`
  return `${stock} en inventario`
}

const variantStockClass = (value: any) => {
  const stock = normalizeStock(value)
  if (stock <= 0) return 'text-red-600'
  if (stock <= 5) return 'text-amber-600'
  return 'text-emerald-600'
}

const totalStock = computed(() => {
  // Si no hay variantes, usar el stock base del producto editable arriba.
  if (!variants.value.length) return normalizeStock(form.stock_available)
  return variants.value.reduce((acc, variant) => acc + normalizeStock(variant.stock_available), 0)
})

const loadCategories = async () => {
  try {
    tenantStore.setSlug(slug)
    if (!tenantStore.data) {
      await tenantStore.fetchTienda()
    }

    const storeType = String((tenantStore.data as any)?.store_type || 'retail')
    const allowedSeeds = getCatalogCategorySeedsByStoreType(storeType)
    const allowedSlugs = new Set(allowedSeeds.map((seed) => seed.slug))

    let fetchedCategories = await authedFetch<any[]>(`${config.public.apiBase}/store/${slug}/catalogo/categories/`)
    const existingSlugs = new Set(fetchedCategories.map((cat: any) => String(cat?.slug || '').toLowerCase()))
    let createdAny = false

    for (const seed of allowedSeeds) {
      if (existingSlugs.has(seed.slug)) continue
      try {
        await authedFetch(`${config.public.apiBase}/store/${slug}/catalogo/categories/`, {
          method: 'POST',
          body: seed,
        })
        createdAny = true
      } catch {
        // Si no se puede crear por permisos o estado, mantenemos flujo sin bloquear.
      }
    }

    if (createdAny) {
      fetchedCategories = await authedFetch<any[]>(`${config.public.apiBase}/store/${slug}/catalogo/categories/`)
    }

    categories.value = fetchedCategories.filter((cat: any) => allowedSlugs.has(String(cat?.slug || '').toLowerCase()))
  } catch (error) {
    categories.value = []
  }
}

const load = async () => {
  try {
    const data = await authedFetch<any>(`${config.public.apiBase}/store/${slug}/catalogo/products/${productSlug}/`)
    form.id = data.id
    form.name = data.name
    form.slug = data.slug
    form.brand = data.brand || ''
    form.description = data.description
    form.price = data.price
    form.offer_price = data.offer_price
    form.offer_min_qty = Number(data.offer_min_qty || 1)
    form.is_featured = data.is_featured
    form.product_of_week = data.product_of_week
    form.is_active = data.is_active
    form.is_marketplace = data.is_marketplace
    existingImageUrls.value = (data?.images || []).map((img: any) => img?.image).filter(Boolean).slice(0, MAX_GALLERY_IMAGES)
    pendingExtraImages.value = []
    form.image_url = existingImageUrls.value[0] || data.image_url || ''
    form.category = data.category?.id || ''
    form.stock_available = data.stock_available ?? 0
    form.stock_minimum = data.stock_minimum ?? 0
    variants.value = data.variants || []
    sizeOptions.forEach((size) => {
      sizeQty[size] = 0
    })
    const incomingMap = (data?.size_stock_map && typeof data.size_stock_map === 'object') ? data.size_stock_map : {}
    Object.entries(incomingMap).forEach(([size, qty]) => {
      if (Object.prototype.hasOwnProperty.call(sizeQty, size)) {
        sizeQty[size] = Math.max(0, Number(qty) || 0)
      }
    })
  } catch (error) {
    message.value = 'No pudimos cargar el producto'
    messageType.value = 'error'
  }
}

const removeProduct = async () => {
  if (!auth.token || !form.id) {
    message.value = 'Inicia sesión para eliminar'
    messageType.value = 'error'
    return
  }
  if (!confirm('¿Eliminar este producto?')) return
  deleting.value = true
  message.value = ''
  try {
    await authedFetch(`${config.public.apiBase}/store/${slug}/admin/catalogo/products/${form.id}/`, {
      method: 'DELETE',
    })
    await navigateTo({ path: backPath.value })
  } catch (error: any) {
    message.value = error?.response?._data || 'No pudimos eliminar el producto'
    messageType.value = 'error'
  } finally {
    deleting.value = false
  }
}

const save = async () => {
  if (!auth.token || !form.id) {
    message.value = 'Inicia sesión para editar'
    messageType.value = 'error'
    return
  }
  saving.value = true
  message.value = ''
  try {
    const payload: any = {
      name: form.name,
      slug: form.slug,
      brand: String(form.brand || '').trim(),
      description: form.description,
      price: form.price,
      offer_price: form.offer_price,
      offer_min_qty: Math.max(1, Number(form.offer_min_qty) || 1),
      is_featured: form.is_featured,
      product_of_week: form.product_of_week,
      is_active: form.is_active,
      is_marketplace: form.is_marketplace,
      stock_available: Number(form.stock_available) || 0,
      stock_minimum: Number(form.stock_minimum) || 0,
      size_stock_map: requiresSizeQty.value ? normalizedSizeStockMap.value : {},
    }

    if (form.image_url) payload.image_url = form.image_url
    if (pendingExtraImages.value.length) {
      payload.extra_images = pendingExtraImages.value.slice(0, Math.max(0, MAX_GALLERY_IMAGES - existingImageUrls.value.length))
    }
    if (form.category) payload.category = form.category

    await authedFetch(`${config.public.apiBase}/store/${slug}/admin/catalogo/products/${form.id}/`, {
      method: 'PATCH',
      body: payload,
    })
    message.value = 'Producto actualizado'
    messageType.value = 'ok'
    await navigateTo({ path: backPath.value })
  } catch (error: any) {
    message.value = getErrorMessage(error)
    messageType.value = 'error'
  } finally {
    saving.value = false
  }
}

const getErrorMessage = (error: any) => {
  const payload = error?.response?._data
  if (typeof payload === 'string') return payload
  if (Array.isArray(payload)) return payload.join(', ')
  if (payload && typeof payload === 'object') return Object.values(payload).flat().join(', ')
  return error?.message || 'No se pudo completar la acción'
}

const isValidUrl = (value: string) => {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

const addGalleryUrl = () => {
  galleryMessage.value = ''
  const url = galleryUrlInput.value.trim()
  if (!url) return
  if (!isValidUrl(url)) {
    galleryStatus.value = 'error'
    galleryMessage.value = 'Ingresa una URL válida para la imagen.'
    return
  }
  if (!canAddMoreImages.value) {
    galleryStatus.value = 'error'
    galleryMessage.value = `Máximo ${MAX_GALLERY_IMAGES} imágenes por producto.`
    return
  }
  pendingExtraImages.value.push(url)
  galleryUrlInput.value = ''
  galleryStatus.value = 'ok'
  galleryMessage.value = 'Imagen agregada. Guarda cambios para aplicar.'
}

const removePendingImage = (index: number) => {
  if (index < 0 || index >= pendingExtraImages.value.length) return
  pendingExtraImages.value.splice(index, 1)
}

const uploadToCloudinary = async (file: File) => {
  if (!cloudinaryUploadUrl.value || !config.public.cloudinaryUploadPreset) {
    throw new Error('Configura Cloudinary para subir imágenes')
  }
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', config.public.cloudinaryUploadPreset)
  formData.append('folder', 'upload/product')
  return await $fetch<any>(cloudinaryUploadUrl.value, { method: 'POST', body: formData })
}

const onGalleryFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target?.files?.[0]
  if (!file) return
  if (!canAddMoreImages.value) {
    galleryStatus.value = 'error'
    galleryMessage.value = `Máximo ${MAX_GALLERY_IMAGES} imágenes por producto.`
    target.value = ''
    return
  }
  uploadingGallery.value = true
  galleryMessage.value = ''
  try {
    const uploaded = await uploadToCloudinary(file)
    if (!uploaded?.secure_url) throw new Error('No se pudo obtener URL de la imagen')
    pendingExtraImages.value.push(uploaded.secure_url)
    galleryStatus.value = 'ok'
    galleryMessage.value = 'Imagen subida. Guarda cambios para aplicar.'
  } catch (error: any) {
    galleryStatus.value = 'error'
    galleryMessage.value = getErrorMessage(error)
  } finally {
    uploadingGallery.value = false
    if (target) target.value = ''
  }
}

onMounted(async () => {
  await auth.initializeSession()
  tenantStore.setSlug(slug)
  theme.loadFromStorage()
  theme.applyStoreTheme(slug)
  await Promise.all([load(), loadCategories()])
})
</script>
