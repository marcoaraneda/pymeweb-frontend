<template>
  <div>
    <!-- HEADER -->
    <header class="bg-blue-600 text-white px-8 py-4 flex justify-between items-center">
      <NuxtLink :to="`/store/${slug}`" class="text-2xl font-bold">
        {{ tenant?.name || 'Tienda' }}
      </NuxtLink>

      <NuxtLink
        :to="`/store/${slug}/carrito`"
        class="relative bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold"
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

    <main class="container mx-auto px-6 py-10">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useTenantStore } from '../../stores/tenant'
import { useCartStore } from '../../stores/cart'

const tenantStore = useTenantStore()
const cart = useCartStore()

const slug = tenantStore.slug
const tenant = tenantStore.data
</script>
