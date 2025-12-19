<template>
  <div v-if="product" class="container mx-auto px-4 py-12">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
      <div class="space-y-4">
        <img :src="activeImage || product.main_image" class="w-full rounded-2xl shadow-lg border" />
        <div class="flex gap-2 overflow-x-auto">
          <img v-for="img in product.images" :key="img.id" :src="img.url" 
               @click="activeImage = img.url" class="w-20 h-20 rounded-lg cursor-pointer border hover:border-blue-500" />
        </div>
      </div>

      <div class="space-y-6">
        <h1 class="text-4xl font-bold">{{ product.name }}</h1>
        <p class="text-2xl font-semibold text-blue-600">${{ selectedVariant?.price || product.min_price }}</p>
        <p class="text-gray-600">{{ product.description }}</p>

        <div v-if="product.variants?.length">
          <h3 class="font-bold mb-2">Opciones disponibles:</h3>
          <div class="flex flex-wrap gap-3">
            <button v-for="variant in product.variants" :key="variant.id"
              @click="selectedVariant = variant"
              :class="['px-4 py-2 border rounded-md transition', 
                       selectedVariant?.id === variant.id ? 'bg-black text-white' : 'hover:bg-gray-100']">
              {{ variant.name }} ({{ variant.stock }} disp.)
            </button>
          </div>
        </div>

        <div v-if="selectedVariant" class="mt-4">
          <span v-if="selectedVariant.stock > 0" class="text-green-600 font-medium">● Disponible</span>
          <span v-else class="text-red-600 font-medium">● Sin stock</span>
        </div>
      </div>
    </div>

    <section class="mt-20 border-t pt-10">
      <h2 class="text-2xl font-bold mb-6">Reseñas de clientes ⭐</h2>
      <div v-if="product.reviews?.length" class="space-y-6">
        <div v-for="review in product.reviews" :key="review.id" class="bg-gray-50 p-6 rounded-xl">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-yellow-500">★ {{ review.rating }}</span>
            <span class="font-bold">{{ review.user_name }}</span>
          </div>
          <p class="text-gray-700">{{ review.comment }}</p>
        </div>
      </div>
      <p v-else class="text-gray-500 italic">Aún no hay reseñas para este producto.</p>
    </section>
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
  if (product.value.variants?.length) selectedVariant.value = product.value.variants[0]
})
</script>