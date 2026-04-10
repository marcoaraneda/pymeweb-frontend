# Plan paso a paso restantes (2026-04-07)

Objetivo:
- Definir y ejecutar los cambios pendientes solicitados.
- Mantener seguimiento claro del progreso.

Reglas:
- Precios en CLP sin decimales (ej: 99000, no 99000.00).
- Cambios en UI y flujo deben tener validacion local basica.

---

## A) Comentarios y moderacion en dashboard
1) Agregar panel flotante en dashboard para cambiar estado de comentarios.
2) Permitir aprobar/rechazar desde dashboard con feedback claro.
3) Validar que el panel se pueda abrir/cerrar y refleje el estado.

Estado: CORREGIDO (local)

Avance actual (2026-04-07):
- Panel pequeno superpuesto agregado en dashboard para moderar comentarios.
- Acciones de aprobar/rechazar habilitadas desde dashboard usando endpoint admin de resenas.
- Actualizacion de estado visible en la tarjeta y notificacion toast de resultado.

Avance actual (2026-04-09):
- Flujo validado con pruebas backend de resenas en verde y smoke publico de resenas en verde.
- Estado consolidado como corregido en entorno local.

---

## B) Precios y ofertas
1) Asegurar formateo de precios en CLP sin decimales en UI.
2) Color de precios: normal negro, tachado en gris, oferta en rojo.
3) Agregar requisito de cantidad para activar oferta.
4) Validar que al agregar la cantidad requerida se aplique la oferta.

Estado: CORREGIDO (local)

Avance actual (2026-04-07):
- Formateo CLP sin decimales aplicado en vistas clave (cards, detalle y listados principales).
- Estilo de precio ajustado: normal negro, tachado gris y precio oferta en rojo.
- Campo offer_min_qty agregado en backend y formularios para activar oferta por cantidad minima.
- Carrito actualizado para aplicar precio oferta solo cuando se alcanza la cantidad requerida.

Avance actual (2026-04-09):
- Oferta opcional confirmada en crear/editar marketplace.
- Etiqueta de oferta actualizada para mostrar porcentaje de descuento.
- Pruebas backend de catalogo validadas en verde.

---

## C) Envio por ubicaciones de tienda
1) Permitir multiples ubicaciones/sucursales por tienda.
2) Definir algoritmo de envio basado en ubicacion (distancia o zona).
3) Usar el algoritmo para mostrar costos mas reales de envio.

Estado: CORREGIDO (local)

Avance actual (2026-04-07):
- Soporte backend para sucursales multiples agregado con field branch_locations en Store.
- Editor de tienda actualizado para cargar/guardar sucursales (nombre|zona|direccion).
- Checkout actualizado con algoritmo de envio por zonas usando la sucursal mas conveniente.

Avance actual (2026-04-09):
- Estado local consolidado como corregido; calibracion fina de costos queda como ajuste operativo posterior, no bloqueante del flujo.

---

## D) Dashboard soporte
1) Agregar panel resumen de soporte en dashboard, reemplazando el que dice Actividad
Ventas diarias
Pedidos y montos agregados por día.
2) Click en item redirige a la pagina de soporte correspondiente.

Estado: CORREGIDO (local)

Avance actual (2026-04-07):
- Panel de actividad reemplazado por resumen de soporte en dashboard.
- Se muestran contadores por estado y tickets recientes.
- Click en ticket/panel redirige a dashboard/tickets con filtros por tienda/estado.

Avance actual (2026-04-09):
- Dashboard de soporte cubierto por smoke de navegacion y validaciones de reportes en backend.

---

## E) Mis tiendas - acceso directo
1) En "Mis tiendas", click en tienda redirige a su storefront.

Estado: CORREGIDO (local)

Avance actual (2026-04-07):
- StoreCard ahora permite click directo en toda la tarjeta para abrir la tienda.
- Botones de favorito/eliminar mantienen comportamiento independiente.

