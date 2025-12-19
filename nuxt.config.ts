export default defineNuxtConfig({
  // 1. Indica que el código fuente está en la carpeta 'app'
  srcDir: 'app/', 
  
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss'
  ],

  // 2. Ajusta la ruta de los stores (ahora están en app/stores)
  imports: {
    dirs: ['stores'] 
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE || 'http://127.0.0.1:8000/api'
    }
  },

  app: {
    head: {
      title: 'Pymeweb - Gestión Digital para PYMEs',
      meta: [{ name: 'description', content: 'Plataforma integral de gestión' }]
    }
  }
})