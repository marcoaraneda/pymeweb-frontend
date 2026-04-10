<template>
  <div class="bg-slate-50 min-h-screen text-slate-900">
    <NuxtPage :transition="pageTransition" />
    <ChatBot />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from './app/stores/auth'
import { useCartStore } from './app/stores/cart'
import { useThemeStore } from './app/stores/theme'

const cart = useCartStore()
const auth = useAuthStore()
const theme = useThemeStore()
const pageTransition = { name: 'route-fade', mode: 'out-in', appear: true }

onMounted(async () => {
  await auth.initializeSession()
  cart.loadFromStorage()
  theme.applyTheme()
})
</script>

<style>
.route-fade-enter-active {
  transition: opacity 0.45s ease, transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), filter 0.45s ease;
}

.route-fade-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.route-fade-enter-from,
.route-fade-leave-to {
  opacity: 0;
  transform: translateY(14px) scale(0.99);
}

.route-fade-enter-from {
  filter: blur(6px);
}

.route-fade-enter-to,
.route-fade-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
  filter: blur(0);
}

.reveal {
  animation: fade-up 0.6s ease both;
}

.page-enter {
  animation: page-enter-rise 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes page-enter-rise {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.995);
    filter: blur(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
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
  .route-fade-enter-active,
  .route-fade-leave-active,
  .reveal,
  .page-enter {
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