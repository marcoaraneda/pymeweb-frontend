<template>
  <div v-if="product" class="container mx-auto px-4 py-12">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
      
      <!-- IMÁGENES -->
      <div class="space-y-4">
        <!-- Imagen principal -->
        <img
          v-if="activeImage"
          :src="activeImage"
          class="w-full rounded-2xl shadow-lg border"
        />

        <img
          v-else-if="product.images?.length"
          :src="`http://127.0.0.1:8000${product.images[0].image}`"
          class="w-full rounded-2xl shadow-lg border"
        />

        <div v-else class="w-full h-64 flex items-center justify-center border rounded-2xl text-gray-400">
          Sin imagen
        </div>

        <!-- Miniaturas -->
        <div
          v-if="product.images?.length"
          class="flex gap-2 overflow-x-auto"
        >
          <img
            v-for="img in product.images"
            :key="img.id"
            :src="`http://127.0.0.1:8000${img.image}`"
            @click="activeImage = `http://127.0.0.1:8000${img.image}`"
            class="w-20 h-20 rounded-lg cursor-pointer border hover:border-blue-500"
          />
        </div>
      </div>

      <!-- INFO -->
      <div class="space-y-6">
        <h1 class="text-4xl font-bold">{{ product.name }}</h1>

        <p class="text-2xl font-semibold text-blue-600">
          ${{ product.price }}
        </p>

        <p class="text-gray-600">{{ product.description }}</p>

        <!-- VARIANTES -->
        <div v-if="product.variants?.length">
          <h3 class="font-bold mb-2">Opciones disponibles:</h3>

          <div class="flex flex-wrap gap-3">
            <button
              v-for="variant in product.variants"
              :key="variant.id"
              @click="selectedVariant = variant"
              :class="[
                'px-4 py-2 border rounded-md transition',
                selectedVariant?.id === variant.id
                  ? 'bg-black text-white'
                  : 'hover:bg-gray-100'
              ]"
            >
              {{ variant.name }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const { getProductBySlug } = useProducts()

const product = ref(null)
const selectedVariant = ref(null)
const activeImage = ref('')

onMounted(async () => {
  product.value = await getProductBySlug(route.params.product_slug)

  if (product.value?.images?.length) {
    activeImage.value = `http://127.0.0.1:8000${product.value.images[0].image}`
  }

  if (product.value?.variants?.length) {
    selectedVariant.value = product.value.variants[0]
  }
})
</script>
