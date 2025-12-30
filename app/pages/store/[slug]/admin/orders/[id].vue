<template>
  <div class="max-w-4xl mx-auto space-y-6">

    <NuxtLink
      :to="`/store/${slug}/admin/orders`"
      class="text-blue-600 hover:underline"
    >
      ← Volver a pedidos
    </NuxtLink>

    <div v-if="loading" class="text-gray-500">
      Cargando pedido...
    </div>

    <div v-else-if="order" class="bg-white p-6 rounded-xl shadow space-y-6">

      <!-- CLIENTE -->
      <div>
        <h2 class="text-2xl font-bold text-blue-600 mb-2">
          Pedido #{{ order.id }}
        </h2>

        <p><b>Cliente:</b> {{ order.name }}</p>
        <p><b>Email:</b> {{ order.email }}</p>
        <p><b>Teléfono:</b> {{ order.phone }}</p>
        <p><b>Dirección:</b> {{ order.address }}</p>
      </div>

      <!-- ESTADO -->
      <div>
        <label class="font-semibold mr-2">Estado:</label>
        <select
          v-model="order.status"
          @change="updateStatus"
          class="border rounded px-3 py-1"
        >
          <option value="pending">Pendiente</option>
          <option value="paid">Pagado</option>
          <option value="shipped">Enviado</option>
        </select>
      </div>

      <!-- PRODUCTOS -->
      <div>
        <h3 class="font-semibold mb-2">Productos</h3>

        <table class="w-full text-sm">
          <thead>
            <tr class="border-b">
              <th class="text-left py-2">Producto</th>
              <th>Cantidad</th>
              <th>Precio</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in order.items"
              :key="item.id"
              class="border-b"
            >
              <td>{{ item.product_name }}</td>
              <td class="text-center">{{ item.quantity }}</td>
              <td class="text-center">${{ item.price }}</td>
              <td class="text-right">
                ${{ item.quantity * Number(item.price) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- TOTAL -->
      <div class="text-right text-lg font-bold">
        Total: ${{ order.total }}
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

interface OrderItem {
  id: number
  product_name: string
  quantity: number
  price: string
}

interface Order {
  id: number
  name: string
  email: string
  phone: string
  address: string
  total: string
  status: string
  items: OrderItem[]
}

const route = useRoute()
const slug = route.params.slug as string
const orderId = route.params.id as string

const order = ref<Order | null>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    order.value = await $fetch<Order>(
      `http://127.0.0.1:8000/api/orders/${orderId}/`
    )
  } finally {
    loading.value = false
  }
})

const updateStatus = async () => {
  if (!order.value) return

  await $fetch(
    `http://127.0.0.1:8000/api/orders/${order.value.id}/`,
    {
      method: 'PATCH',
      body: { status: order.value.status }
    }
  )
}
</script>
