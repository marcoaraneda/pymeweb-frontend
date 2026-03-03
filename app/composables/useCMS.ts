import { useRuntimeConfig } from "nuxt/app";
import { useAuthStore } from "~/stores/auth";
import { useTenantStore } from "~/stores/tenant";

export const useCMS = () => {
  const config = useRuntimeConfig();
  const auth = useAuthStore();
  const tenant = useTenantStore();

  const getSections = async () => {
    if (!tenant.slug) throw new Error("Tienda no definida");
    try {
      return await $fetch(`${config.public.apiBase}/cms/sections/`, {
        params: { store_slug: tenant.slug }
      });
    } catch (error) {
      throw new Error("No se pudieron cargar las secciones.");
    }
  };

  const updateSectionStatus = async (sectionId: number, isEnabled: boolean) => {
    if (!tenant.slug) throw new Error("Tienda no definida");
    const doPatch = async (token: string) =>
      $fetch(`${config.public.apiBase}/cms/sections/${sectionId}/`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: { enabled: isEnabled }
      });

    try {
      if (!auth.token) throw new Error("No autenticado");
      return await doPatch(auth.token);
    } catch (error) {
      const code = (error as any)?.response?._data?.code;
      if (code === 'token_not_valid' && auth.refreshToken) {
        const refreshed = await auth.refreshTokens();
        if (refreshed) return doPatch(refreshed);
      }
      throw new Error("Error al actualizar la sección.");
    }
  };

  return { getSections, updateSectionStatus };
};