<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <header class="relative z-50 overflow-visible border-b border-slate-200 bg-white/85 backdrop-blur">
      <div class="pointer-events-none absolute inset-0" aria-hidden="true">
        <div class="absolute -left-12 top-6 h-40 w-40 rounded-full" :style="gradientStyle" />
        <div class="absolute -right-10 -bottom-6 h-48 w-48 rounded-full" :style="gradientStyle" />
      </div>
      <div class="relative mx-auto flex max-w-7xl items-center justify-between gap-5 px-6 py-4">
        <div class="flex flex-shrink-0 items-center gap-3">
          <div class="relative z-30">
            <button
              ref="menuBtnRef"
              class="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"
              aria-label="Menú general"
              @click.stop="toggleGeneralMenu"
            >
              <Menu class="h-5 w-5" aria-hidden="true" />
            </button>
            <teleport to="body">
              <div v-if="showGeneralMenu">
                <div class="fixed inset-0 z-[99999]" @click="showGeneralMenu = false"></div>
                <div
                  class="fixed w-48 rounded-2xl border border-slate-200 bg-white p-3 text-sm shadow-lg z-[100000]"
                  :style="menuGeneralStyle"
                  style="min-width:180px"
                  @click.stop
                >
                  <p class="px-2 text-[11px] uppercase tracking-[0.18em] text-slate-500">General</p>
                  <div class="mt-2 space-y-2">
                    <NuxtLink to="/" class="flex items-center gap-2 rounded-xl px-3 py-2 text-slate-800 hover:bg-slate-50">
                      <Home class="h-4 w-4" aria-hidden="true" />
                      Menú principal
                    </NuxtLink>
                    <NuxtLink to="/marketplace" class="flex items-center gap-2 rounded-xl px-3 py-2 text-slate-800 hover:bg-slate-50">
                      <StoreIcon class="h-4 w-4" aria-hidden="true" />
                      Marketplace
                    </NuxtLink>
                    <NuxtLink
                      v-if="auth.isAuthenticated && hasStores"
                      to="/dashboard"
                      class="flex items-center gap-2 rounded-xl px-3 py-2 text-slate-800 hover:bg-slate-50"
                    >
                      <LayoutDashboard class="h-4 w-4" aria-hidden="true" />
                      Dashboard
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </teleport>
          </div>
          <button
            class="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-white shadow ring-1 ring-slate-200"
            :aria-label="canEditBrand ? 'Cambiar imagen de la tienda' : 'Logo de la tienda'"
            :class="canEditBrand ? 'hover:ring-2 hover:ring-slate-300' : ''"
            @click="canEditBrand && openLogoPrompt()"
          >
            <img v-if="brandLogo" :src="brandLogo" alt="Logo tienda" class="h-full w-full object-cover" />
            <img v-else src="https://placehold.co/120x120?text=Logo" alt="Logo placeholder" class="h-full w-full object-cover" />
            <span v-if="canEditBrand" class="absolute inset-0 flex items-center justify-center bg-black/40 text-[11px] font-semibold text-white opacity-0 transition hover:opacity-100">Cambiar</span>
          </button>
          <input ref="logoFileInput" type="file" accept="image/*" class="hidden" @change="onLogoFileChange" />
          <div>
            <NuxtLink :to="`/store/${slug}`" class="text-xl font-semibold leading-tight text-slate-900 hover:underline">
              {{ brandName }}
            </NuxtLink>
            <p class="text-xs text-slate-600">Catálogo en vivo</p>
          </div>
        </div>

        <nav class="hidden flex-1 flex-nowrap items-center justify-center gap-3 md:flex overflow-x-auto">
          <template v-if="hasStoreContext">
            <div class="flex flex-nowrap items-center gap-3">
              <NuxtLink :to="`/store/${slug}`" :class="navButtonClass">
                <Home class="h-4 w-4" aria-hidden="true" />
                Inicio
              </NuxtLink>
              <NuxtLink :to="`/store/${slug}/productos`" :class="navButtonClass">
                <ShoppingBag class="h-4 w-4" aria-hidden="true" />
                Productos
              </NuxtLink>
              <NuxtLink :to="`/store/${slug}/acerca`" :class="navButtonClass">
                <Info class="h-4 w-4" aria-hidden="true" />
                Acerca de
              </NuxtLink>
              <NuxtLink :to="`/store/${slug}/soporte`" :class="navButtonClass">
                <Headset class="h-4 w-4" aria-hidden="true" />
                Soporte
              </NuxtLink>
            </div>
          </template>
        </nav>

        <div class="flex flex-shrink-0 flex-nowrap items-center gap-3">
          <button class="md:hidden rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 glass-btn" @click.stop="showMobileNav = !showMobileNav">Menú</button>
          <NuxtLink
            :to="`/store/${slug}/carrito`"
            class="relative flex h-10 w-10 items-center justify-center rounded-xl text-white shadow"
            :style="{ backgroundColor: accentColor }"
            aria-label="Carrito"
          >
            <ShoppingCart class="h-5 w-5" aria-hidden="true" />
            <span
              v-if="cart.totalItems > 0"
              class="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white px-1 text-xs font-semibold text-slate-900"
            >
              {{ cart.totalItems }}
            </span>
          </NuxtLink>

          <NuxtLink
            v-if="!auth.isAuthenticated"
            to="/login"
            :class="navButtonClass"
          >
            <LogIn class="h-4 w-4" aria-hidden="true" />
            Iniciar sesión
          </NuxtLink>
          <div class="flex flex-nowrap items-center gap-2 md:gap-3">
            <div class="relative flex items-center">
              <button
                ref="notifBtnRef"
                class="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow ring-1 ring-slate-200 text-slate-800 glass-btn"
                aria-label="Notificaciones"
                @click.stop="toggleNotifications"
              >
                <Bell class="h-5 w-5" aria-hidden="true" />
                <span
                  v-if="notificationsCount > 0"
                  class="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white"
                >
                  {{ notificationsCount }}
                </span>
              </button>
              <teleport to="body">
                <div v-if="showNotifications">
                  <div class="fixed inset-0 z-[99999]" @click="showNotifications = false"></div>
                  <div
                    class="fixed w-64 rounded-2xl border border-slate-200 bg-white p-3 text-sm shadow-lg z-[100000]"
                    :style="notifMenuStyle"
                    @click.stop
                  >
                    <div class="flex items-center justify-between">
                      <p class="font-semibold text-slate-800">Notificaciones</p>
                    </div>
                    <div class="mt-2 space-y-2 max-h-60 overflow-y-auto">
                      <p v-if="!notifications.length" class="text-slate-500">Sin notificaciones.</p>
                      <div
                        v-else
                        v-for="(n, idx) in notifications"
                        :key="idx"
                        class="w-full rounded-lg border border-slate-100 px-2 py-1 text-slate-700"
                      >
                        {{ n.message }}
                      </div>
                    </div>
                    <div class="mt-3 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        class="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 hover:border-slate-300"
                        @click="clearNotifications"
                      >
                        Borrar notificaciones
                      </button>
                      <button
                        type="button"
                        class="flex-1 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                        @click="viewNotifications"
                      >
                        Ver notificaciones
                      </button>
                    </div>
                  </div>
                </div>
              </teleport>
            </div>
            <NuxtLink
              to="/profile"
              :class="[navButtonClass, 'h-11 whitespace-nowrap']"
            >
              <span
                v-if="avatarUrl"
                class="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-slate-100"
              >
                <img :src="avatarUrl" alt="Avatar" class="h-full w-full object-cover" />
              </span>
              <span v-else class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs uppercase">{{ userInitials }}</span>
              <span class="max-w-[120px] truncate">{{ auth.user?.username || 'Perfil' }}</span>
            </NuxtLink>
          </div>
        </div>
      </div>

      <div v-if="showMobileNav" class="md:hidden border-t border-slate-200 bg-white/95 px-6 py-3 text-sm">
        <div class="flex flex-col gap-4">
          <div class="space-y-2">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-500">General</p>
            <NuxtLink to="/" :class="mobileButtonClass">
              <Home class="h-4 w-4" aria-hidden="true" />
              <span>Menú principal</span>
            </NuxtLink>
            <NuxtLink to="/marketplace" :class="mobileButtonClass">
              <StoreIcon class="h-4 w-4" aria-hidden="true" />
              <span>Marketplace</span>
            </NuxtLink>
          </div>
          <div v-if="hasStoreContext" class="space-y-2">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-500">Esta tienda</p>
            <NuxtLink :to="`/store/${slug}`" :class="mobileButtonClass">
              <Home class="h-4 w-4" aria-hidden="true" />
              <span>Inicio</span>
            </NuxtLink>
            <NuxtLink :to="`/store/${slug}/productos`" :class="mobileButtonClass">
              <ShoppingBag class="h-4 w-4" aria-hidden="true" />
              <span>Productos</span>
            </NuxtLink>
            <NuxtLink :to="`/store/${slug}/acerca`" :class="mobileButtonClass">
              <Info class="h-4 w-4" aria-hidden="true" />
              <span>Acerca de</span>
            </NuxtLink>
            <NuxtLink :to="`/store/${slug}/soporte`" :class="mobileButtonClass">
              <Headset class="h-4 w-4" aria-hidden="true" />
              <span>Soporte</span>
            </NuxtLink>
            <NuxtLink :to="`/store/${slug}/carrito`" :class="mobileButtonClass">
              <ShoppingCart class="h-4 w-4" aria-hidden="true" />
              <span>Carrito</span>
            </NuxtLink>
          </div>
          <div class="space-y-2">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-500">Cuenta</p>
            <NuxtLink v-if="auth.isAuthenticated && hasStores" to="/dashboard" :class="mobileButtonClass">
              <LayoutDashboard class="h-4 w-4" aria-hidden="true" />
              <span>Dashboard</span>
            </NuxtLink>
            <NuxtLink v-if="auth.isAuthenticated" to="/profile" :class="mobileButtonClass">
              <UserRound class="h-4 w-4" aria-hidden="true" />
              <span>Perfil</span>
            </NuxtLink>
            <NuxtLink v-else to="/login" :class="mobileButtonClass">
              <LogIn class="h-4 w-4" aria-hidden="true" />
              <span>Iniciar sesión</span>
            </NuxtLink>
            <button
              v-if="auth.isAuthenticated"
              :class="[mobileButtonClass, 'text-red-600']"
              @click="handleLogout"
            >
              <LogOut class="h-4 w-4" aria-hidden="true" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="pb-12 reveal" style="animation-delay: 0.04s;">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, watch, ref, nextTick } from 'vue'
