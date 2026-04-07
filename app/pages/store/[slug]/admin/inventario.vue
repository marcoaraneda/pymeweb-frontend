<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Control de Inventario</h1>
        <p class="text-sm text-gray-500">Consulta stock por variante y registra ajustes rápidos.</p>
      </div>
      <button @click="refreshStock" class="text-sm bg-gray-200 px-4 py-2 rounded-lg">Actualizar</button>
    </div>

    <div v-if="errorMessage" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ errorMessage }}
    </div>

    <div v-if="loading" class="rounded-xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
      Cargando inventario...
    </div>

    <div v-else class="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div v-if="!inventory.length" class="px-4 py-6 text-sm text-slate-500">No hay registros de stock para esta tienda.</div>
      <table v-else class="w-full text-left">
        <thead class="bg-gray-50 border-b">
          <tr>
            <th class="p-4 font-semibold text-gray-600">Producto / Variante</th>
            <th class="p-4 font-semibold text-gray-600">Stock Actual</th>
            <th class="p-4 font-semibold text-gray-600">Estado</th>
            <th class="p-4 font-semibold text-gray-600 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in inventory" :key="item.id" class="border-b hover:bg-gray-50">
            <td class="p-4">
              <p class="font-medium">{{ item.product_name }}</p>
              <p class="text-xs text-gray-500">{{ item.variant_name }} (SKU: {{ item.sku }})</p>
            </td>
            <td class="p-4 font-mono">{{ item.stock_available }}</td>
            <td class="p-4">
              <span v-if="item.stock_available <= item.stock_minimum" class="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">
                STOCK BAJO
              </span>
              <span v-else class="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Saludable</span>
              <p class="mt-1 text-[11px] text-gray-500">Mínimo {{ item.stock_minimum }}</p>
            </td>
            <td class="p-4 text-right">
              <button @click="openAdjustment(item)" class="text-blue-600 hover:underline text-sm font-medium">
                Ajustar Stock
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['tenant', 'auth'], requiresAuth: true })
const { getStock, updateStock } = useInventory()

type InventoryItem = {
  id: number
  variant: number
  product_name: string
  variant_name: string
  sku: string
  stock_available: number
  stock_minimum: number
}

const inventory = ref<InventoryItem[]>([])
const loading = ref(false)
const errorMessage = ref('')

const refreshStock = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    inventory.value = await getStock()
  } catch (e: any) {
    errorMessage.value = e?.message || 'No se pudo cargar el inventario.'
  } finally {
    loading.value = false
  }
}

const openAdjustment = async (item: InventoryItem) => {
  const raw = window.prompt(`Nuevo stock para ${item.product_name} / ${item.variant_name}`, String(item.stock_available))
  if (raw === null) return
  const nextValue = Number(raw)
  if (!Number.isFinite(nextValue) || nextValue < 0) {
    window.alert('Ingresa un stock válido mayor o igual a 0.')
    return
  }

  const delta = nextValue - item.stock_available
  if (delta === 0) return

  try {
    await updateStock({
      variantId: item.variant,
      quantity: Math.abs(delta),
      type: delta > 0 ? 'ENTRY' : 'EXIT',
      reason: 'Ajuste manual desde panel',
    })
    await refreshStock()
  } catch (e: any) {
    window.alert(e?.message || 'No se pudo actualizar el stock.')
  }
}

onMounted(refreshStock)
</script>
