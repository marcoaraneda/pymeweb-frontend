<template>
  <div class="min-h-screen bg-slate-50 px-4 py-10">
    <div class="mx-auto max-w-5xl space-y-8">
      <NuxtLink to="/marketplace#productos" class="text-sm font-semibold text-slate-700 hover:text-slate-900">← Volver</NuxtLink>

      <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div v-if="loading" class="text-slate-500">Cargando producto...</div>
        <div v-else-if="error" class="text-red-600">{{ error }}</div>
        <div v-else-if="!product" class="text-slate-600">Producto no encontrado.</div>
        <div v-else class="relative grid gap-8 md:grid-cols-[1.05fr,0.95fr] md:items-start">
          <div class="space-y-4">
            <div class="relative aspect-square overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <img :src="productImage || '/logoPW.png'" :alt="product.name" class="h-full w-full object-cover" @error="onImgError($event)" />
              <button
                v-if="canEdit"
                @click="showEditForm = !showEditForm"
                class="absolute top-2 right-2 z-10 rounded-full bg-amber-100 p-2 shadow hover:bg-amber-200 transition"
                title="Editar producto"
                aria-label="Editar producto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5 text-amber-700">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487a2.1 2.1 0 1 1 2.97 2.97L8.978 18.312a4.2 4.2 0 0 1-1.768 1.06l-3.07.878a.6.6 0 0 1-.732-.732l.878-3.07a4.2 4.2 0 0 1 1.06-1.768L16.862 4.487Z" />
                </svg>
              </button>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p class="text-xs uppercase tracking-[0.2em] text-slate-500">Detalle</p>
              <p class="mt-2 text-sm text-slate-600 whitespace-pre-line">{{ product.description || 'Sin descripción disponible.' }}</p>
            </div>
          </div>

          <div class="space-y-4">
            <div class="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-500">
              <span>{{ product.category?.name || 'General' }}</span>
              <span class="rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-900">Marketplace</span>
              <span v-if="product.product_of_week" class="rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-800">Producto de la semana</span>
            </div>

            <h1 class="text-3xl font-bold text-slate-900">{{ product.name }}</h1>

            <div class="flex flex-wrap items-center gap-2">
              <span v-if="product.offer_price" class="rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-800">{{ discountBadge }}</span>
              <span v-if="product.free_shipping" class="rounded-full bg-sky-100 px-2 py-1 text-[11px] font-semibold text-sky-800">Envío gratis</span>
              <span v-if="product.offer_price && Number(product.offer_min_qty || 1) > 1" class="rounded-full bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700">Desde {{ Number(product.offer_min_qty) }} unidades</span>
            </div>

            <p class="text-3xl font-bold" :class="product.offer_price ? 'text-red-600' : 'text-black'">
              <span v-if="product.offer_price" class="mr-2 text-xl text-slate-400 line-through">{{ formatClp(product.price) }}</span>
              {{ formatClp(displayPrice) }}
            </p>

            <div class="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p class="text-xs text-slate-500">Publicación</p>
              <div class="flex flex-wrap gap-3 text-xs text-slate-600">
                <span v-if="product.submitted_by_name">
                  Vendedor:
                  <NuxtLink
                    v-if="product.submitted_by"
                    :to="`/marketplace/vendedores/${product.submitted_by}`"
                    class="font-semibold text-slate-700 hover:underline"
                  >
                    {{ product.submitted_by_name }}
                  </NuxtLink>
                  <span v-else class="font-semibold text-slate-700">{{ product.submitted_by_name }}</span>
                </span>
                <span>ID: {{ product.id }}</span>
              </div>
            </div>

            <div class="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <NuxtLink
              v-if="product.store?.slug && !product.store_is_marketplace"
              :to="`/store/${product.store.slug}/productos/${product.slug}`"
              class="block w-full rounded-xl px-4 py-3 text-center text-sm font-semibold text-white shadow"
              :style="accentStyle"
            >
              Ver en tienda
            </NuxtLink>
            <button
              class="inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow"
              :style="accentStyle"
              @click="handleAddToCart"
            >
              <ShoppingCart class="h-4 w-4" aria-hidden="true" />
              Agregar
            </button>
            <button
              v-if="canEdit"
              type="button"
              class="block w-full rounded-xl border border-amber-200 px-4 py-3 text-center text-sm font-semibold text-amber-800 hover:bg-amber-50"
              @click="showEditForm = true"
            >
              Editar mi publicación
            </button>
            </div>
          </div>
        </div>

        <div v-if="showEditForm" class="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <div class="flex items-center justify-between gap-2">
            <h2 class="text-sm font-semibold text-amber-900">Editar publicación</h2>
            <span class="text-[11px] font-semibold text-amber-700">Solo visible para quien la subió</span>
          </div>
          <div v-if="!canEdit" class="mt-2 rounded-lg border border-amber-200 bg-amber-100/60 px-3 py-2 text-xs text-amber-900">
            Verificando permisos de edición...
          </div>
          <div class="mt-3 grid gap-3 md:grid-cols-2">
            <div class="space-y-1">
              <label class="text-xs text-amber-800">Nombre</label>
              <input v-model="editForm.name" type="text" class="w-full rounded-xl border border-amber-200 px-3 py-2 text-sm" />
            </div>
            <div class="space-y-1">
              <label class="text-xs text-amber-800">Precio</label>
              <input v-model.number="editForm.price" type="number" min="0" step="1" class="w-full rounded-xl border border-amber-200 px-3 py-2 text-sm" />
            </div>
            <div class="space-y-1 md:col-span-2">
              <label class="inline-flex items-center gap-2 text-xs text-amber-800">
                <input v-model="hasOffer" type="checkbox" />
                Activar oferta
              </label>
            </div>
            <div v-if="hasOffer" class="space-y-1">
              <label class="text-xs text-amber-800">Precio oferta</label>
              <input v-model.number="editForm.offer_price" type="number" min="0" step="1" class="w-full rounded-xl border border-amber-200 px-3 py-2 text-sm" />
            </div>
            <div v-if="hasOffer" class="space-y-1">
              <label class="text-xs text-amber-800">Cantidad mínima para oferta</label>
              <input v-model.number="editForm.offer_min_qty" type="number" min="1" step="1" class="w-full rounded-xl border border-amber-200 px-3 py-2 text-sm" />
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
            <div v-if="supportsSizeStock" class="space-y-2 md:col-span-2">
              <label class="text-xs text-amber-800">Cantidad por talla</label>
              <div class="grid gap-2 sm:grid-cols-3">
                <div v-for="size in availableSizes" :key="`detail-size-${size}`" class="rounded-lg border border-amber-200 bg-white px-3 py-2">
                  <p class="text-xs font-semibold text-amber-900">{{ size }}</p>
                  <input
                    :value="sizeStockMap[size] || 0"
                    type="number"
                    min="0"
                    step="1"
                    class="mt-1 w-full rounded-lg border border-amber-200 px-2 py-1 text-sm"
                    @input="updateSizeQty(size, $event)"
                  />
                </div>
              </div>
              <p class="text-[11px] text-amber-800">El stock disponible se calcula automáticamente como suma de tallas.</p>
            </div>
            <div class="space-y-1 md:col-span-2">
              <label class="inline-flex items-center gap-2 text-xs text-amber-800">
                <input v-model="editForm.free_shipping" type="checkbox" />
                Envío gratis
              </label>
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
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useRuntimeConfig, navigateTo } from 'nuxt/app'
import { definePageMeta } from '#imports'
import { useCartStore } from '~/stores/cart'
import { useTenantStore } from '~/stores/tenant'
import { useThemeStore } from '~/stores/theme'
import { useAuthStore } from '~/stores/auth'
import { useImages } from '~/composables/useImages'
import { useMarketplaceRequests } from '~/composables/useMarketplaceRequests'
import { ShoppingCart } from 'lucide-vue-next'

