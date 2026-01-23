<template>
  <div class="bg-slate-50 min-h-screen text-slate-900">
    <NuxtPage />
    <ChatBot />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useCartStore } from '~/stores/cart'
import { useThemeStore } from '~/stores/theme'

const cart = useCartStore()
const auth = useAuthStore()
const theme = useThemeStore()

onMounted(() => {
  auth.restoreFromCookies()
  auth.fetchProfile()
  cart.loadFromStorage()
  theme.applyTheme()
})
</script>