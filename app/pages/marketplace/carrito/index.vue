<template>
  <div class="min-h-screen bg-slate-50 px-4 py-10">
    <div class="mx-auto max-w-5xl space-y-6">
      <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-xs uppercase tracking-[0.25em] text-amber-600">Marketplace</p>
          <h1 class="text-3xl font-bold text-slate-900">Tu carrito</h1>
          <p class="text-slate-600">Productos agregados desde el marketplace (naranja).</p>
        </div>
        <NuxtLink
          to="/marketplace"
          class="rounded-xl border border-amber-200 px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-50"
        >
          Seguir comprando
        </NuxtLink>
      </div>

      <div v-if="cart.items.length === 0" class="rounded-2xl border border-dashed border-amber-200 bg-white p-6 text-slate-600">
        Tu carrito está vacío. Agrega productos del marketplace.
      </div>

      <div v-else class="grid gap-6 md:grid-cols-[2fr,1fr]">
        <div class="space-y-3">
          <article
            v-for="item in cart.items"
            :key="item.id"
            class="flex flex-col gap-3 rounded-2xl border border-amber-100 bg-white p-4 shadow-sm md:flex-row md:items-center"
          >
            <div class="h-24 w-full overflow-hidden rounded-xl bg-slate-100 md:h-24 md:w-28">
              <img :src="item.image || placeholder" :alt="item.name" class="h-full w-full object-cover" />
            </div>
            <div class="flex-1 space-y-1">
              <p class="text-sm font-semibold text-slate-900">{{ item.name }}</p>
              <p class="text-sm text-slate-600">ID: {{ item.id }}</p>
              <p class="text-base font-bold text-amber-700">${{ item.price }}</p>
              <div class="flex flex-wrap items-center gap-3 pt-1">
                <label class="text-sm text-slate-600">Cantidad</label>
                <input
                  type="number"
                  min="1"
                  class="w-20 rounded-lg border border-amber-200 px-2 py-1 text-sm"
                  :value="item.quantity"
                  @input="(e) => updateQty(item.id, Number((e.target as HTMLInputElement).value))"
                />
                <button class="text-sm font-semibold text-red-600" @click="cart.removeProduct(item.id)">Eliminar</button>
              </div>
            </div>
          </article>
        </div>

        <aside class="space-y-4 rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
          <div class="flex items-center justify-between">
            <p class="text-sm font-semibold text-slate-700">Productos</p>
            <span class="text-sm text-slate-600">{{ cart.totalItems }}</span>
          </div>
          <div class="flex items-center justify-between text-lg font-bold text-slate-900">
            <span>Total</span>
            <span class="text-amber-700">${{ cart.totalPrice.toFixed(2) }}</span>
          </div>
          <div class="space-y-2 text-xs text-slate-500">
            <p>Este carrito es solo para compras del marketplace. Los carritos de cada tienda siguen separados.</p>
          </div>
          <button
            class="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white shadow"
            :style="{ backgroundColor: '#f59e0b' }"
            @click="checkoutDisabled ? null : handleCheckout()"
            :disabled="checkoutDisabled"
          >
            {{ checkoutDisabled ? 'Completa el carrito' : 'Proceder al pago' }}
          </button>
          <button class="w-full rounded-xl border border-amber-200 px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-50" @click="cart.clearCart()">
            Vaciar carrito
          </button>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useCartStore } from '~/stores/cart'

const cart = useCartStore()
const placeholder = 'https://via.placeholder.com/300x200?text=Producto'

onMounted(() => {
  // debug logs to trace mount/hang issues
  try {
    // eslint-disable-next-line no-console
    console.debug('[marketplace/carrito] onMounted')
  } catch (_) {}
  cart.loadFromStorage()
  cart.setContext('marketplace')
})

const checkoutDisabled = computed(() => cart.items.length === 0)

const updateQty = (id: number | string, qty: number) => {
  cart.updateQuantity(id, qty)
}

const handleCheckout = () => {
  // Aquí se integraría el checkout global del marketplace.
  alert('Checkout marketplace pendiente de integrar')
}
</script>
