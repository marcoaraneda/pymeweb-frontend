import { navigateTo, useCookie, useRuntimeConfig } from 'nuxt/app'
import { defineStore } from 'pinia'

type Credentials = { username: string; password: string }
type SignupPayload = { username: string; email: string; password: string; first_name?: string; last_name?: string }
type StoreLite = { id: number; name: string; slug: string }
type UserProfile = {
  id: number
  username: string
  email: string
  first_name?: string
  last_name?: string
  avatar_url?: string | null
  is_staff?: boolean
  memberships?: Array<{ store: StoreLite; roles: string[] }>
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
    refreshToken: null as string | null,
    user: null as any | null,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.token),
  },

  actions: {
    restoreFromCookies() {
      const secure = process.env.NODE_ENV === 'production'
      const tokenCookie = useCookie<string | null>('auth_token', { secure })
      const refreshCookie = useCookie<string | null>('refresh_token', { secure })
      this.token = tokenCookie.value || null
      this.refreshToken = refreshCookie.value || null
    },

    async login(credentials: Credentials) {
      this.loading = true
      this.error = null
      const config = useRuntimeConfig()

      try {
        const data = await $fetch<{ access: string; refresh: string }>(`${config.public.apiBase}/token/`, {
          method: 'POST',
          body: credentials,
        })

        this.token = data.access
        this.refreshToken = data.refresh

        const secure = process.env.NODE_ENV === 'production'
        useCookie('auth_token', { maxAge: 60 * 60 * 24, sameSite: 'lax', secure }).value = data.access
        useCookie('refresh_token', { maxAge: 60 * 60 * 24 * 7, sameSite: 'lax', secure }).value = data.refresh

        await this.fetchProfile()
      } catch (error: any) {
        const detail = error?.response?._data?.detail || 'No pudimos iniciar sesión'
        this.error = detail
        throw new Error(detail)
      } finally {
        this.loading = false
      }
    },

    async register(payload: SignupPayload) {
      this.loading = true
      this.error = null
      const config = useRuntimeConfig()

      try {
        const data = await $fetch<{ access: string; refresh: string; user: UserProfile }>(`${config.public.apiBase}/users/signup/`, {
          method: 'POST',
          body: payload,
        })

        this.token = data.access
        this.refreshToken = data.refresh
        this.user = data.user

        const secure = process.env.NODE_ENV === 'production'
        useCookie('auth_token', { maxAge: 60 * 60 * 24, sameSite: 'lax', secure }).value = data.access
        useCookie('refresh_token', { maxAge: 60 * 60 * 24 * 7, sameSite: 'lax', secure }).value = data.refresh
      } catch (error: any) {
        const detail = error?.response?._data?.detail || error?.response?._data || 'No pudimos registrar tu cuenta'
        this.error = detail
        throw new Error(detail)
      } finally {
        this.loading = false
      }
    },

    async fetchProfile(): Promise<UserProfile | null> {
      if (!this.token) return null
      const config = useRuntimeConfig()

      try {
        const profile = await $fetch<UserProfile>(`${config.public.apiBase}/users/me/`, {
          headers: { Authorization: `Bearer ${this.token}` },
        })
        this.user = profile
        return profile
      } catch (error: any) {
        const code = error?.response?._data?.code
        if (code === 'token_not_valid' && this.refreshToken) {
          const refreshed = await this.refreshTokens()
          if (refreshed) {
            try {
              const profile = await $fetch<UserProfile>(`${config.public.apiBase}/users/me/`, {
                headers: { Authorization: `Bearer ${refreshed}` },
              })
              this.user = profile
              return profile
            } catch (e) {
              // fall through to error handling
            }
          }
        }
        const detail = error?.response?._data?.detail || 'No pudimos cargar tu perfil'
        this.error = detail
        return null
      }
    },

    async refreshTokens(): Promise<string | null> {
      if (!this.refreshToken) return null
      const config = useRuntimeConfig()
      try {
        const data = await $fetch<{ access: string }>(`${config.public.apiBase}/token/refresh/`, {
          method: 'POST',
          body: { refresh: this.refreshToken },
        })

        this.token = data.access
        const secure = process.env.NODE_ENV === 'production'
        useCookie('auth_token', { maxAge: 60 * 60 * 24, sameSite: 'lax', secure }).value = data.access
        return data.access
      } catch (error) {
        this.logout()
        return null
      }
    },

    async fetchMyStores(): Promise<StoreLite[]> {
      if (!this.token) return []
      const config = useRuntimeConfig()
      try {
        return await $fetch<StoreLite[]>(`${config.public.apiBase}/stores/mine/`, {
          headers: { Authorization: `Bearer ${this.token}` },
        })
      } catch (error: any) {
        const code = error?.response?._data?.code
        if (code === 'token_not_valid' && this.refreshToken) {
          const refreshed = await this.refreshTokens()
          if (refreshed) {
            try {
              return await $fetch<StoreLite[]>(`${config.public.apiBase}/stores/mine/`, {
                headers: { Authorization: `Bearer ${refreshed}` },
              })
            } catch (e) {
              console.error('Reintento falló al cargar tus tiendas', e)
            }
          }
        }
        console.error('No pudimos cargar tus tiendas', error)
        return []
      }
    },

    logout(options?: { redirectTo?: string }) {
      // Decide destino antes de limpiar el estado para no perder el slug
      const fallbackSlug = this.user?.memberships?.[0]?.store?.slug
      const redirect = options?.redirectTo
        ? options.redirectTo
        : fallbackSlug
          ? `/store/${fallbackSlug}/admin/login`
          : '/'

      this.token = null
      this.refreshToken = null
      this.user = null
      const secure = process.env.NODE_ENV === 'production'
      useCookie('auth_token', { secure }).value = null
      useCookie('refresh_token', { secure }).value = null

      navigateTo(redirect)
    },
  },
})