<template>
  <div class="bg-slate-50 min-h-screen text-slate-900">
    <NuxtPage :transition="pageTransition" />
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
const pageTransition = { name: 'page', mode: 'out-in', appear: true }

onMounted(async () => {
  await auth.initializeSession()
  cart.loadFromStorage()
  theme.applyTheme()
})
</script>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.99);
}

.page-enter-to,
.page-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.reveal {
  animation: fade-up 0.6s ease both;
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .page-enter-active,
  .page-leave-active,
  .reveal {
    transition: none;
    animation: none;
  }
}

.glass-btn {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(148, 163, 184, 0.35);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, border-color 0.2s ease;
}

.glass-btn:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.82);
  border-color: rgba(148, 163, 184, 0.5);
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.65);
}

.glass-btn:active {
  transform: translateY(0);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.6);
}
</style>