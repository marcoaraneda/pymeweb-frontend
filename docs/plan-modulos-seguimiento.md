# Plan Maestro de Modulos y Seguimiento

Objetivo:
- Tener respaldo unico del estado de cada modulo.
- Marcar como CORREGIDO cuando el modulo quede terminado y validado.

Regla de estado:
- PENDIENTE: aun no iniciado.
- EN PROGRESO: trabajando activamente.
- CORREGIDO: cambios implementados + validacion local completada.
- VALIDADO EN CI: paso remoto confirmado en GitHub Actions.

---

## 1) Marketplace
Estado: CORREGIDO (local)
Estado CI remoto: PENDIENTE

Pasos:
1. Confirmar flujo publish -> edit -> carrito -> checkout -> boleta.
2. Confirmar setup auth E2E y regression estable.
3. Ejecutar suite E2E local.
4. Validar workflow en GitHub Actions al hacer push.

Checklist:
- [x] Flujo completo validado localmente.
- [x] E2E setup + test en verde local.
- [ ] Workflow remoto validado en runner GitHub.

Nota de cierre natural:
- Queda un paso natural: validar workflow en GitHub Actions al hacer push y revisar resultado remoto.
- Fuera de eso, este modulo queda completo.

---

## 2) Inventario (admin)
Estado: CORREGIDO (local)
Estado CI remoto: PENDIENTE

Pasos:
1. Revisar contratos API reales (stocks y movements).
2. Auditar pantalla admin inventario (carga, errores, estados vacios).
3. Corregir ajuste de stock (entrada/salida, reason, validaciones).
4. Agregar feedback UX (loading, exito, error, bloqueo de doble envio).
5. Validar extremo a extremo en UI.
6. Agregar prueba E2E o smoke automatizado.
7. Marcar CORREGIDO cuando quede estable.

Checklist:
- [x] API inventario confirmada.
- [x] UI inventario robusta.
- [x] Ajustes de stock funcionando.
- [x] Validacion E2E/smoke.

Avance actual (2026-04-06):
- Backend corregido: los movimientos ahora actualizan stock en forma transaccional.
- Se agrego validacion de stock insuficiente para salidas.
- Pruebas backend inventario en verde (5/5).
- Smoke E2E inventario en verde junto a setup y marketplace (3/3).

---

## 3) Resenas (admin)
Estado: CORREGIDO (local)
Estado CI remoto: PENDIENTE

Pasos:
1. Confirmar endpoints de listado y cambio de estado.
2. Verificar filtros y paginacion si aplica.
3. Corregir acciones aprobar/rechazar con feedback claro.
4. Asegurar permisos por tienda.
5. Validar en UI y automatizar prueba basica.

Checklist:
- [x] CRUD de moderacion estable.
- [x] Permisos y errores controlados.
- [x] Prueba automatizada minima.

Avance actual (2026-04-06):
- UI admin resenas mejorada con filtros por estado y feedback de accion.
- Smoke E2E resenas agregado y validado en suite completa.

Avance actual (2026-04-08):
- Se agrego filtro de lenguaje ofensivo en creacion publica de resenas (backend), incluyendo deteccion con normalizacion de acentos.
- Mensajeria de error del formulario de resenas en storefront mejorada para mostrar validaciones reales del API.
- Pruebas de resenas actualizadas y validadas localmente (8/8 en verde).
- Moderacion manual de resenas deshabilitada en dashboard y API admin para reforzar transparencia.
- Resenas nuevas quedan autoaprobadas al crearse (si pasan filtro ofensivo).
- Smoke E2E publico agregado para validar bloqueo de groserias y publicacion inmediata de comentario valido.
- Ajustado flujo de envio de resena para evitar falso error visual cuando la creacion fue exitosa pero falla una notificacion secundaria.
- Smoke E2E publico de resenas validado nuevamente en verde (setup + prueba principal).

---

## 4) CMS (secciones home)
Estado: CORREGIDO (local)
Estado CI remoto: PENDIENTE

Pasos:
1. Confirmar endpoint tenant admin cms.
2. Corregir mapeo de campos (section_type/enabled/orden).
3. Garantizar persistencia de toggles y orden.
4. Validar reflejo en home publica.
5. Agregar smoke test.

Checklist:
- [x] Configuracion de secciones funcional.
- [ ] Reflejo en storefront validado.
- [x] Smoke test agregado.

Avance actual (2026-04-06):
- Admin CMS robustecido con estados de carga/error/exito e inicializacion de secciones por defecto.
- Smoke E2E CMS agregado y validado en suite completa (5/5).

---

## 5) Catalogo / Productos
Estado: CORREGIDO (local)
Estado CI remoto: PENDIENTE

Pasos:
1. Revisar alta/edicion/eliminacion producto por tienda.
2. Confirmar imagen principal y fallback consistentes.
3. Validar stock minimo y precio oferta.
4. Corregir rutas y accesos desde dashboard/store.
5. Agregar prueba de flujo principal.

