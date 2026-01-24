<template>
  <div class="relative inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow">
    <ShoppingCart class="h-4 w-4" aria-hidden="true" />
    {{ cart.totalItems }}
  </div>
</template>

<script setup lang="ts">
import { ShoppingCart } from 'lucide-vue-next'
import { useCartStore } from '~/stores/cart'
const cart = useCartStore()
</script>
