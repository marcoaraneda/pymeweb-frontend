<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8 text-blue-700">
      Productos
    </h1>

    <div v-if="tenantStore.loading" class="text-gray-500">
      Cargando productos...
    </div>

    <div
      v-else-if="tenantStore.productos.length"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      <div
        v-for="product in tenantStore.productos"
        :key="product.id"
        class="bg-white rounded-xl shadow hover:shadow-lg transition border"
      >
        <!-- Imagen -->
        <img
        :src="getProductImage(product)"
        :alt="product.name"
        class="w-full h-48 object-cover rounded-t-xl"
        />

        <div class="p-4">
          <h2 class="font-bold text-lg text-gray-800">
            {{ product.name }}
          </h2>

          <p class="text-blue-600 font-semibold mt-2">
            ${{ product.price }}
          </p>

          <NuxtLink
            :to="`/store/${slug}/productos/${product.slug}`"
            class="mt-4 block text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-500"
          >
            Ver detalle
          </NuxtLink>

          <button
            @click="cart.addProduct(product)"
            class="mt-2 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-500"
          >
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>

    <div v-else class="text-gray-500">
      No hay productos para esta tienda.
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { onMounted } from 'vue'
import { useTenantStore } from '~~/stores/tenant'
import { useCartStore } from '~~/stores/cart'
import { useImages } from '~~/composables/useImages'

const route = useRoute()
const slug = route.params.slug as string

const tenantStore = useTenantStore()
const cart = useCartStore()
const { getProductImage } = useImages()

onMounted(async () => {
  tenantStore.setSlug(slug)
  await tenantStore.fetchProductos()
})
</script>