definePageMeta({ layout: 'default' })

const route = useRoute()
const slugParam = route.params.slug as string
const config = useRuntimeConfig()
const cart = useCartStore()
const tenantStore = useTenantStore()
const theme = useThemeStore()
const auth = useAuthStore()
const { getProductImage } = useImages()
const { controlledGet, controlledMutation } = useMarketplaceRequests()

const product = ref<any | null>(null)
const loading = ref(true)
const error = ref('')
const saving = ref(false)
const saveMessage = ref('')
const saveError = ref('')
const editForm = ref({ name: '', description: '', price: 0, offer_price: null as number | null, offer_min_qty: 1, category: '' as string | number, stock_available: 0, stock_minimum: 0, image_url: '', free_shipping: false })
const categories = ref<any[]>([])
const sizeStockMap = reactive<Record<string, number>>({})
const uploadingImage = ref(false)
const uploadError = ref('')
const hasOffer = ref(false)
const apparelSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const shoeSizes = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45']

const selectedCategoryName = computed(() => {
  const selected = categories.value.find((cat: any) => String(cat.id) === String(editForm.value.category))
  return String(selected?.name || product.value?.category?.name || '').toLowerCase()
})

const supportsSizeStock = computed(() => /calzado|poleron|polerón|pantalon|pantalón/.test(selectedCategoryName.value))
const availableSizes = computed(() => (/calzado/.test(selectedCategoryName.value) ? shoeSizes : apparelSizes))

