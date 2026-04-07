import { useRuntimeConfig } from "nuxt/app";
import { useAuthStore } from "~/stores/auth";
import { useTenantStore } from "~/stores/tenant";

export const useCMS = () => {
  const config = useRuntimeConfig();
  const auth = useAuthStore();
  const tenant = useTenantStore();

  const authedFetch = async <T>(url: string, options: Record<string, any> = {}) => {
    if (!auth.token) throw new Error("No autenticado");

    const doFetch = (token: string) =>
      $fetch<T>(url, {
        ...options,
        headers: { Authorization: `Bearer ${token}`, ...(options.headers || {}) },
      });

    try {
      return await doFetch(auth.token);
    } catch (error: any) {
      const code = error?.response?._data?.code;
      if (code === 'token_not_valid' && auth.refreshToken) {
        const refreshed = await auth.refreshTokens();
        if (refreshed) return doFetch(refreshed);
      }
      throw error;
    }
  };

  const getSections = async () => {
    if (!tenant.slug) throw new Error("Tienda no definida");
    try {
      return await authedFetch(`${config.public.apiBase}/store/${tenant.slug}/admin/cms/home-sections/`);
    } catch (error) {
      throw new Error("No se pudieron cargar las secciones.");
    }
  };

  const updateSectionStatus = async (sectionId: number, isEnabled: boolean) => {
    if (!tenant.slug) throw new Error("Tienda no definida");
    const doPatch = async (token: string) =>
      $fetch(`${config.public.apiBase}/store/${tenant.slug}/admin/cms/home-sections/${sectionId}/`, {
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