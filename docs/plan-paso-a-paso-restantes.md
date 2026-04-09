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

Estado: EN PROGRESO

Avance actual (2026-04-07):
- Panel pequeno superpuesto agregado en dashboard para moderar comentarios.
- Acciones de aprobar/rechazar habilitadas desde dashboard usando endpoint admin de resenas.
- Actualizacion de estado visible en la tarjeta y notificacion toast de resultado.
- Pendiente validacion funcional final en UI real con datos de resenas.

---

## B) Precios y ofertas
1) Asegurar formateo de precios en CLP sin decimales en UI.
2) Color de precios: normal negro, tachado en gris, oferta en rojo.
3) Agregar requisito de cantidad para activar oferta.
4) Validar que al agregar la cantidad requerida se aplique la oferta.

Estado: EN PROGRESO

Avance actual (2026-04-07):
- Formateo CLP sin decimales aplicado en vistas clave (cards, detalle y listados principales).
- Estilo de precio ajustado: normal negro, tachado gris y precio oferta en rojo.
- Campo offer_min_qty agregado en backend y formularios para activar oferta por cantidad minima.
- Carrito actualizado para aplicar precio oferta solo cuando se alcanza la cantidad requerida.
- Pendiente: validacion funcional completa de todos los flujos de carrito/checkout en UI real.

---

## C) Envio por ubicaciones de tienda
1) Permitir multiples ubicaciones/sucursales por tienda.
2) Definir algoritmo de envio basado en ubicacion (distancia o zona).
3) Usar el algoritmo para mostrar costos mas reales de envio.

Estado: EN PROGRESO

Avance actual (2026-04-07):
- Soporte backend para sucursales multiples agregado con field branch_locations en Store.
- Editor de tienda actualizado para cargar/guardar sucursales (nombre|zona|direccion).
- Checkout actualizado con algoritmo de envio por zonas usando la sucursal mas conveniente.
- Pendiente: calibrar valores de costo por zona con datos reales de operacion.

---

## D) Dashboard soporte
1) Agregar panel resumen de soporte en dashboard, reemplazando el que dice Actividad
Ventas diarias
Pedidos y montos agregados por día.
2) Click en item redirige a la pagina de soporte correspondiente.

Estado: EN PROGRESO

Avance actual (2026-04-07):
- Panel de actividad reemplazado por resumen de soporte en dashboard.
- Se muestran contadores por estado y tickets recientes.
- Click en ticket/panel redirige a dashboard/tickets con filtros por tienda/estado.

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

Estado: EN PROGRESO

Avance actual (2026-04-07):
- Formularios admin de crear/editar producto actualizados con captura de cantidad por talla para categorias de ropa/calzado.
- Al usar cantidades por talla, el total se sincroniza automaticamente con stock disponible.
- API admin de catalogo ajustada para aceptar y validar stock_available y stock_minimum.
- Separacion de tallas por tipo: ropa (XS-XXL) y zapatillas (35-44) con UI consistente en crear/editar.
- Persistencia de cantidades por talla agregada en backend mediante size_stock_map para no perder datos al editar.
- Pendiente: validar flujo completo en UI con categorias reales y datos de inventario por variante.

---

## G) Seguimiento de pedidos
1) Agregar opcion "Ver seguimiento" en menu de perfil.
2) Crear pagina para ingresar codigo de seguimiento.
3) Mostrar estado del producto con datos sensibles enmascarados (****).

Estado: EN PROGRESO

Avance actual (2026-04-07):
- Opcion "Ver seguimiento" agregada en menus de cuenta.
- Nueva pagina /seguimiento con busqueda por codigo.
- Endpoint publico /orders/track/ agregado para consulta por codigo/id.
- Datos sensibles enmascarados en respuesta (nombre, email, telefono, direccion).
- Pendiente: validar extremo a extremo con pedidos reales y codigos de tracking en entorno local.