// Refs para los menús
const notifBtnRef = ref<HTMLElement | null>(null)
const notifMenuStyle = ref('')
const menuBtnRef = ref<HTMLElement | null>(null)
const menuGeneralStyle = ref('')

const toggleNotifications = async () => {
  showNotifications.value = !showNotifications.value
  if (showNotifications.value) {
    await nextTick()
    if (notifBtnRef.value) {
      const rect = notifBtnRef.value.getBoundingClientRect()
      notifMenuStyle.value = `top: ${rect.bottom + 8}px; left: ${rect.left}px;` // 8px de separación
    }
  }
}

const toggleGeneralMenu = async () => {
  showGeneralMenu.value = !showGeneralMenu.value
  if (showGeneralMenu.value) {
    await nextTick()
    if (menuBtnRef.value) {
      const rect = menuBtnRef.value.getBoundingClientRect()
      menuGeneralStyle.value = `top: ${rect.bottom + 8}px; left: ${rect.left}px;` // 8px de separación
    }
  }
}
import { useRoute, useRouter } from 'vue-router'
import { useRuntimeConfig, navigateTo } from 'nuxt/app'
import {
  ShoppingCart,
  Bell,
  Home,
  Store as StoreIcon,
  ShoppingBag,
  Info,
  Headset,
  LayoutDashboard,
  LogIn,
  LogOut,
  UserRound,
  Menu,
} from 'lucide-vue-next'
import { useTenantStore } from '~/stores/tenant'
import { useCartStore } from '~/stores/cart'
import { useAuthStore } from '~/stores/auth'
import { useThemeStore } from '~/stores/theme'
import { useNotificationStore } from '~/stores/notifications'

