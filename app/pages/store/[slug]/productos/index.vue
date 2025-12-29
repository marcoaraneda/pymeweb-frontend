<template>
  <div>
    <h1 class="text-3xl font-bold mb-8 text-blue-700">
      Productos
    </h1>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div
        v-for="product in productos"
        :key="product.id"
        class="bg-white rounded-xl shadow p-4"
      >
        <img
          v-if="product.image"
          :src="product.image"
          class="w-full h-40 object-cover rounded-lg mb-4"
        />

        <h2 class="font-bold text-blue-800">
          {{ product.name }}
        </h2>

        <p class="text-gray-600 mb-2">
          ${{ product.price }}
        </p>

        <button
          @click="addToCart(product)"
          class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Agregar al carrito
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useTenantStore } from '../../../../../stores/tenant'
import { useCartStore } from '../../../../../stores/cart'

const tenant = useTenantStore()
const cart = useCartStore()

const { productos } = storeToRefs(tenant)

function addToCart(product: any) {
  cart.addProduct({
    id: product.id,
    name: product.name,
    price: product.price,
    slug: product.slug,
    image: product.image
  })
}
</script>
