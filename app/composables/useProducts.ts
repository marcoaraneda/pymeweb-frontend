import { useRuntimeConfig } from "nuxt/app"
import { useTenantStore } from "../stores/tenant"

export const useProducts = () => {
  const config = useRuntimeConfig()
  const tenantStore = useTenantStore()

  const getProducts = async (params = {}) => {
    // Filtramos siempre por la tienda actual según el slug de la URL [cite: 72, 75]
    return await $fetch(`${config.public.apiBase}/catalog/products/`, {
      params: { store_slug: tenantStore.slug, ...params }
    })
  }

  const getProductBySlug = async (productSlug: string) => {
    return await $fetch(`${config.public.apiBase}/catalog/products/${productSlug}/`, {
      params: { store_slug: tenantStore.slug }
    })
  }

  return { getProducts, getProductBySlug }
}