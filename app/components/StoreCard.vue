<template>
  <div class="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
    <div class="absolute inset-0 opacity-0 transition group-hover:opacity-100" :style="glowStyle" aria-hidden="true" />
    <div class="relative p-5 space-y-3">
      <div class="flex items-center gap-3">
        <div class="h-12 w-12 overflow-hidden rounded-xl bg-slate-100 shadow-inner ring-1 ring-slate-200">
          <img v-if="logo" :src="logo" alt="Logo" class="h-full w-full object-cover" />
          <div v-else class="flex h-full w-full items-center justify-center text-xl" :style="badgeStyle">🏪</div>
        </div>
        <div class="min-w-0">
          <p class="text-xs uppercase tracking-[0.15em] text-slate-500">Tienda</p>
          <p class="truncate text-lg font-semibold text-slate-900">{{ store.name }}</p>
        </div>
      </div>

      <p class="text-sm text-slate-500">Slug: {{ store.slug }}</p>

      <NuxtLink
        :to="`/store/${store.slug}`"
        class="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition"
        :style="buttonStyle"
      >
        Entrar a la tienda
        <span aria-hidden="true" class="transition group-hover:translate-x-0.5">→</span>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type Store = { id: number; name: string; slug: string; logo_url?: string; logo?: string | { url?: string } }

const props = defineProps<{ store: Store; accent?: string }>()

const accent = computed(() => props.accent || '#2563eb')
const badgeStyle = computed(() => ({ backgroundColor: accent.value }))
const buttonStyle = computed(() => ({ backgroundColor: accent.value }))
const glowStyle = computed(() => ({ background: `radial-gradient(circle at 30% 30%, ${accent.value}1a, transparent 55%)` }))
const logo = computed(() => props.store.logo_url || (typeof props.store.logo === 'string' ? props.store.logo : props.store.logo?.url) || '')
</script>