const syncStockFromSizes = () => {
  if (!supportsSizeStock.value) return
  editForm.value.stock_available = Object.values(sizeStockMap).reduce((acc, qty) => acc + (Number(qty) || 0), 0)
}

const updateSizeQty = (size: string, event: Event) => {
  const target = event.target as HTMLInputElement | null
  const qty = Math.max(0, Number(target?.value || 0))
  sizeStockMap[size] = qty
  syncStockFromSizes()
}

const accentStyle = computed(() => ({ backgroundColor: theme.accent || '#2563eb', color: '#fff' }))
const productImage = computed(() => {
  if (editForm.value.image_url) return editForm.value.image_url
  if (product.value?.image_url) return product.value.image_url
  if (product.value?.image) return product.value.image
  return getProductImage(product.value)
})
const displayPrice = computed(() => {
  if (product.value?.offer_price && Number(product.value?.offer_min_qty || 1) <= 1) {
    return Number(product.value.offer_price)
  }
  return Number(product.value?.price || 0)
})
const discountPercent = computed(() => {
  const price = Number(product.value?.price || 0)
  const offer = Number(product.value?.offer_price || 0)
  if (!price || !offer || offer >= price) return 0
  return Math.round(((price - offer) / price) * 100)
})
const discountBadge = computed(() => (discountPercent.value > 0 ? `${discountPercent.value}%` : ''))
const formatClp = (value: number | string) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Number(value) || 0)
const canEdit = computed(() => {
  const userId = String((auth.user as any)?.id ?? '')
  const username = String((auth.user as any)?.username ?? '').trim().toLowerCase()
  const candidateOwnerId =
    product.value?.submitted_by ??
    product.value?.submitted_by_id ??
    product.value?.owner_id ??
    product.value?.user_id ??
    product.value?.owner?.id ??
    product.value?.user?.id ??
    ''
  const submittedBy = String(
    typeof candidateOwnerId === 'object' && candidateOwnerId !== null
      ? (candidateOwnerId as any).id ?? ''
      : candidateOwnerId,
  )
  const submittedByName = String(
    product.value?.submitted_by_name ??
      product.value?.owner_name ??
      product.value?.user_name ??
      '',
  )
    .trim()
    .toLowerCase()
  const byId = Boolean(userId && submittedBy && userId === submittedBy)
  const byName = Boolean(username && submittedByName && username === submittedByName)
  const byFlag = Boolean(product.value?.is_owner === true)
  return byId || byName || byFlag
})
const showEditForm = ref(false)
const wantsEditFromQuery = computed(() => String(route.query.edit || '') === '1')

watch([canEdit, wantsEditFromQuery], ([editable, wantsEdit]) => {
  if (wantsEdit) {
    showEditForm.value = true
    return
  }
  if (!editable && showEditForm.value) {
    showEditForm.value = false
  }
}, { immediate: true })

const isHttpsUrl = (value?: string) => {
  if (!value) return false
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'https:'
  } catch {
    return false
  }
}