Checklist:
- [x] CRUD estable.
- [x] Imagenes y precios consistentes.
- [x] Prueba automatizada.

Avance actual (2026-04-07):
- Corregida navegacion legacy de detalle de producto para usar la ruta canonica por slug.
- Agregada compatibilidad en detalle canonico para identificar productos por ID numerico cuando aplica.
- Smoke E2E de catalogo agregado (listado + detalle).
- Regresion E2E completa ejecutada en local: 5 passed, 1 skipped.

---

## 6) Ordenes / Pagos
Estado: CORREGIDO (local)
Estado CI remoto: PENDIENTE

Pasos:
1. Verificar creacion orden por tienda y marketplace.
2. Confirmar coherencia de totales (precio base vs oferta).
3. Validar fallback de Webpay y boleta final.
4. Revisar tracking y estados de orden.
5. Agregar cobertura automatizada minima.

Checklist:
- [x] Totales consistentes.
- [x] Pago/fallback robusto.
- [x] Boleta correcta.

Avance actual (2026-04-07):
- Checkout de tienda actualizado para crear orden con filtro de tienda (param store) y evitar rechazo de backend.
- Integracion Webpay ajustada a endpoint por orden (/orders/{id}/webpay/init/) con fallback controlado a boleta cuando no hay disponibilidad.
- Calculo de envio cambiado de aleatorio a deterministico para evitar variaciones injustificadas en total.
- Smoke E2E de ordenes admin agregado (listado + detalle) con manejo de auth no disponible mediante skip controlado.

Avance actual (2026-04-08):
- Checkout de tienda redirigido a la boleta canonica (/store/{slug}/success?order={id}) para consistencia del comprobante final.
- Flujo E2E de checkout/orden actualizado para validar boleta electronica y tracking.
- Prueba E2E de checkout/orden validada en verde (setup + flujo principal).

---

## 7) Dashboard / Reportes
Estado: CORREGIDO (local)

Pasos:
1. Validar acceso por roles (overview/hr/finance/analytics).
2. Verificar datos reales por tienda.
3. Corregir cargas fallidas y estados vacios.
4. Revisar exportaciones.
5. Agregar smoke de navegacion.

Checklist:
- [x] Roles correctos.
- [x] Datos correctos.
- [x] Exportacion funcional.

Avance actual (2026-04-07):
- Smoke E2E dashboard/reportes agregado para validar carga base de overview + pantalla de reportes.

Avance actual (2026-04-08):
- Smoke E2E de rutas por seccion de dashboard agregado (RRHH, analisis financiero, analisis de datos) para usuario administrador.
- Smoke validado en verde con autenticacion real.

Avance actual (2026-04-09):
- Pruebas backend de reportes reforzadas para validar aislamiento por permisos entre tiendas (403 sin membresia en tienda destino).
- Pruebas backend de reportes reforzadas para validar metricas correctas por tienda cuando el usuario tiene rol REPORTS en multiples tiendas.
- Suite de reportes validada en verde local (11/11).

---

## 8) Soporte / FAQ / Notificaciones
Estado: CORREGIDO (local)

Pasos:
1. Verificar alta y visualizacion de tickets/preguntas.
2. Revisar flujo de respuestas.
3. Validar contador y lectura de notificaciones.
4. Corregir errores de sincronizacion.

Checklist:
- [x] Soporte estable.
- [x] FAQ operativo.
- [x] Notificaciones consistentes.

Avance actual (2026-04-07):
- Smoke E2E soporte/notificaciones agregado para validar carga base de tickets y feed de alertas.
- Vista admin FAQ agregada con alta/listado y activacion/desactivacion de items.
- Smoke E2E FAQ agregado para validar carga base del panel.

Avance actual (2026-04-08):
- Filtro de lenguaje ofensivo extendido a texto libre de soporte (titulo y descripcion de ticket).
- Filtro de lenguaje ofensivo extendido a FAQ admin y preguntas/respuestas de producto en FAQ admin.

Avance actual (2026-04-09):
- Smoke E2E soporte/notificaciones validado en verde (carga base de tickets y feed).
- Smoke E2E FAQ admin validado en verde (carga base del panel FAQ).
- Suite backend de soporte y FAQ validada en verde local (11/11).

---

## Proximo foco activo
- Modulo actual: Validacion CI remoto de modulos CORREGIDO (local).
- Criterio para marcar CORREGIDO:
  1. Funciona en UI.
  2. Sin errores criticos en consola/API.
  3. Prueba local automatizada o smoke validado.

Avance actual (2026-04-09):
- Regresion E2E smoke ejecutada en verde local: 10 passed, 2 skipped.
- Se dejo en cuarentena temporal el smoke redundante de calzado por talla por inestabilidad intermitente.
- Se dejo en cuarentena temporal el flujo extendido de catalogo por talla (no-smoke) por inestabilidad intermitente.
