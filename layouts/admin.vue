<template>
  <div class="flex h-screen bg-gray-100">
    <aside class="w-64 bg-slate-900 text-white p-6 space-y-4">
      <h2 class="font-bold text-xl mb-8">PymeAdmin</h2>
      <nav class="space-y-2">
        <NuxtLink :to="`/store/${slug}/admin/inventario`" class="block p-2 hover:bg-slate-800 rounded">📦 Inventario</NuxtLink>
        <NuxtLink :to="`/store/${slug}/admin/catalog`" class="block p-2 hover:bg-slate-800 rounded">🏷️ Productos</NuxtLink>
        <NuxtLink :to="`/store/${slug}/admin/reviews`" class="block p-2 hover:bg-slate-800 rounded">⭐ Reseñas</NuxtLink>
        <NuxtLink :to="`/store/${slug}/admin/cms`" class="block p-2 hover:bg-slate-800 rounded">🎨 Personalización</NuxtLink>
      </nav>
    </aside>
    <main class="flex-1 overflow-y-auto p-10">
      <slot />
    </main>
  </div>
</template>

<script setup>
const slug = useTenantStore().slug
</script>