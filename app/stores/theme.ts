import { defineStore } from 'pinia'

type ThemeValues = { accent: string; gradientFrom: string; gradientTo: string }

const STORAGE_KEY = 'theme-preferences-v1'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    accent: '#2563eb',
    gradientFrom: '#111827',
    gradientTo: '#0b2358',
    perStore: {} as Record<string, ThemeValues>,
    hydrated: false,
  }),
  actions: {
    loadFromStorage() {
      if (!process.client || this.hydrated) return
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        try {
          const parsed = JSON.parse(raw)
          this.accent = parsed.accent || this.accent
          this.gradientFrom = parsed.gradientFrom || this.gradientFrom
          this.gradientTo = parsed.gradientTo || this.gradientTo
          this.perStore = parsed.perStore || {}
        } catch (error) {
          console.warn('No se pudo leer el tema guardado', error)
        }
      }
      this.hydrated = true
      this.applyTheme()
    },

    saveToStorage() {
      if (!process.client) return
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          accent: this.accent,
          gradientFrom: this.gradientFrom,
          gradientTo: this.gradientTo,
          perStore: this.perStore,
        })
      )
    },

    setAccent(color: string) {
      this.accent = color
      this.applyTheme()
      this.saveToStorage()
    },
    setGradient(from: string, to: string) {
      this.gradientFrom = from
      this.gradientTo = to
      this.applyTheme()
      this.saveToStorage()
    },

    setStoreTheme(slug: string, values: Partial<ThemeValues>) {
      if (!slug) return
      const current = this.perStore[slug] || {
        accent: this.accent,
        gradientFrom: this.gradientFrom,
        gradientTo: this.gradientTo,
      }
      this.perStore[slug] = {
        accent: values.accent || current.accent,
        gradientFrom: values.gradientFrom || current.gradientFrom,
        gradientTo: values.gradientTo || current.gradientTo,
      }
      this.applyTheme(this.perStore[slug])
      this.saveToStorage()
    },

    applyStoreTheme(slug: string) {
      if (slug && this.perStore[slug]) {
        this.applyTheme(this.perStore[slug])
        return
      }
      this.applyTheme()
    },

    applyTheme(overrides?: ThemeValues) {
      if (!process.client) return
      const root = document.documentElement
      const accent = overrides?.accent || this.accent
      const from = overrides?.gradientFrom || this.gradientFrom
      const to = overrides?.gradientTo || this.gradientTo

      root.style.setProperty('--accent', accent)
      root.style.setProperty('--gradient-from', from)
      root.style.setProperty('--gradient-to', to)
    },
  },
})
