export const useImages = () => {
  const config = useRuntimeConfig()

  const imageUrl = (path?: string) => {
    if (!path) return ''

    // Si ya viene con http, no tocar
    if (path.startsWith('http')) {
      return path
    }

    // Asegurar /media/
    return `${config.public.apiBase}/media/${path}`
  }

  return { imageUrl }
}
