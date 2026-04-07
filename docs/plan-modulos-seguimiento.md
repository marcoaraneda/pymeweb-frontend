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
Estado: PENDIENTE

Pasos:
1. Verificar creacion orden por tienda y marketplace.
2. Confirmar coherencia de totales (precio base vs oferta).
3. Validar fallback de Webpay y boleta final.
4. Revisar tracking y estados de orden.
5. Agregar cobertura automatizada minima.

Checklist:
- [ ] Totales consistentes.
- [ ] Pago/fallback robusto.
- [ ] Boleta correcta.

---

## 7) Dashboard / Reportes
Estado: PENDIENTE

Pasos:
1. Validar acceso por roles (overview/hr/finance/analytics).
2. Verificar datos reales por tienda.
3. Corregir cargas fallidas y estados vacios.
4. Revisar exportaciones.
5. Agregar smoke de navegacion.

Checklist:
- [ ] Roles correctos.
- [ ] Datos correctos.
- [ ] Exportacion funcional.

---

## 8) Soporte / FAQ / Notificaciones
Estado: PENDIENTE

Pasos:
1. Verificar alta y visualizacion de tickets/preguntas.
2. Revisar flujo de respuestas.
3. Validar contador y lectura de notificaciones.
4. Corregir errores de sincronizacion.

Checklist:
- [ ] Soporte estable.
- [ ] FAQ operativo.
- [ ] Notificaciones consistentes.

---

## Proximo foco activo
- Modulo actual: Catalogo / Productos.
- Criterio para marcar CORREGIDO:
  1. Funciona en UI.
  2. Sin errores criticos en consola/API.
  3. Prueba local automatizada o smoke validado.