const route = useRoute()
const router = useRouter()
const slug = computed(() => route.params.slug as string)

const tenantStore = useTenantStore()
const cart = useCartStore()
const auth = useAuthStore()
const theme = useThemeStore()
const config = useRuntimeConfig()

const brandName = computed(() => tenantStore.data?.name || 'Tu tienda')
const brandInitials = computed(() => (brandName.value || 'T')[0]?.toUpperCase?.() || 'T')
const brandLogo = computed(() => tenantStore.data?.logo_url || tenantStore.data?.logo?.url || tenantStore.data?.logo || '')
const avatarUrl = computed(() => auth.user?.avatar_url || null)
const userInitials = computed(() => (auth.user?.username || 'U').slice(0, 2).toUpperCase())
const accentColor = computed(() => theme.accent || '#2563eb')
const gradientStyle = computed(() => ({ backgroundImage: `linear-gradient(120deg, ${theme.gradientFrom}, ${theme.gradientTo})`, opacity: 0.18 }))
const hasStores = computed(() => ((auth.user as any)?.memberships || []).length > 0)
const hasStoreContext = computed(() => Boolean(slug.value))
const showMobileNav = ref(false)
const showGeneralMenu = ref(false)
const navButtonClass = 'inline-flex h-11 min-w-[140px] items-center justify-center gap-2 rounded-2xl border border-slate-900/15 bg-white px-4 text-sm font-semibold text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 whitespace-nowrap'
const mobileButtonClass = 'flex w-full items-center gap-3 rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm'
const notificationStore = useNotificationStore()
const notifications = computed(() => notificationStore.unread)
const notificationsCount = computed(() => notificationStore.totalUnread)
const showNotifications = ref(false)
const logoFileInput = ref<HTMLInputElement | null>(null)
const uploadingLogo = ref(false)
const logoError = ref('')
const cloudinaryUploadUrl = computed(() => {
  if (config.public.cloudinaryUploadUrl) return config.public.cloudinaryUploadUrl
  if (config.public.cloudinaryCloudName) return `https://api.cloudinary.com/v1_1/${config.public.cloudinaryCloudName}/upload`
  return ''
})

