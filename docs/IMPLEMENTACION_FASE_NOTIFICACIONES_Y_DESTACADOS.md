# Implementacion Paso a Paso: Notificaciones, Ofertas Destacadas y Estandarizacion

## Objetivo
Dejar operativo y verificable:
- Flujo completo de notificaciones (mostrar nuevas, limpiar, marcar leidas, refresco).
- Flujo de oferta destacada por producto (palomita) y seccion superior paginada en la tienda.
- Edicion de tienda con un unico boton de guardado al final del formulario.
- Documentacion de arranque y criterios de calidad para desarrollo profesional.

## Estado Actual
- [x] Notificaciones en layouts con refresco periodico y limpieza persistente.
- [x] IDs estables para notificaciones de resumen.
- [x] Seccion de productos destacados sobre vitrina principal, con paginacion.
- [x] Titulo/subtitulo de destacados editable desde el editor rapido.
- [x] Unico boton Guardar cambios de tienda al final del formulario.
- [x] Checkbox de producto renombrado a "Oferta destacada (palomita)" en crear/editar producto.
- [x] Correccion de guardado de galeria adicional (`extra_images`) para productos en edicion admin.
- [ ] Validacion manual final con usuario duenio autenticado (crear evento nuevo y validar alerta nueva).

## Nota de QA (credenciales entregadas por usuario)
- Usuario: `marko2blea`
- Contrasena: `1234`
- Uso: ingresar para pruebas manuales de notificaciones, pedidos, perfil y dashboard.
- Fecha registro: 2026-04-13.

## Paso a Paso de Ejecucion
1. Levantar backend:
   - Ir a `backend/`.
   - Activar entorno virtual.
   - Ejecutar migraciones.
   - Iniciar servidor en `127.0.0.1:8000`.
2. Levantar frontend:
   - Ir a la raiz del proyecto `pymeweb-frontend/`.
   - Instalar dependencias de Node.
   - Iniciar Nuxt en puerto definido (por ejemplo `3001`).
3. Verificar notificaciones:
   - Iniciar sesion con cuenta con acceso a tiendas.
   - Abrir campana en layout de tienda o layout general.
   - Confirmar que llegan notificaciones desde `support/dashboard/summary`.
   - Presionar "Borrar notificaciones" y confirmar que desaparecen.
   - Esperar refresco automatico o navegar para recargar: las mismas notificaciones no deben reaparecer como nuevas si no cambiaron.
   - Crear nueva actividad (pedido/ticket/resena) y validar que aparezca como notificacion nueva.
4. Verificar centro de notificaciones:
   - Ir a `/notificaciones`.
   - Probar filtros por tipo.
   - Probar "Marcar leido" y "Limpiar".
   - Probar paginacion.
5. Verificar ofertas destacadas en tienda:
   - Entrar a crear/editar producto y activar "Oferta destacada (palomita)".
   - Guardar producto.
   - Ir a home de tienda y confirmar seccion "destacados" sobre vitrina principal.
   - Confirmar card por producto y paginacion.
   - Editar titulo/subtitulo de destacados y validar persistencia.
6. Verificar editar tienda:
   - Abrir modal "Editar tienda".
   - Confirmar que existe un solo boton de guardado al final del formulario.
   - Guardar cambios y validar mensaje de estado.

## Plan Paso a Paso de Documentacion y Cierre
1. Documentacion de codigo (frontend):
   - Confirmar comentario/estructura en store de notificaciones (`app/stores/notifications.ts`).
   - Confirmar uso de `dismissAll()` en layouts (`app/layouts/default.vue` y `app/layouts/store.vue`).
   - Confirmar seccion destacados y paginacion (`app/pages/store/[slug]/index.vue`).
2. Documentacion operativa:
   - Mantener este documento como fuente de checklist QA.
   - Mantener README con instrucciones de arranque actualizadas.
