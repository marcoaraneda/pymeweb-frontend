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

          <div class="space-y-3">
            <label class="text-sm text-slate-600">Método de entrega</label>
            <div class="flex flex-col gap-2">
              <label class="flex items-center gap-2 text-sm text-slate-700">
                <input type="radio" value="pickup" v-model="deliveryMethod" />
                Retiro en tienda (sin envío)
              </label>
              <label class="flex items-center gap-2 text-sm text-slate-700">
                <input type="radio" value="delivery" v-model="deliveryMethod" />
                Envío a domicilio (costo automático)
                <span v-if="deliveryMethod === 'delivery'" class="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">${{ shippingCost }}</span>
              </label>
            </div>
            <p class="text-xs text-slate-500">El costo de envío se calcula automáticamente.</p>
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
                <span>{{ deliveryMethod === 'delivery' ? '$' + (shippingCost || 0) : 'Retiro en tienda' }}</span>
              </div>
            </div>

            <div class="flex items-center justify-between border-t border-slate-200 pt-3 text-lg font-bold text-slate-900">
              <span>Total</span>
              <span>${{ totalWithShipping }}</span>
            </div>

            <button
              :disabled="loadingOrder"
              @click="submitOrder('webpay')"
              class="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white shadow disabled:opacity-60"
              :style="accentStyle"
            >
              {{ loadingOrder ? 'Redirigiendo…' : 'Pagar con Webpay' }}
            </button>

            <button
              :disabled="loadingOrder"
              @click="submitOrder('manual')"
              class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm disabled:opacity-60"
            >
              {{ loadingOrder ? 'Procesando…' : 'Completar pedido sin Webpay' }}
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
import { reactive, ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRuntimeConfig } from 'nuxt/app'
import { definePageMeta } from '#imports'
import { useCartStore } from '~/stores/cart'
import { useTenantStore } from '~/stores/tenant'
import { useThemeStore } from '~/stores/theme'

definePageMeta({ layout: 'store' })

const cart = useCartStore()
const tenantStore = useTenantStore()
const theme = useThemeStore()
const config = useRuntimeConfig()
const router = useRouter()

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

const deliveryMethod = ref<'pickup' | 'delivery'>('pickup')
const shippingCost = ref(0)

const accentColor = computed(() => theme.accent || '#2563eb')
const accentStyle = computed(() => ({ backgroundColor: accentColor.value, color: '#fff' }))
const placeholder = 'https://via.placeholder.com/200x200.png?text=Producto'
const computeShipping = () => {
  if (deliveryMethod.value === 'pickup') return 0
  const base = 2500
  const perItem = Math.min(cart.totalItems * 250, 2000)
  const discount = cart.totalPrice >= 50000 ? 1000 : 0
  return Math.max(1500, base + perItem - discount)
}
const totalWithShipping = computed(() => {
  const extra = deliveryMethod.value === 'delivery' ? computeShipping() : 0
  return Math.max(0, cart.totalPrice + extra)
})

onMounted(async () => {
  try {
    cart.setContext(slug.value)
    cart.loadFromStorage()
    tenantStore.setSlug(slug.value)
    if (!tenantStore.data) {
      await tenantStore.fetchTienda()
    }
    theme.loadFromStorage()
    theme.applyStoreTheme(slug.value)
    shippingCost.value = computeShipping()
  } catch (e) {
    console.error('Error cargando tienda', e)
  } finally {
    loadingPage.value = false
  }
})

watch(deliveryMethod, (val) => {
  if (val === 'pickup') {
    shippingCost.value = 0
  } else {
    shippingCost.value = computeShipping()
  }
})

const validateForm = () => {
  if (!form.name || !form.email || !form.phone || !form.address) {
    window.alert('Completa nombre, correo, teléfono y dirección para continuar.')
    return false
  }
  return true
}

const buildOrderPayload = () => ({
  store: tenantStore.data?.id,
  name: form.name,
  email: form.email,
  phone: form.phone,
  address: form.address,
  total: totalWithShipping.value,
  items: cart.items.map((item) => ({
    product: item.id,
    quantity: item.quantity,
    price: item.price,
  })),
})

const submitOrder = async (mode: 'webpay' | 'manual') => {
  if (!tenantStore.data || cart.items.length === 0 || loadingOrder.value) return
  if (!validateForm()) return

  loadingOrder.value = true

  try {
    const order = await $fetch<{ id: number }>(`${config.public.apiBase}/orders/`, {
      method: 'POST',
      params: { store: tenantStore.slug },
      body: buildOrderPayload(),
    })

    if (mode === 'manual') {
      cart.clearCart()
      router.push(`/store/${tenantStore.slug}/orden?id=${order.id}`)
      return
    }

    // INTEGRACIÓN BOLETA: Iniciar pago Webpay y redirigir a boleta tras pago
    const payment = await $fetch<{ url?: string; token?: string; enabled?: boolean; detail?: string }>(
      `${config.public.apiBase}/orders/${order.id}/webpay/init/`,
      { method: 'POST' }
    )

    if (payment && payment.url && payment.token) {
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
    } else {
      if (payment?.detail) {
        window.alert(payment.detail)
      }
      cart.clearCart()
      router.push(`/store/${tenantStore.slug}/orden?id=${order.id}`)
    }
  } catch (e: any) {
    const detail = e?.response?._data || 'Error al procesar el pedido'
    console.error('Error en checkout', detail)
    alert(typeof detail === 'string' ? detail : JSON.stringify(detail))
  } finally {
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