const getErrorMessage = (err: any) => {
  const detail = err?.response?._data?.detail || err?.response?._data
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) return detail.join(', ')
  if (detail && typeof detail === 'object') return Object.values(detail).flat().join(', ')
  return err?.message || 'Ocurrió un error'
}

const uploadToCloudinary = async (fileOrUrl: File | string, folder = 'upload/store') => {
  if (!cloudinaryUploadUrl.value || !config.public.cloudinaryUploadPreset) {
    throw new Error('Configura CLOUDINARY_CLOUD_NAME y CLOUDINARY_UPLOAD_PRESET')
  }
  const formData = new FormData()
  formData.append('file', fileOrUrl)
  formData.append('upload_preset', config.public.cloudinaryUploadPreset)
  formData.append('folder', folder)
  return $fetch<any>(cloudinaryUploadUrl.value, { method: 'POST', body: formData })
}

const ensureCloudinaryUrl = async (currentUrl?: string) => {
  if (!currentUrl) return ''
  if (currentUrl.includes('res.cloudinary.com')) return currentUrl
  const result = await uploadToCloudinary(currentUrl, 'upload/store')
  if (!result?.secure_url) throw new Error('No pudimos subir la imagen a Cloudinary')
  return result.secure_url
}

const canEditBrand = computed(() => {
  const membership = (auth.user as any)?.memberships || []
  return membership.some((m: any) => m?.store?.slug === slug.value && (m.roles || []).includes('ADMIN'))
})

