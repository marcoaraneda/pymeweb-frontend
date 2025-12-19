<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8 text-gray-800">Nuestro Catálogo</h1>

    <div v-if="products.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="product in products" :key="product.id" 
           class="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 overflow-hidden">
        
        <div class="aspect-square bg-gray-200 overflow-hidden">
          <img :src="product.main_image || '/placeholder.png'" class="object-cover w-full h-full group-hover:scale-105 transition" />
        </div>

        <div class="p-4">
          <span class="text-xs font-semibold text-blue-600 uppercase tracking-wide">{{ product.category_name }}</span>
          <h2 class="font-bold text-lg mt-1 text-gray-900">{{ product.name }}</h2>
          
          <p class="text-gray-600 mt-2 font-medium">
            Desde ${{ product.min_price }}
          </p>

          <NuxtLink :to="`/store/${tenantStore.slug}/productos/${product.slug}`"
            class="mt-4 block text-center bg-black text-white py-2 rounded-lg text-sm font-semibold hover:bg-gray-800">
            Ver detalles
          </NuxtLink>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-20">
      <p class="text-gray-500">No hay productos disponibles en esta tienda.</p>
    </div>
  </div>
</template>

<script setup>
const { getProducts } = useProducts()
const tenantStore = useTenantStore()
const products = ref([])

// Cargar productos al montar la página
onMounted(async () => {
  const data = await getProducts()
  products.value = data
})
</script>