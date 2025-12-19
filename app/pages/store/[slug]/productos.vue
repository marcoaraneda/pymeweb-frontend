<template>
  <div class="container mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">Nuestro Catálogo</h1>
    
    <div v-if="tenantStore.loading">Cargando productos...</div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div v-for="prod in tenantStore.productos" :key="prod.id" class="border p-4 rounded shadow">
        <h2 class="font-bold text-lg">{{ prod.name }}</h2>
        <p class="text-gray-600">{{ prod.description }}</p>
        <p class="text-blue-600 font-bold mt-2">${{ prod.price }}</p>
        <span class="text-xs bg-gray-100 p-1">{{ prod.category?.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useTenantStore } from '../../../../stores/tenant'
const tenantStore = useTenantStore()
const route = useRoute()

onMounted(async () => {
  tenantStore.setSlug(route.params.slug)
  await tenantStore.fetchProductos()
})
</script>