const applyThemeForSlug = () => {
  theme.loadFromStorage()
  theme.applyStoreTheme(slug.value)
}

const ensureStoreData = async () => {
  tenantStore.setSlug(slug.value)
  if (!tenantStore.data || tenantStore.data.slug !== slug.value) {
    await tenantStore.fetchTienda()
  }
}

const loadNotifications = async () => {
  if (!auth.token) {
    notificationStore.setUnread([])
    return
  }
  try {
    const data = await $fetch<{ notifications?: { type: string; message: string; count: number }[] }>(
      `${config.public.apiBase}/support/dashboard/summary/`,
      {
        headers: { Authorization: `Bearer ${auth.token}` },
        params: slug.value ? { store: slug.value } : {},
      }
    )
    notificationStore.setUnread(data?.notifications || [])
  } catch (error) {
    console.warn('No se pudieron cargar notificaciones', error)
    notificationStore.setUnread([])
  }
}

const clearNotifications = () => {
  notificationStore.markAllAsRead()
  notificationStore.clearHistory()
  notificationStore.setUnread([])
  showNotifications.value = false
}

const viewNotifications = async () => {
  showNotifications.value = false
  await navigateTo('/notificaciones')
}

const updateStoreLogo = async (url: string) => {
  await $fetch(`${config.public.apiBase}/stores/${slug.value}/`, {
    method: 'PATCH',
    body: { logo_url: url },
    headers: auth.token ? { Authorization: `Bearer ${auth.token}` } : {},
  })
  tenantStore.data = { ...(tenantStore.data || {}), logo_url: url }
  await tenantStore.fetchTienda()
}

const handleLogoError = (error: any) => {
  logoError.value = getErrorMessage(error)
  console.error('No pudimos actualizar el logo', error)
  if (logoError.value) window.alert(logoError.value)
}

const onLogoFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target?.files?.[0]
  if (!file) return
  uploadingLogo.value = true
  logoError.value = ''
  try {
    const result = await uploadToCloudinary(file, 'upload/store')
    if (!result?.secure_url) throw new Error('No pudimos obtener la URL del logo')
    await updateStoreLogo(result.secure_url)
  } catch (error) {
    handleLogoError(error)
  } finally {
    uploadingLogo.value = false
    if (target) target.value = ''
  }
}

const updateLogoFromUrl = async (url: string) => {
  uploadingLogo.value = true
  logoError.value = ''
  try {
    const cloudUrl = await ensureCloudinaryUrl(url)
    await updateStoreLogo(cloudUrl)
  } catch (error) {
    handleLogoError(error)
  } finally {
    uploadingLogo.value = false
  }
}

const openLogoPrompt = async () => {
  if (!canEditBrand.value) return
  // Abrir selector de archivo directamente
  logoFileInput.value?.click()
}

onMounted(async () => {
  auth.restoreFromCookies()
  if (auth.token && !auth.user) {
    await auth.fetchProfile()
  }
  applyThemeForSlug()
  cart.loadFromStorage()
  cart.setContext(slug.value)
  await ensureStoreData()
  await loadNotifications()
})

onBeforeUnmount(() => {
  theme.resetToBase()
})

watch(
  () => route.params.slug,
  async () => {
    cart.setContext(slug.value)
    await ensureStoreData()
    applyThemeForSlug()
    await loadNotifications()
  }
)

const handleLogout = () => {
  showMobileNav.value = false
  auth.logout()
}

watch(
  () => route.fullPath,
  () => {
    showMobileNav.value = false
    showNotifications.value = false
    showGeneralMenu.value = false
  }
)
</script>
