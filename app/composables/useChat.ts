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


  /**
   * Prompt base: El asistente solo responde sobre productos, tiendas, compras, ayuda de uso de la web y temas relacionados a Pymeweb. Si la pregunta no es relevante, responde que solo puede ayudar con temas de la página.
   */
  const sendMessage = async (message: string) => {
    const lower = message.toLowerCase()
    let answer = ''

    // Preguntas frecuentes y comandos clave
    if (lower.includes('barat') || lower.includes('econom')) {
      answer = await cheapestProductAnswer()
    } else if (/comput|pc|laptop|notebook/.test(lower)) {
      answer = await computersAnswer()
    } else if (lower.includes('tienda') || lower.includes('store')) {
      answer = await storesAnswer()
    } else if (lower.includes('ayuda') || lower.includes('cómo funciona') || lower.includes('uso')) {
      answer = 'Puedes buscar productos, comparar precios, ver tiendas y comprar directamente desde la plataforma. Pregúntame por productos o tiendas para empezar.'
    } else if (lower.includes('contacto') || lower.includes('soporte')) {
      answer = 'Para soporte o contacto, utiliza el formulario de contacto en la web o revisa la sección de ayuda.'
    } else if (lower.match(/(hola|buenas|buenos días|buenas tardes|buenas noches)/)) {
      answer = '¡Hola! ¿En qué puedo ayudarte hoy? Puedes preguntarme por productos, precios o tiendas.'
    } else if (lower.match(/(quién eres|quien eres|tu nombre|eres humano|eres una ia)/)) {
      answer = 'Soy Aurora, la asistente virtual de Pymeweb. Te ayudo a encontrar productos, comparar precios y resolver dudas sobre la plataforma.'
    } else if (lower.match(/(gracias|muchas gracias|te agradezco)/)) {
      answer = '¡De nada! Si tienes otra pregunta, aquí estaré.'
    } else if (lower.match(/(chiste|cuéntame un chiste|cuentame un chiste)/)) {
      answer = '¿Por qué el computador fue al doctor? ¡Porque tenía un virus!'
    } else if (lower.match(/(quién hizo|quien hizo|quién creó|quien creo|quién desarrolló|quien desarrollo)/)) {
      answer = 'Esta plataforma fue desarrollada por el equipo de Pymeweb para ayudarte a encontrar y comparar productos de distintas tiendas.'
    } else if (lower.match(/(no encuentro|no hay|no aparece)/)) {
      answer = 'Si no encuentras un producto o tienda, puede que aún no esté disponible. ¡Sigue buscando o vuelve más tarde!'
    } else if (lower.match(/(categoría|categorias|categorías)/)) {
      answer = 'Puedes buscar productos por categoría usando el buscador o preguntándome por el tipo de producto que te interesa.'
    } else if (lower.match(/(envío|envios|envíos|despacho|despachos)/)) {
      answer = 'El envío depende de cada tienda. Consulta la página de la tienda para ver opciones y tiempos de despacho.'
    } else {
      // Si la pregunta no es relevante, responde con el prompt base
      answer = 'Solo puedo responder preguntas sobre productos, tiendas, compras y el uso de Pymeweb. Intenta preguntarme por precios, productos o ayuda sobre la plataforma.'
    }

    return { answer }
  }

  return { sendMessage }
}