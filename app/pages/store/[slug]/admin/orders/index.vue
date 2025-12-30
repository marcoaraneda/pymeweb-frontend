<template>
  <div class="max-w-5xl mx-auto">

    <h1 class="text-3xl font-bold mb-6 text-blue-700">
      Pedidos
    </h1>

    <div v-if="loading" class="text-gray-500">
      Cargando pedidos...
    </div>

    <table v-else class="w-full bg-white shadow rounded-xl">
      <thead class="border-b">
        <tr>
          <th>ID</th>
          <th>Cliente</th>
          <th>Total</th>
          <th>Estado</th>
          <th></th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="order in orders"
          :key="order.id"
          class="border-b text-sm"
        >
          <td>#{{ order.id }}</td>
          <td>{{ order.name }}</td>
          <td>${{ order.total }}</td>
          <td>
            <span
              class="px-2 py-1 rounded-full text-xs"
              :class="statusClass(order.status)"
            >
              {{ order.status }}
            </span>
          </td>
          <td>
            <NuxtLink
              :to="`/store/${slug}/admin/orders/${order.id}`"
              class="text-blue-600 hover:underline"
            >
              Ver
            </NuxtLink>
          </td>
        </tr>
      </tbody>
    </table>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTenantStore } from '~~/stores/tenant'

interface Order {
  id: number
  name: string
  total: number
  status: string
}

const route = useRoute()
const slug = route.params.slug as string
const tenant = useTenantStore()

const orders = ref<Order[]>([])
const loading = ref(true)

onMounted(async () => {
  tenant.setSlug(slug)
  await tenant.fetchTienda()

  const response = await $fetch<Order[]>(
    `http://127.0.0.1:8000/api/orders/?store=${tenant.data.id}`
  )
  orders.value = response
  loading.value = false
})

const statusClass = (status: string) => {
  if (status === 'pending') return 'bg-yellow-100 text-yellow-700'
  if (status === 'paid') return 'bg-blue-100 text-blue-700'
  if (status === 'shipped') return 'bg-green-100 text-green-700'
  return 'bg-gray-100'
}
</script>
