<template>
  <div>
    <h1 class="text-3xl font-bold mb-8 text-blue-700">
      Carrito
    </h1>

    <div v-if="cart.items.length === 0" class="text-gray-500">
      Tu carrito está vacío
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="item in cart.items"
        :key="item.id"
        class="flex justify-between items-center bg-white p-4 rounded-xl shadow"
      >
        <div>
          <h2 class="font-bold">{{ item.name }}</h2>
          <p class="text-sm text-gray-600">
            Cantidad: {{ item.quantity }}
          </p>
        </div>

        <div class="text-right">
          <p class="font-semibold">
            ${{ item.price * item.quantity }}
          </p>

          <button
            @click="cart.removeProduct(item.id)"
            class="text-red-500 text-sm hover:underline"
          >
            Quitar
          </button>
        </div>
      </div>

      <div class="text-right text-2xl font-bold mt-6">
        Total: ${{ cart.totalPrice }}
      </div>

      <div class="text-right mt-6">
        <NuxtLink
        :to="`/store/${$route.params.slug}/checkout`"
        class="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-500"
        >
        Ir a pagar
</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from '../../../../../stores/cart'
const cart = useCartStore()
</script>
