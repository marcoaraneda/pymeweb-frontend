<template>
  <div v-if="product" class="grid md:grid-cols-2 gap-10">
    <img
      v-if="product.images?.length"
      :src="`http://127.0.0.1:8000${product.images[0].image}`"
      class="rounded-xl shadow"
    />

    <div>
      <h1 class="text-4xl font-bold mb-4">{{ product.name }}</h1>
      <p class="text-2xl text-blue-600 font-semibold mb-4">
        ${{ product.price }}
      </p>

      <button
        @click="cart.addProduct(product)"
        class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-500"
      >
        🛒 Agregar al carrito
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from '../../../../../stores/cart'
import { useProducts } from '~~/composables/useProducts'

const route = useRoute()
const { getProductBySlug } = useProducts()
const cart = useCartStore()

const product = ref<any>(null)

onMounted(async () => {
  product.value = await getProductBySlug(
    route.params.product_slug as string
  )
})
</script>
