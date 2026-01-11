<template>
  <div class="min-h-screen bg-slate-100">
    <!-- HEADER -->
    <header class="bg-blue-700 text-white px-6 py-4 flex justify-between items-center">
      <NuxtLink
        :to="`/store/${slug}`"
        class="text-xl font-bold tracking-wide"
      >
        🏪 {{ tenantStore.data?.name || 'Tienda' }}
      </NuxtLink>

      <!-- CARRITO -->
      <NuxtLink
        :to="`/store/${slug}/carrito`"
        class="relative bg-white text-blue-700 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50"
      >
        🛒 Carrito

        <span
          v-if="cart.totalItems > 0"
          class="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full"
        >
          {{ cart.totalItems }}
        </span>
      </NuxtLink>
    </header>

    <!-- CONTENIDO -->
    <main class="p-6">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useTenantStore } from '~~/stores/tenant'
import { useCartStore } from '~~/stores/cart'

const route = useRoute()
const slug = route.params.slug as string

const tenantStore = useTenantStore()
const cart = useCartStore()
</script>
