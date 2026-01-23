<template>
  <div class="min-h-screen bg-slate-50 px-4 py-10">
    <div class="mx-auto max-w-6xl space-y-8">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-xs uppercase tracking-[0.25em] text-slate-500">Checkout</p>
          <h1 class="text-3xl font-bold text-slate-900">Finaliza tu compra</h1>
          <p class="text-slate-600">Completa tus datos y revisa el resumen antes de pagar.</p>
        </div>
        <NuxtLink
          v-if="tenantStore.slug"
          :to="`/store/${tenantStore.slug}/carrito`"
          class="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 hover:border-slate-300"
        >
          ← Volver al carrito
        </NuxtLink>
      </div>

      <div v-if="loadingPage" class="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">Cargando checkout...</div>

      <div v-else-if="cart.items.length === 0" class="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
        Tu carrito está vacío.
      </div>

      <div v-else class="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-slate-900">Datos del cliente</h2>
            <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Entrega</span>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <div class="space-y-2">
              <label class="text-sm text-slate-600">Nombre completo</label>
              <input v-model="form.name" type="text" class="input" placeholder="Ej: Juan Pérez" />
            </div>
            <div class="space-y-2">
              <label class="text-sm text-slate-600">Correo electrónico</label>
              <input v-model="form.email" type="email" class="input" placeholder="tu@correo.com" />
            </div>
            <div class="space-y-2">
              <label class="text-sm text-slate-600">Teléfono</label>
              <input v-model="form.phone" type="text" class="input" placeholder="+56 9 1234 5678" />
            </div>
            <div class="space-y-2 md:col-span-2">
              <label class="text-sm text-slate-600">Dirección</label>
              <textarea v-model="form.address" rows="3" class="input" placeholder="Calle, número, comuna, ciudad"></textarea>
            </div>
          </div>
        </section>

        <aside class="space-y-4">
          <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-slate-900">Resumen del pedido</h3>
              <span class="text-sm text-slate-600">{{ cart.totalItems }} artículos</span>
            </div>

            <div class="divide-y divide-slate-100">
              <div
                v-for="item in cart.items"
                :key="item.id"
                class="flex items-center gap-3 py-3 text-sm text-slate-700"
              >
                <div class="h-14 w-14 overflow-hidden rounded-xl bg-slate-100">
                  <img :src="item.image || placeholder" :alt="item.name" class="h-full w-full object-cover" />
                </div>
                <div class="flex-1">
                  <p class="font-semibold text-slate-900 line-clamp-1">{{ item.name }}</p>
                  <p class="text-xs text-slate-500">Cantidad: {{ item.quantity }}</p>
                </div>
                <p class="font-semibold" :style="{ color: accentColor }">${{ item.price * item.quantity }}</p>
              </div>
            </div>

            <div class="space-y-2 text-sm text-slate-700">
              <div class="flex justify-between">
                <span>Subtotal</span>
                <span>${{ cart.totalPrice }}</span>
              </div>
              <div class="flex justify-between text-slate-500">
                <span>Envío</span>
                <span>Se calcula en el pago</span>
              </div>
            </div>

            <div class="flex items-center justify-between border-t border-slate-200 pt-3 text-lg font-bold text-slate-900">
              <span>Total</span>
              <span>${{ cart.totalPrice }}</span>
            </div>

            <button
              :disabled="loadingOrder"
              @click="confirmOrder"
              class="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white shadow disabled:opacity-60"
              :style="accentStyle"
            >
              {{ loadingOrder ? 'Redirigiendo…' : 'Pagar con Webpay' }}
            </button>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
            <p class="font-semibold text-slate-800">Seguridad y soporte</p>
            <p>Pago procesado por Webpay. Ante dudas, contáctanos usando el correo de tu pedido.</p>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useRuntimeConfig } from 'nuxt/app'
import { useCartStore } from '~/stores/cart'
import { useTenantStore } from '~/stores/tenant'
import { useThemeStore } from '~/stores/theme'

const cart = useCartStore()
const tenantStore = useTenantStore()
const theme = useThemeStore()
const config = useRuntimeConfig()

const route = useRoute()
const slug = computed(() => route.params.slug as string)

const loadingPage = ref(true)
const loadingOrder = ref(false)

const form = reactive({
  name: '',
  email: '',
  phone: '',
  address: '',
})

const accentColor = computed(() => theme.accent || '#2563eb')
const accentStyle = computed(() => ({ backgroundColor: accentColor.value, color: '#fff' }))
const placeholder = 'https://via.placeholder.com/200x200.png?text=Producto'

onMounted(async () => {
  try {
    cart.loadFromStorage()
    tenantStore.setSlug(slug.value)
    if (!tenantStore.data) {
      await tenantStore.fetchTienda()
    }
    theme.loadFromStorage()
    theme.applyStoreTheme(slug.value)
  } catch (e) {
    console.error('Error cargando tienda', e)
  } finally {
    loadingPage.value = false
  }
})

const confirmOrder = async () => {
  if (!tenantStore.data || cart.items.length === 0 || loadingOrder.value) return
    if (!form.name || !form.email || !form.phone || !form.address) {
      window.alert('Completa nombre, correo, teléfono y dirección para continuar.')
      return
    }

  loadingOrder.value = true

  try {
    const order = await $fetch<{ id: number }>(`${config.public.apiBase}/orders/`, {
      method: 'POST',
      body: {
        store: tenantStore.data.id,
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        total: cart.totalPrice,
        items: cart.items.map((item) => ({
          product: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
      },
    })

    const payment = await $fetch<{ url: string; token: string }>(`${config.public.apiBase}/payments/webpay/init/`, {
      method: 'POST',
      body: { amount: Math.round(cart.totalPrice) },
    })

    const formWebpay = document.createElement('form')
    formWebpay.method = 'POST'
    formWebpay.action = payment.url

    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = 'token_ws'
    input.value = payment.token

    formWebpay.appendChild(input)
    document.body.appendChild(formWebpay)

     formWebpay.submit()
  } catch (e) {
     const detail = e?.response?._data || 'Error al iniciar el pago'
     console.error('Error en checkout', detail)
     alert(typeof detail === 'string' ? detail : JSON.stringify(detail))
    loadingOrder.value = false
  }
}
</script>

<style scoped>
.input {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 0.85rem;
  padding: 0.75rem 1rem;
  background: #f8fafc;
  transition: all 0.15s ease;
}
.input:focus {
  border-color: var(--accent, #2563eb);
  background: #fff;
  outline: none;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}
</style>
