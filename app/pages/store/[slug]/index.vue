<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">
      Bienvenido a {{ tenantStore.data?.name }}
    </h1>

    <NuxtLink
      :to="`/store/${slug}/productos`"
      class="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-500"
    >
      Ver productos
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useTenantStore } from '../../../../stores/tenant'

const route = useRoute()
const slug = route.params.slug as string

const tenantStore = useTenantStore()

// (opcional pero recomendado)
onMounted(() => {
  tenantStore.setSlug(slug)
  tenantStore.fetchTienda()
})
</script>
