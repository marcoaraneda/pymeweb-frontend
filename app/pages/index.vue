<template>
  <div class="min-h-screen bg-gray-50">

    <!-- HERO -->
    <section class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
      <div class="max-w-6xl mx-auto px-6 py-20 text-center">
        <h1 class="text-4xl md:text-5xl font-extrabold mb-4">
          Pymeweb
        </h1>
        <p class="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
          Gestión digital para PYMEs. Explora nuestras tiendas y comienza a vender online hoy.
        </p>
      </div>
    </section>

    <!-- CONTENIDO -->
    <section class="max-w-6xl mx-auto px-6 py-16">

      <h2 class="text-2xl font-bold text-gray-800 mb-8">
        🏪 Tiendas disponibles
      </h2>

      <!-- LOADING -->
      <div v-if="loading" class="text-gray-500">
        Cargando tiendas...
      </div>

      <!-- ERROR -->
      <div v-else-if="error" class="text-red-500">
        Error al cargar tiendas
      </div>

      <!-- LISTADO -->
      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8"
      >
        <div
          v-for="store in stores"
          :key="store.id"
          class="bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden"
        >
          <!-- Imagen fake -->
          <div class="h-36 bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
            <span class="text-4xl">🏪</span>
          </div>

          <div class="p-6 space-y-3">
            <h3 class="text-lg font-semibold text-gray-800 capitalize">
              {{ store.name }}
            </h3>

            <p class="text-sm text-gray-500">
              Tienda activa y disponible
            </p>

            <NuxtLink
              :to="`/store/${store.slug}`"
              class="inline-block w-full text-center bg-blue-600 text-white py-2 rounded-xl font-semibold hover:bg-blue-500 transition"
            >
              Entrar a la tienda
            </NuxtLink>
          </div>
        </div>
      </div>

    </section>

    <!-- FOOTER -->
    <footer class="border-t bg-white">
      <div class="max-w-6xl mx-auto px-6 py-6 text-center text-sm text-gray-500">
        © {{ new Date().getFullYear() }} Pymeweb — Gestión Digital para PYMEs
      </div>
    </footer>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Store {
  id: number
  name: string
  slug: string
}

const stores = ref<Store[]>([])
const loading = ref(true)
const error = ref(false)

onMounted(async () => {
  try {
    stores.value = await $fetch<Store[]>('http://127.0.0.1:8000/api/stores/')
  } catch (err) {
    console.error(err)
    error.value = true
  } finally {
    loading.value = false
  }
})
</script>
