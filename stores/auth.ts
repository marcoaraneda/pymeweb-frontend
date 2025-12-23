import { navigateTo, useCookie, useRuntimeConfig } from 'nuxt/app'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
    user: null as any | null, // Incluye rol y store_id
  }),
  actions: {
    async login(credentials: any) {
      const config = useRuntimeConfig()
      const data: any = await $fetch(`${config.public.apiBase}/users/login/`, {
        method: 'POST',
        body: credentials
      })
      this.token = data.access
      this.user = data.user
      // Guardar token en cookie segura (HTTPOnly en prod) para cumplir ley de datos
      const cookie = useCookie('auth_token', { maxAge: 60 * 60 * 24, sameSite: 'lax' })
      cookie.value = data.access
    },
    logout() {
      this.token = null
      this.user = null
      useCookie('auth_token').value = null
      navigateTo('/')
    }
  }
})