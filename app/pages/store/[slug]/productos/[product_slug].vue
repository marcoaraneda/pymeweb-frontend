<template>
  <div v-if="product" class="max-w-5xl mx-auto grid md:grid-cols-2 gap-10">
    <!-- Imagen -->
    <img
    :src="getProductImage(product)"
    :alt="product.name"
    class="w-full max-h-[400px] object-contain"
    />

    <div>
      <h1 class="text-4xl font-bold mb-4">
        {{ product.name }}
      </h1>

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

  <div v-else class="text-gray-500 text-center py-20">
    Producto no encontrado
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useProducts } from '~/composables/useProducts'
import { useCartStore } from '~/stores/cart'
import { useImages } from '~/composables/useImages'

const route = useRoute()
const cart = useCartStore()
const { getProductBySlug } = useProducts()
const { getProductImage } = useImages()

const product = ref<any>(null)

onMounted(async () => {
  try {
    product.value = await getProductBySlug(
      route.params.product_slug as string
    )
  } catch (e) {
    console.error('Error cargando producto', e)
  }
})
</script>
