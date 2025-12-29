<template>
  <div class="max-w-3xl mx-auto">
    <h1 class="text-3xl font-bold mb-8 text-blue-700">
      Checkout
    </h1>

    <!-- Carrito vacío -->
    <div v-if="cart.items.length === 0" class="text-gray-500">
      Tu carrito está vacío.
    </div>

    <!-- Formulario -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-8">

      <!-- DATOS CLIENTE -->
      <div class="bg-white p-6 rounded-xl shadow space-y-4">
        <h2 class="text-xl font-semibold text-blue-600">
          Datos del cliente
        </h2>

        <input
          v-model="form.name"
          type="text"
          placeholder="Nombre completo"
          class="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
        />

        <input
          v-model="form.email"
          type="email"
          placeholder="Correo electrónico"
          class="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
        />

        <input
          v-model="form.phone"
          type="text"
          placeholder="Teléfono"
          class="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
        />

        <textarea
          v-model="form.address"
          placeholder="Dirección de despacho"
          class="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
          rows="3"
        />
      </div>

      <!-- RESUMEN -->
      <div class="bg-white p-6 rounded-xl shadow space-y-4">
        <h2 class="text-xl font-semibold text-blue-600">
          Resumen del pedido
        </h2>

        <div
          v-for="item in cart.items"
          :key="item.id"
          class="flex justify-between text-sm"
        >
          <span>
            {{ item.name }} x {{ item.quantity }}
          </span>
          <span class="font-medium">
            ${{ item.price * item.quantity }}
          </span>
        </div>

        <hr />

        <div class="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>${{ cart.totalPrice }}</span>
        </div>

        <button
          @click="confirmOrder"
          class="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-500 transition"
        >
          Confirmar pedido
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCartStore } from '../../../../../stores/cart'

const cart = useCartStore()
const router = useRouter()
const route = useRoute()

const form = reactive({
  name: '',
  email: '',
  phone: '',
  address: ''
})

const confirmOrder = () => {
  if (!form.name || !form.email) {
    alert('Completa los datos requeridos')
    return
  }

  cart.clearCart()

  router.push(`/store/${route.params.slug}/success`)
}
</script>
