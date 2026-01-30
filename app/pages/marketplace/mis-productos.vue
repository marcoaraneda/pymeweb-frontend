<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <section class="border-b bg-white">
      <div class="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 md:flex-row md:items-center md:justify-between">
        <div class="space-y-2">
          <p class="text-xs uppercase tracking-[0.2em] text-slate-500">Marketplace</p>
          <h1 class="text-3xl font-bold text-slate-900">Mis publicaciones</h1>
          <p class="text-sm text-slate-600">Publica productos sin tienda y controla su estado (activo/vendido).</p>
        </div>
        <div class="flex flex-wrap gap-3">
          <NuxtLink to="/marketplace" class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:-translate-y-0.5 transition">
            Volver al marketplace
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-6xl px-6 py-10 space-y-6">
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-slate-900">Publicar nuevo producto</h2>
        <p class="text-sm text-slate-600">Se crea en tu tienda oculta de marketplace. Puedes activarlo o desactivarlo cuando se venda.</p>
        <div class="mt-4 grid gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <label class="text-sm text-slate-600">Nombre</label>
            <input v-model="form.name" type="text" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div class="space-y-2">
            <label class="text-sm text-slate-600">Precio</label>
            <input v-model.number="form.price" type="number" step="0.01" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div class="space-y-2">
            <label class="text-sm text-slate-600">Precio oferta (opcional)</label>
            <input v-model.number="form.offer_price" type="number" step="0.01" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div class="space-y-2">
            <label class="text-sm text-slate-600">Imagen (URL)</label>
            <input v-model="form.image_url" type="url" placeholder="https://..." class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <p class="text-xs text-slate-500">Opcional; se sube a Cloudinary.</p>
          </div>
          <div class="space-y-2 md:col-span-2">
            <label class="text-sm text-slate-600">Descripción</label>
            <textarea v-model="form.description" rows="3" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"></textarea>
          </div>
        </div>
        <div class="mt-4 flex items-center gap-3">
          <button
            class="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow"
            :style="accentStyle"
            :disabled="submitting || !form.name || !form.price"
            @click="submit"
          >
            <Loader2 v-if="submitting" class="h-4 w-4 animate-spin" />
            {{ submitting ? 'Publicando...' : 'Publicar producto' }}
          </button>
          <p v-if="formMessage" class="text-sm" :class="formMessageType === 'error' ? 'text-red-600' : 'text-green-600'">{{ formMessage }}</p>
        </div>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-slate-900">Mis productos</h2>
            <p class="text-sm text-slate-600">Activa o desactiva cuando se venda.</p>
          </div>
          <button
            class="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:-translate-y-0.5 transition"
            @click="fetchMySubmissions"
            :disabled="loading"
          >
            <Loader2 v-if="loading" class="h-4 w-4 animate-spin" />
            Recargar
          </button>
        </div>

        <div v-if="loading" class="mt-4 text-slate-500">Cargando mis productos...</div>
        <div v-else-if="error" class="mt-4 text-red-600">{{ error }}</div>
        <div v-else-if="!submissions.length" class="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-slate-600">
          Aún no publicas productos en marketplace.
        </div>
        <div v-else class="mt-4 grid gap-4 md:grid-cols-2">
          <article
            v-for="item in submissions"
            :key="item.id"
            class="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div class="flex items-center justify-between gap-2 relative">
              <p class="text-sm font-semibold text-slate-900 line-clamp-1">{{ item.name }}</p>
              <span
                class="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold"
                :class="item.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'"
              >
                <CheckCircle2 v-if="item.is_active" class="h-4 w-4" />
                <XCircle v-else class="h-4 w-4" />
                {{ item.is_active ? 'Activo' : 'Inactivo' }}
              </span>
              <div class="relative">
                <button @click="openMenu(item.id)" class="ml-2 p-1 rounded-full hover:bg-slate-100 focus:outline-none">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>
                </button>
                <div v-if="openMenuId === item.id" class="absolute right-0 top-8 z-50 min-w-[160px] rounded-xl border border-slate-200 bg-white shadow-lg">
                  <button @click="goToDetail(item)" class="flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    Ver detalle
                  </button>
                  <button @click="goToEdit(item)" class="flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    Editar
                  </button>
                  <button @click="deleteProduct(item)" class="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
            <p class="text-sm text-slate-600 line-clamp-2">{{ item.description || 'Sin descripción' }}</p>
            <p class="text-base font-bold" :class="item.offer_price ? 'text-red-600' : 'text-slate-900'">
              <span v-if="item.offer_price" class="mr-1 text-slate-400 line-through">${{ item.price }}</span>
              ${{ item.offer_price || item.price }}
            </p>
            <div class="flex items-center gap-2 text-xs text-slate-500">
              <span>Slug: {{ item.slug }}</span>
              <span>·</span>
              <span>ID: {{ item.id }}</span>
            </div>
            <div class="flex flex-wrap gap-2">
              <button
                class="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:-translate-y-0.5 transition"
                :disabled="togglingId === item.id"
                @click="toggleActive(item)"
              >
                <Loader2 v-if="togglingId === item.id" class="h-4 w-4 animate-spin" />
                {{ item.is_active ? 'Marcar vendido (desactivar)' : 'Reactivar' }}
              </button>
            </div>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, computed } from 'vue'
