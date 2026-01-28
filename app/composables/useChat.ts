import { useRuntimeConfig } from 'nuxt/app'

type MarketplaceProduct = {
  id: number | string
  name: string
  price: number
  offer_price?: number | null
  description?: string
  store?: { slug?: string; name?: string }
}

type StoreItem = { name: string; slug: string; description?: string }

let productsCache: MarketplaceProduct[] | null = null
let storesCache: StoreItem[] | null = null
let lastProductsFetch = 0
let lastStoresFetch = 0

const CACHE_TTL = 1000 * 60 * 5 // 5 minutos

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(value || 0)

export const useChat = () => {
  const config = useRuntimeConfig()

  const fetchMarketplaceProducts = async (): Promise<MarketplaceProduct[]> => {
    const now = Date.now()
    if (productsCache && now - lastProductsFetch < CACHE_TTL) return productsCache
    try {
      productsCache = await $fetch(`${config.public.apiBase}/marketplace/products/`)
      lastProductsFetch = now
      return productsCache || []
    } catch (error) {
      console.warn('No se pudieron cargar productos para el chat', error)
      return []
    }
  }

  const fetchStores = async (): Promise<StoreItem[]> => {
    const now = Date.now()
    if (storesCache && now - lastStoresFetch < CACHE_TTL) return storesCache
    try {
      storesCache = await $fetch(`${config.public.apiBase}/stores/`)
      lastStoresFetch = now
      return storesCache || []
    } catch (error) {
      console.warn('No se pudieron cargar tiendas para el chat', error)
      return []
    }
  }

  const cheapestProductAnswer = async () => {
    const products = await fetchMarketplaceProducts()
    if (!products.length) return 'Por ahora no encuentro productos en el marketplace. Intenta nuevamente en unos minutos.'
    const sorted = [...products].sort((a, b) => {
      const pa = Number(a.offer_price || a.price || 0)
      const pb = Number(b.offer_price || b.price || 0)
      return pa - pb
    })
    const top = sorted.slice(0, 3)
    const list = top
      .map((p) => {
        const storeLabel = p.store?.name ? `en la página de la tienda ${p.store.name}` : 'en la página principal del marketplace'
        return `• ${p.name} — ${formatCurrency(Number(p.offer_price || p.price || 0))} ${storeLabel}`
      })
      .join('\n')
    return `Te dejo los precios más convenientes que encontré recién:\n${list}\nSi te gusta alguno avísame y te abro la página adecuada.`
  }

  const computersAnswer = async () => {
    const products = await fetchMarketplaceProducts()
    const filtered = products.filter((p) => /comput|pc|laptop|notebook|equipo/i.test(p.name || p.description || ''))
    if (!filtered.length) {
      return 'No veo computadores disponibles en este momento. Puedes subir tu consulta al marketplace y te avisamos cuando aparezcan.'
    }
    const top = filtered.slice(0, 3)
    const list = top
      .map((p) => {
        const storeLabel = p.store?.name ? `Página de la tienda ${p.store.name}` : 'Página principal del marketplace'
        return `• ${p.name} — ${formatCurrency(Number(p.offer_price || p.price || 0))} · ${storeLabel}`
      })
      .join('\n')
    return `Esto es lo que veo en computadores ahora mismo:\n${list}\nSi buscas algo más específico dame pistas y seguimos afinando.`
  }

  const storesAnswer = async () => {
    const stores = await fetchStores()
    if (!stores.length) return 'Aún no tengo tiendas registradas, pero puedes crear la tuya desde el panel.'
    const list = stores
      .slice(0, 5)
      .map((s) => `• ${s.name} — Página de tienda (${s.name}) dentro de la sección Ver tiendas`)
      .join('\n')
    return `Aquí tienes un vistazo rápido de tiendas activas:\n${list}\nPara seguir descubriendo puedes entrar a la página "Ver tiendas" y deslizar por todas las opciones.`
  }

  const fallbackAnswer = () =>
    'Estoy lista para comparar precios, recomendar tiendas o listar productos por categoría. Intenta con preguntas como "¿Qué tienda vende más barato hoy?" o "Muéstrame notebooks disponibles".'

  const sendMessage = async (message: string) => {
    const lower = message.toLowerCase()
    let answer = ''

    if (lower.includes('barat') || lower.includes('econom')) {
      answer = await cheapestProductAnswer()
    } else if (/comput|pc|laptop|notebook/.test(lower)) {
      answer = await computersAnswer()
    } else if (lower.includes('tienda') || lower.includes('store')) {
      answer = await storesAnswer()
    } else {
      answer = fallbackAnswer()
    }

    return { answer }
  }

  return { sendMessage }
}