3. Cierre de QA:
   - Login con cuenta QA.
   - Limpiar notificaciones y verificar estado vacio persistente.
   - Crear evento nuevo real (pedido/ticket/resena) y verificar nueva alerta.
   - Marcar este bloque como completado al finalizar.

4. Verificacion de flujo de seguimiento (nuevo requerido):
   - Desde dashboard, hacer click en un badge/enlace de "Tracking" de un pedido.
   - Confirmar redireccion a `/seguimiento` con el codigo precargado en query (`?code=...`).
   - Confirmar que la pagina consulta automaticamente y muestra el estado del pedido.

5. Verificacion de flujo completo de tickets (nuevo requerido):
   - Crear ticket en `/store/{slug}/soporte`.
   - Confirmar que aparece en dashboard de tickets (`/dashboard/tickets`).
   - Confirmar que se refleja en resumen de soporte del dashboard principal.
   - Confirmar que el evento impacta en notificaciones cuando corresponda.

## Registro QA Ejecutado (2026-04-14)
- Seguimiento (dashboard -> seguimiento):
   - Resultado: COMPLETADO.
   - Evidencia funcional: desde dashboard de tienda `burgerking`, click en `Tracking: B8TLEUILNF` abrio `/seguimiento?code=B8TLEUILNF`.
   - En `/seguimiento` el campo se precargo y la consulta se ejecuto automaticamente mostrando estado `Pendiente`.
- Tickets + notificaciones:
   - Resultado: COMPLETADO POR API (UI AUN INESTABLE).
   - Evidencia API:
      - Login JWT correcto con cuenta QA.
      - Ticket creado en `store=lider` con titulo `QA API ticket 2026-04-13` (id creado: `1`).
      - Listado `GET /api/support/tickets/?store=lider` devuelve 1 ticket con ese titulo.
      - `GET /api/support/dashboard/summary/?store=lider` refleja `support_open=1`.
      - Resumen de notificaciones incluye tipos `ticket`, `ticket_update` y `ticket_detail`.
   - Nota UI:
      - Se mantiene inestabilidad intermitente de sesion en navegador (saltos a `/login`) durante edicion del formulario de soporte.

## Nota tecnica de bugfix (galeria de producto)
- Sintoma reportado: al agregar imagen extra en editar producto, no se reflejaba en el producto.
- Causa raiz: backend intentaba re-subir URLs de Cloudinary ya existentes en lugar de usar su `public_id`.
- Solucion aplicada:
   - Resolver `public_id` cuando la URL ya es de Cloudinary (`/upload/...`).
   - Crear `ProductImage` directo con `public_id` sin re-upload remoto.
   - Mantener fallback a `uploader.upload(...)` para URLs externas.
- Archivos actualizados:
   - `backend/apps/catalogo/serializers_admin.py`
   - `backend/apps/catalogo/serializers.py`
   - `app/pages/store/[slug]/admin/productos/[product_slug]/editar.vue` (mensaje de error legible)

## Criterios de Aceptacion
- Limpiar notificaciones funciona y no reabre las mismas como nuevas inmediatamente.
- Las notificaciones nuevas si aparecen cuando cambia el estado operativo.
- La seccion destacada aparece antes de la vitrina principal.
- Solo productos con palomita `is_featured` se muestran en la seccion destacada.
- El boton de guardar en editar tienda no esta duplicado.

## Estandares de Codigo Aplicados
- Persistencia de estado de lectura en Pinia + localStorage.
- IDs de notificacion estables para evitar falsos "nuevos".
- UI con secciones separadas y paginacion consistente.
- Mensajes de estado en formularios para feedback de usuario.
- Cambios de plantilla sin romper estructura de componentes Vue.

## Siguiente Iteracion Recomendada
1. Agregar endpoint backend para marcar/limpiar notificaciones en servidor (estado compartido entre dispositivos).
2. Agregar tests automatizados de notificaciones (store + layout).
3. Agregar E2E de flujo destacado y guardado de tienda.