const onImgError = (event: Event) => {
  const target = event.target as HTMLImageElement | null
  if (!target) return
  target.onerror = null
  target.src = '/logoPW.png'
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
    const data = await controlledGet<any>(
      `marketplace:product:${encodeURIComponent(slugParam)}`,
      `${config.public.apiBase}/marketplace/products/${encodeURIComponent(slugParam)}/`,
      { backoffMs: 8_000, minIntervalMs: 300 },
    )
    product.value = data
    editForm.value = {
      name: data.name || '',
      description: data.description || '',
      price: Number(data.price) || 0,
      offer_price: data.offer_price ? Number(data.offer_price) : null,
      offer_min_qty: Math.max(1, Number(data.offer_min_qty || 1)),
      category: data.category?.id || '',
      stock_available: Number(data.stock_available || 0),
      stock_minimum: Number(data.stock_minimum || 0),
      image_url: data.image_url || '',
      free_shipping: Boolean(data.free_shipping),
    }
    Object.keys(sizeStockMap).forEach((key) => delete sizeStockMap[key])
    const map = data?.size_stock_map || {}
    Object.entries(map).forEach(([size, qty]) => {
      const n = Math.max(0, Number(qty || 0))
      if (n > 0) sizeStockMap[size] = n
    })
    hasOffer.value = editForm.value.offer_price != null
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
        const data = await controlledGet<any>(
          `marketplace:product:${numericId}`,
          `${config.public.apiBase}/marketplace/products/${numericId}/`,
          { backoffMs: 8_000, minIntervalMs: 300 },
        )
        product.value = data
        editForm.value = {
          name: data.name || '',
          description: data.description || '',
          price: Number(data.price) || 0,
          offer_price: data.offer_price ? Number(data.offer_price) : null,
          offer_min_qty: Math.max(1, Number(data.offer_min_qty || 1)),
          category: data.category?.id || '',
          stock_available: Number(data.stock_available || 0),
          stock_minimum: Number(data.stock_minimum || 0),
          image_url: data.image_url || '',
          free_shipping: Boolean(data.free_shipping),
        }
        hasOffer.value = editForm.value.offer_price != null
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
  if (hasOffer.value) {
    if (editForm.value.offer_price == null || editForm.value.offer_price <= 0) {
      saveError.value = 'La oferta debe ser mayor a 0'
      return
    }
    if (Number(editForm.value.offer_price) >= Number(editForm.value.price)) {
      saveError.value = 'La oferta debe ser menor al precio'
      return
    }
    if (Number(editForm.value.offer_min_qty || 0) < 1) {
      saveError.value = 'La cantidad mínima para oferta debe ser al menos 1'
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
    const updated = await controlledMutation<any>(
      `marketplace:product:update:${encodeURIComponent(product.value.id || slugParam)}`,
      `${config.public.apiBase}/marketplace/products/${encodeURIComponent(product.value.id || slugParam)}/`,
      {
        method: 'PATCH',
        body: {
          name: editForm.value.name,
          description: editForm.value.description,
          price: editForm.value.price,
          offer_price: hasOffer.value ? editForm.value.offer_price : null,
          offer_min_qty: hasOffer.value ? Math.max(1, Number(editForm.value.offer_min_qty) || 1) : 1,
          category: editForm.value.category || null,
          stock_available: editForm.value.stock_available,
          stock_minimum: editForm.value.stock_minimum,
          size_stock_map: supportsSizeStock.value ? Object.fromEntries(Object.entries(sizeStockMap).filter(([_, qty]) => Number(qty) > 0)) : {},
          image_url: editForm.value.image_url,
          free_shipping: Boolean(editForm.value.free_shipping),
        },
        headers: { Authorization: `Bearer ${auth.token}` },
        backoffMs: 10_000,
      },
    )
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
  if (wantsEditFromQuery.value) {
    showEditForm.value = true
  }
  await auth.initializeSession().catch(() => null)
  cart.loadFromStorage()
  cart.setContext('marketplace')
  await fetchCategories()
  await loadProduct()
  if (wantsEditFromQuery.value) {
    showEditForm.value = true
  }
})

watch(
  () => editForm.value.offer_price,
  (value) => {
    if (value == null) return
    hasOffer.value = true
  },
)

watch(hasOffer, (enabled) => {
  if (!enabled) {
    editForm.value.offer_price = null
    editForm.value.offer_min_qty = 1
  }
})

watch([supportsSizeStock, availableSizes], () => {
  if (!supportsSizeStock.value) {
    Object.keys(sizeStockMap).forEach((key) => delete sizeStockMap[key])
    return
  }
  availableSizes.value.forEach((size) => {
    if (sizeStockMap[size] == null) sizeStockMap[size] = 0
  })
  Object.keys(sizeStockMap).forEach((size) => {
    if (!availableSizes.value.includes(size)) delete sizeStockMap[size]
  })
  syncStockFromSizes()
}, { immediate: true })
</script>