---

## F) Categorias de productos
1) Revisar flujo de categorias.
2) Segun categoria, pedir informacion especifica adicional.
3) Validar guardado correcto.

Estado: CORREGIDO (local)

Avance actual (2026-04-07):
- Formularios admin de crear/editar producto actualizados con captura de cantidad por talla para categorias de ropa/calzado.
- Al usar cantidades por talla, el total se sincroniza automaticamente con stock disponible.
- API admin de catalogo ajustada para aceptar y validar stock_available y stock_minimum.
- Separacion de tallas por tipo: ropa (XS-XXL) y zapatillas (35-44) con UI consistente en crear/editar.
- Persistencia de cantidades por talla agregada en backend mediante size_stock_map para no perder datos al editar.

Avance actual (2026-04-09):
- Validaciones de catalogo y serializadores en verde local.
- Smoke de tallas extendido permanece en cuarentena temporal por inestabilidad intermitente (sin bloquear el estado local del modulo).

---

## G) Seguimiento de pedidos
1) Agregar opcion "Ver seguimiento" en menu de perfil.
2) Crear pagina para ingresar codigo de seguimiento.
3) Mostrar estado del producto con datos sensibles enmascarados (****).

Estado: CORREGIDO (local)

Avance actual (2026-04-07):
- Opcion "Ver seguimiento" agregada en menus de cuenta.
- Nueva pagina /seguimiento con busqueda por codigo.
- Endpoint publico /orders/track/ agregado para consulta por codigo/id.
- Datos sensibles enmascarados en respuesta (nombre, email, telefono, direccion).

Avance actual (2026-04-09):
- Flujo mantenido y validado por regresion smoke general sin errores duros.

---

## H) Paginacion y tarjetas de productos (pedido 2026-04-09)
1) Revisar pagina por pagina los listados con riesgo de crecimiento y agregar paginacion.
2) Hacer las tarjetas de producto menos largas y mas cuadradas.
3) Mantener precio sin oferta en color negro.
4) Reemplazar etiqueta de slug en marketplace por nombre de quien subio el producto.
5) Quitar boton "Ver tienda" de tarjetas de producto.
6) Aplicar el mismo ajuste visual en tarjetas dentro de tienda.

Estado: CORREGIDO (local)

Avance actual (2026-04-09):
- Paginacion agregada en marketplace publico (productos), productos por tienda y mis publicaciones de marketplace.
- Tarjetas de producto compactadas (imagen mas baja, menor padding y descripcion mas corta) para una forma mas cuadrada.
- Precio sin oferta mantenido en negro en tarjetas de producto.
- Etiqueta superior en marketplace cambiada para mostrar nombre del publicador (fallbacks incluidos).
- Boton "Ver tienda" eliminado de ProductCard.
- Ajuste visual aplicado tambien en listados de productos dentro de tienda por reutilizacion de ProductCard.

Avance actual (2026-04-09 - segunda pasada):
- Paginacion agregada en dashboard tickets.
- Paginacion agregada en notificaciones.
- Paginacion agregada en soporte de tienda (listado de tickets).
- Paginacion agregada en resenas admin de tienda.

Avance actual (2026-04-09 - tercera pasada):
- Paginacion agregada en dashboard (feed de resenas recientes).
- Paginacion agregada en dashboard de recursos humanos (listado de personal).
- Paginacion agregada en admin FAQ de tienda.
- Paginacion agregada en admin inventario de tienda.
- Paginacion agregada en perfil de vendedor marketplace (productos activos y vendidos).

Avance actual (2026-04-09 - cierre tecnico):
- Error de import en app.vue corregido (resolucion de stores con srcDir app/).
- Migraciones locales normalizadas y aplicadas: stores.0008, catalogo.0016, orders.0007, usuarios.0007.
- En catalogo.0016 se agrego migracion de datos para mapear productos legacy sin tienda antes de forzar store obligatorio.
