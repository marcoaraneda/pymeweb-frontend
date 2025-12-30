<template>
  <div class="max-w-3xl mx-auto">
    <h1 class="text-3xl font-bold mb-8 text-blue-700">
      Checkout
    </h1>

    <!-- Carrito vacío -->
    <div v-if="cart.items.length === 0" class="text-gray-500">
      Tu carrito está vacío.
    </div>

    <!-- Checkout -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-8">

      <!-- DATOS CLIENTE -->
      <div class="bg-white p-6 rounded-xl shadow space-y-4">
        <h2 class="text-xl font-semibold text-blue-600">
          Datos del cliente
        </h2>

        <input v-model="form.name" type="text" placeholder="Nombre completo" class="input" />
        <input v-model="form.email" type="email" placeholder="Correo electrónico" class="input" />
        <input v-model="form.phone" type="text" placeholder="Teléfono" class="input" />
        <textarea v-model="form.address" placeholder="Dirección de despacho" rows="3" class="input" />
      </div>

      <!-- RESUMEN -->
      <div class="bg-white p-6 rounded-xl shadow space-y-4">
        <h2 class="text-xl font-semibold text-blue-600">
          Resumen del pedido
        </h2>

        <div
          v-for="item in cart.items"
          :key="item.id"
          class="flex justify-between text-sm"
        >
          <span>{{ item.name }} x {{ item.quantity }}</span>
          <span class="font-medium">
            ${{ item.price * item.quantity }}
          </span>
        </div>

        <hr />

        <div class="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>${{ cart.totalPrice }}</span>
        </div>

        <button
          @click="confirmOrder"
          class="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-500 transition"
        >
          Confirmar pedido
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '~~/stores/cart'
import { useTenantStore } from '~~/stores/tenant'

const cart = useCartStore()
const tenantStore = useTenantStore()
const route = useRoute()
const router = useRouter()

const slug = route.params.slug as string

const form = reactive({
  name: '',
  email: '',
  phone: '',
  address: ''
})

onMounted(async () => {
  tenantStore.setSlug(slug)
  if (!tenantStore.data) {
    await tenantStore.fetchTienda()
  }
})

const confirmOrder = async () => {
  if (!tenantStore.data) {
    alert('Error: tienda no cargada')
    return
  }

  try {
    // ✅ GUARDAMOS RESPUESTA
    const response: any = await $fetch('http://127.0.0.1:8000/api/orders/', {
      method: 'POST',
      body: {
        store: tenantStore.data.id,
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        total: cart.totalPrice,
        items: cart.items.map(item => ({
          product: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      }
    })

    cart.clearCart()

    // ✅ REDIRECCIÓN CORRECTA
    router.push(`/store/${slug}/success/${response.id}`)

  } catch (e) {
    alert('Error al crear el pedido')
    console.error(e)
  }
}
</script>

<style scoped>
.input {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  outline: none;
}

.input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}
</style>
