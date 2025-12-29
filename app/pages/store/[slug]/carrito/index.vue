<template>
  <div>
    <h1 class="text-3xl font-bold mb-8 text-blue-700">
      🛒 Carrito de compras
    </h1>

    <div
      v-if="cart.items.length === 0"
      class="bg-white p-6 rounded-xl shadow text-center text-gray-500"
    >
      Tu carrito está vacío
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="item in cart.items"
        :key="item.id"
        class="flex justify-between items-center bg-white p-4 rounded-xl shadow"
      >
        <div class="flex items-center gap-4">
          <img
            v-if="item.image"
            :src="item.image"
            class="w-16 h-16 object-cover rounded-lg"
          />

          <div>
            <h2 class="font-bold text-blue-800">
              {{ item.name }}
            </h2>
            <p class="text-sm text-gray-600">
              Cantidad: {{ item.quantity }}
            </p>
          </div>
        </div>

        <div class="text-right">
          <p class="font-semibold text-blue-700">
            ${{ item.price * item.quantity }}
          </p>

          <button
            @click="cart.removeProduct(item.id)"
            class="text-sm text-red-500 hover:underline mt-1"
          >
            Quitar
          </button>
        </div>
      </div>

      <div class="text-right text-2xl font-bold mt-6 text-blue-800">
        Total: ${{ cart.totalPrice }}
      </div>

      <div class="text-right">
        <button
          class="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Finalizar compra
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from '../../../../../stores/cart'

const cart = useCartStore()
</script>