import { useRuntimeConfig, navigateTo } from 'nuxt/app'
import { useAuthStore } from '~/stores/auth'
import { useThemeStore } from '~/stores/theme'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-vue-next'

const openMenuId = ref<number|null>(null)
const openMenu = (id:number) => {
  openMenuId.value = openMenuId.value === id ? null : id
}
const goToDetail = (item:any) => {
  openMenuId.value = null
  navigateTo(`/marketplace/productos/${item.slug}`)
}
const goToEdit = (item:any) => {
  openMenuId.value = null
  navigateTo(`/marketplace/productos/${item.slug}?edit=1`)
}
const deleteProduct = (item:any) => {
  openMenuId.value = null
  // Aquí irá la lógica real de borrado
  alert('Eliminar producto: ' + item.name)
}

const auth = useAuthStore()
const theme = useThemeStore()
const config = useRuntimeConfig()

const submissions = ref<any[]>([])
const loading = ref(false)
const error = ref('')
const submitting = ref(false)
const togglingId = ref<number | null>(null)

const form = reactive({
  name: '',
  price: null as number | null,
  offer_price: null as number | null,
  description: '',
  image_url: '',
  is_active: true,
})

const formMessage = ref('')
const formMessageType = ref<'ok' | 'error'>('ok')

const accentStyle = computed(() => ({ backgroundColor: theme.accent, color: '#fff' }))

const authHeader = computed(() => ({ Authorization: `Bearer ${auth.token}` }))

const fetchMySubmissions = async () => {
  if (!auth.token) return
  loading.value = true
  error.value = ''
  try {
    submissions.value = await $fetch(`${config.public.apiBase}/marketplace/submissions/`, {
      headers: authHeader.value,
    })
  } catch (err) {
    error.value = 'No pudimos cargar tus productos'
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.name = ''
  form.price = null
  form.offer_price = null
  form.description = ''
  form.image_url = ''
  form.is_active = true
}

const submit = async () => {
  if (!auth.token) {
    await navigateTo('/login')
    return
  }
  submitting.value = true
  formMessage.value = ''
  try {
    const payload: any = {
      name: form.name,
      price: form.price,
      description: form.description,
      is_active: form.is_active,
    }
    if (form.offer_price) payload.offer_price = form.offer_price
    if (form.image_url) payload.image_url = form.image_url

    const created = await $fetch(`${config.public.apiBase}/marketplace/submissions/`, {
      method: 'POST',
      body: payload,
      headers: authHeader.value,
    })
    submissions.value = [created, ...submissions.value]
    formMessage.value = 'Producto publicado. Puedes activarlo o desactivarlo cuando se venda.'
    formMessageType.value = 'ok'
    resetForm()
  } catch (err: any) {
    formMessage.value = err?.response?._data?.detail || 'No pudimos publicar el producto'
    formMessageType.value = 'error'
  } finally {
    submitting.value = false
  }
}

const toggleActive = async (item: any) => {
  if (!auth.token) {
    await navigateTo('/login')
    return
  }
  togglingId.value = item.id
  try {
    const updated = await $fetch(`${config.public.apiBase}/marketplace/submissions/${item.id}/`, {
      method: 'PATCH',
      body: { is_active: !item.is_active },
      headers: authHeader.value,
    })
    submissions.value = submissions.value.map((s) => (s.id === item.id ? updated : s))
  } catch (err) {
    // Silenciar, el usuario verá el estado intacto
  } finally {
    togglingId.value = null
  }
}

onMounted(async () => {
  theme.loadFromStorage()
  theme.applyTheme()
  auth.restoreFromCookies()
  if (!auth.token) {
    await navigateTo('/login')
    return
  }
  await fetchMySubmissions()
})
</script>
