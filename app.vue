<template>
  <div>
    <NuxtPage /> <ChatBot />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useCartStore } from './stores/cart'

const cart = useCartStore()

onMounted(() => {
  cart.loadFromStorage()
})
</script>