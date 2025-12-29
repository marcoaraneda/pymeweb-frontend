<template>
  <div>
    <NuxtPage /> <ChatBot />
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from '@/stores/cart'

const cart = useCartStore()

onMounted(() => {
  cart.load()
})
</script>