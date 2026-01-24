<template>
  <div class="bg-slate-50 min-h-screen">
    <section class="relative overflow-hidden bg-gradient-to-br from-[var(--gradient-from,#0f172a)] to-[var(--gradient-to,#0b2358)] text-white">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_45%)]" aria-hidden="true" />
      <div class="relative mx-auto max-w-5xl px-6 py-16 space-y-4">
        <p class="text-xs uppercase tracking-[0.25em] text-white/70">Acerca de la tienda</p>
        <h1 class="text-4xl font-bold leading-tight">{{ storeName }}</h1>
        <p class="text-white/80 max-w-3xl">{{ storeDescription }}</p>
      </div>
    </section>

    <section class="mx-auto max-w-5xl px-6 py-10 space-y-6">
      <div class="grid gap-6 md:grid-cols-2">
        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-xl font-semibold text-slate-900">Acerca de nosotros</h2>
          <p class="mt-2 text-slate-700 whitespace-pre-line">{{ aboutMessage }}</p>
          <dl class="mt-4 space-y-2 text-sm text-slate-700"></dl>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-xl font-semibold text-slate-900">Contacto</h2>
          <p class="mt-2 text-slate-600">¿Tienes dudas o necesitas soporte? Escríbenos y responderemos pronto.</p>
          <dl class="mt-4 space-y-2 text-sm text-slate-700">
            <div v-if="contactEmail" class="flex items-center justify-between gap-3">
              <dt class="text-slate-500">Correo</dt>
              <dd class="font-semibold truncate">{{ contactEmail }}</dd>
            </div>
            <div v-if="phone" class="flex items-center justify-between gap-3">
              <dt class="text-slate-500">Teléfono</dt>
              <dd class="font-semibold">{{ phone }}</dd>
            </div>
          </dl>
          <div class="mt-4 flex flex-wrap gap-2 text-sm font-semibold">
            <a v-if="contactEmail" :href="`mailto:${contactEmail}`" class="rounded-xl bg-slate-900 px-4 py-2 text-white shadow hover:-translate-y-0.5 transition">Enviar correo</a>
            <a v-if="phone" :href="`tel:${phone}`" class="rounded-xl border border-slate-200 px-4 py-2 text-slate-800 hover:border-slate-300 transition">Llamar</a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { definePageMeta } from '#imports'
import { useTenantStore } from '~/stores/tenant'
import { useThemeStore } from '~/stores/theme'

definePageMeta({ layout: 'store' })

const route = useRoute()
const slug = route.params.slug as string
const tenantStore = useTenantStore()
const theme = useThemeStore()

const storeData = computed(() => tenantStore.data)
const storeName = computed(() => tenantStore.data?.name || 'Tienda')
const storeDescription = computed(() => tenantStore.data?.description || '')
const aboutMessage = computed(
  () =>
    tenantStore.data?.about ||
    tenantStore.data?.about_us ||
    tenantStore.data?.about_text ||
    'Agrega un mensaje de “Acerca de nosotros” desde el editor de la tienda.'
)
const contactEmail = computed(() => tenantStore.data?.contact_email || tenantStore.data?.email || '')
const phone = computed(() => tenantStore.data?.phone || '')

const loadData = async () => {
  tenantStore.setSlug(slug)
  await tenantStore.fetchTienda()
}

onMounted(async () => {
  theme.loadFromStorage()
  theme.applyStoreTheme(slug)
  await loadData()
})
</script>
