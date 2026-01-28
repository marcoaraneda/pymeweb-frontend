import { defineStore } from 'pinia'

type NotificationItem = { type: string; message: string; count: number; store?: string }
type NotificationHistoryItem = NotificationItem & { id: string; readAt: string }

const HISTORY_KEY = 'notification-history'

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    unread: [] as NotificationItem[],
    history: [] as NotificationHistoryItem[],
  }),
  getters: {
    totalUnread: (state) => state.unread.reduce((acc, n) => acc + (Number(n.count) || 0), 0),
  },
  actions: {
    loadHistory() {
      if (!process.client) return
      try {
        const raw = localStorage.getItem(HISTORY_KEY)
        if (raw) {
          this.history = JSON.parse(raw)
        }
      } catch (error) {
        console.warn('No se pudo cargar el historial de notificaciones', error)
        this.history = []
      }
    },
    saveHistory() {
      if (!process.client) return
      localStorage.setItem(HISTORY_KEY, JSON.stringify(this.history))
    },
    setUnread(items: NotificationItem[]) {
      this.unread = items || []
    },
    markAllAsRead() {
      if (!this.unread.length) return
      const timestamp = new Date().toISOString()
      const toArchive: NotificationHistoryItem[] = this.unread.map((item, idx) => ({
        ...item,
        id: `${timestamp}-${idx}`,
        readAt: timestamp,
      }))
      this.history = [...toArchive, ...this.history]
      this.unread = []
      this.saveHistory()
    },
    clearHistory() {
      this.history = []
      this.saveHistory()
    },
  },
})
