# Seguimiento por Tipo de Tienda

Fecha: 2026-04-12

## Objetivo

- Terminar primero la vertical de comida rapida.
- Mantener retail con su logica propia de productos generales.
- Dejar farmacia para la siguiente fase, con su propio comportamiento por pagina.
- Tener un documento vivo para saber en que paso vamos.

## Regla de separacion

- `fast_food` usa combos, agregados, menu rapido, WhatsApp y flujo de pedido rapido.
- `retail` mantiene la logica clasica de catalogo, filtros, ofertas y stock general.
- `pharmacy` se trabaja despues, con categorias, stock y experiencia propia de farmacia.

## Estado actual

### Comida rapida

Estado: CERRADO

Ya hecho:
- Categoria `Agregados` creada para fast food.
- Alta de productos en fast food con categoria por defecto `Agregados`.
- Carrito preparado para guardar agregados y resumen del combo.
- Pagina de productos de fast food con constructor de combo y agregados visibles.
- Editor de tienda simplificado a General, Diseno y Contacto.
- Menu cargable como imagenes o PDF.
- Cobro de envio oculto en el editor y forzado a despacho en el guardado.

Pendiente por cerrar:
- Sin pendientes criticos en esta fase.

## Plan paso a paso: comida rapida

### Paso 1. Tienda principal
- [x] Mantener hero, menu, WhatsApp y catalogo.
- [x] Reducir el editor a General, Diseno y Contacto.
- [x] Mover redes sociales a Contacto.
- [x] Agregar menu en Diseno.
- [x] Quitar controles visibles de cobro de envio.

### Paso 2. Productos
- [x] Agrupar productos por secciones de fast food.
- [x] Agregar constructor de combo.
- [x] Mostrar categoria `Agregados` como extras.
- [x] Ajustar la copia y etiquetas finales de la experiencia visual.

### Paso 3. Alta de productos
- [x] Crear producto con categoria `Agregados` por defecto en fast food.
- [x] Repetir la misma regla en el alta admin.
- [x] Validar que no afecte tiendas retail.

### Paso 4. Carrito
- [x] Guardar agregados dentro del item del carrito.
- [x] Mostrar resumen de opciones del combo.
- [x] Revisar visualmente el total final con varios agregados.

### Paso 5. Checkout
- [x] Mostrar retiro o delivery segun corresponda.
- [x] Mantener WhatsApp visible como alternativa rapida.
- [x] Forzar envio al despacho en la tienda fast food.
- [x] Validar el texto final del checkout para comida rapida.

### Paso 6. Confirmacion y seguimiento
- [x] Mostrar detalle final del combo.
- [x] Confirmar que el pedido refleje agregados y extras.
- [x] Revisar seguimiento del pedido con el nuevo detalle.

### Paso 7. Admin de pagos de tienda
- [x] Cerrar la pantalla de cuenta receptora por tienda.
- [ ] Confirmar estado de verificacion.
- [x] Dejar el flujo listo para la siguiente vertical.

## Orden de trabajo por pagina

### Fast food
1. `app/pages/store/[slug]/index.vue`
2. `app/pages/store/[slug]/productos/index.vue`
3. `app/pages/store/[slug]/productos/crear.vue`
4. `app/pages/store/[slug]/admin/productos/nuevo.vue`
5. `app/stores/cart.ts`
6. `app/pages/store/[slug]/checkout/index.vue`
7. `app/pages/store/[slug]/carrito/index.vue`
8. `app/pages/store/[slug]/success/index.vue`

### Retail
- Estado: CERRADO
- Se valido que mantiene logica de catalogo y no hereda combo builder.
- Se verifico endpoint de productos retail con datos activos.
- Nota: durante smoke visual hubo inestabilidad intermitente de sesion en el navegador, sin evidencia de regresion de codigo.

### Farmacia
- Estado: CERRADO
- Se habilito tienda de prueba `farmacia-demo-qa` con producto de validacion.
- Smoke ampliado validado en productos, carrito y checkout con stock normal, bajo y sin stock.
- Documento activo: `docs/plan-vertical-farmacia.md`.

## Criterio para pasar a la siguiente vertical

- Comida rapida queda cerrada cuando:
  - La tienda publica se ve bien.
  - El combo builder funciona con agregados.
  - El carrito muestra el resumen correcto.
  - Checkout y confirmacion no rompen el flujo.
  - Las paginas de alta usan `Agregados` solo en `fast_food`.

## Siguiente paso recomendado

- Terminar la validacion visual de comida rapida.
- Luego cerrar retail como vertical independiente.
- Después crear el documento de farmacia y empezar pagina por pagina.
