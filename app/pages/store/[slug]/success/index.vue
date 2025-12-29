<template>
  <div class="min-h-[70vh] flex items-center justify-center">
    <div class="bg-white p-10 rounded-2xl shadow-xl max-w-md text-center">

      <div class="text-green-500 text-6xl mb-6">
        ✔
      </div>

      <h1 class="text-3xl font-bold text-blue-700 mb-4">
        ¡Pedido confirmado!
      </h1>

      <p class="text-gray-600 mb-8">
        Hemos recibido tu pedido correctamente.
        Pronto nos pondremos en contacto contigo.
      </p>

      <NuxtLink
        :to="`/store/${slug}/productos`"
        class="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-500 transition"
      >
        Seguir comprando
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
const slug = route.params.slug as string
</script>
