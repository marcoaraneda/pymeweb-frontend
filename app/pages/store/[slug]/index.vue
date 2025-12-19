<template>
  <div v-if="tenantStore.data">
    <header class="p-6 shadow-sm border-b bg-white">
      <h1 class="text-2xl font-bold">{{ tenantStore.data.name }}</h1>
    </header>
    <main class="container mx-auto py-10">
      <section class="bg-gray-50 rounded-3xl p-12 text-center mb-10">
        <h2 class="text-5xl font-extrabold mb-4">Bienvenidos</h2>
        <p class="text-gray-600 text-lg">Explora nuestro catálogo exclusivo.</p>
      </section>
      <NuxtLink :to="`/store/${tenantStore.slug}/productos`" class="bg-blue-600 text-white px-8 py-3 rounded-lg">
        Ver Productos
      </NuxtLink>
    </main>
  </div>
  <div v-else class="h-screen flex items-center justify-center">
    <p>{{ tenantStore.loading ? 'Cargando tienda...' : 'No se encontró la tienda' }}</p>
  </div>
</template>

<script setup>
  import { useTenantStore } from '../../../../stores/tenant'
const route = useRoute()
const tenantStore = useTenantStore() // Nuxt lo auto-importa si configuramos el config

// Función para cargar datos al montar el componente
onMounted(async () => {
  if (route.params.slug) {
    tenantStore.setSlug(route.params.slug)
    // Asegúrate de tener una función fetchTienda en tu store que llame a Django
    if (tenantStore.fetchTienda) await tenantStore.fetchTienda()
  }
})
</script>