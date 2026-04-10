# Plan Home + Marketplace (2026-04-09)

Objetivo:
- Ejecutar el rediseño solicitado de Home/Marketplace y cerrar ajustes de flujo visual/comercial.
- Mantener trazabilidad para no perder avances.

Regla funcional clave:
- El icono + del carrusel de Vista rapida solo debe verse para quien administra la tienda.

---

## Etapa 1 - Home y Navegacion Principal

### 1) Permisos del icono + en Vista rapida
1. Verificar que + solo se renderiza para admin/owner/manager de la tienda actual.
2. Validar con usuario dueno y con usuario visitante.

Estado: CORREGIDO (local)

### 2) Hero principal tipo tutorial/presentacion Pymeweb
1. Quitar bloque inicial actual: "Panel principal / Marketplace / Tiendas / Acceder / Crear cuenta".
2. Reemplazar por hero comercial con:
- Presentacion de Pymeweb.
- Mini tutorial de 3 pasos (crear tienda, publicar, vender).
- CTA principal crear tienda.
- CTA secundaria ver tiendas.

Estado: CORREGIDO (local)

### 3) Crear tienda desde Home como formulario completo en overlay
1. El boton de crear tienda debe abrir modal encima de Home.
2. El modal usa formulario completo de tienda (no mini form).
3. Al crear: feedback de exito/error y redireccion clara.

Estado: CORREGIDO (local)

### 4) Simplificar secciones de tiendas
1. Eliminar "Mis tiendas" y su mini formulario.
2. Mantener solo "Todas las tiendas" con mejor presentacion visual.
3. Dejar CTA de crear tienda en hero/dashboard.

Estado: CORREGIDO (local)

### 5) Menu principal consistente
1. Agregar boton "Inicio" en layout principal.
2. Asegurar que tambien aparece estando en Marketplace.

Estado: CORREGIDO (local)

### 6) Redisenar "Ultimas novedades"
1. Mejorar composicion visual (jerarquia, contraste, cards mas llamativas).
2. Mantener foco en conversion (producto + accion).

Estado: CORREGIDO (local)

Checklist cierre Etapa 1:
- [x] Home sin bloque "Panel principal".
- [x] Hero nuevo Pymeweb tutorial.
- [x] Crear tienda abre formulario completo en modal.
- [x] Seccion "Mis tiendas" eliminada.
- [x] Solo "Todas las tiendas" mejorada.
- [x] Boton "Inicio" visible en menu y marketplace.
- [x] "Ultimas novedades" redisenada.

---

## Etapa 2 - Marketplace, Tarjetas y Conversion

### 1) Paginacion productos marketplace (bloque inferior)
1. Agregar paginacion completa en listado inferior.
2. Mantener estado de filtros/orden al paginar.

Estado: CORREGIDO (local)

### 2) Badge de oferta en tarjetas
1. Mostrar solo porcentaje de descuento (ej: 21%).
2. No mostrar prefijos tipo "Oferta-21%".

Estado: CORREGIDO (local)

### 3) Autor/publicador en tarjetas marketplace
1. Mostrar nombre del publicador en tono gris.
2. Mantener legibilidad en desktop y mobile.

Estado: CORREGIDO (local)

### 4) Consistencia visual de tarjetas marketplace
1. Homologar espaciados, badges y jerarquia tipografica.
2. Mantener identidad visual de Pymeweb en todo el bloque.

Estado: CORREGIDO (local)

### 5) Ajuste flujo Destacados de la semana (tienda)
1. Confirmar que el guardado de destacado usa endpoint correcto.
2. Confirmar visualizacion en home de tienda al marcar producto.

Estado: CORREGIDO (local)

Nota de estado actual (2026-04-09):
- Endpoint de update de producto corregido para evitar 404 al marcar destacado.
- Filtro de destacados en home de tienda ajustado para considerar product_of_week e is_featured.

Checklist cierre Etapa 2:
- [x] Paginacion marketplace operativa.
- [x] Badge muestra solo porcentaje.
- [x] Publicador en gris.
- [x] Tarjetas marketplace unificadas visualmente.
- [x] Flujo destacados validado en UI real.

---

## Validacion final recomendada
1. Navegacion Home -> Marketplace -> Tienda -> Inicio.
2. Crear tienda desde hero con modal completo.
3. Verificar visibilidad del + (dueno vs visitante).
4. Verificar paginacion marketplace en desktop/mobile.
5. Verificar descuentos y publicador en tarjetas.

---

## Etapa 3 - Ajustes finales de detalle y compactacion (2026-04-10)

### Plan paso a paso
1. Unificar el detalle de producto marketplace al estilo visual del detalle de producto en tienda.
2. Compactar tarjetas: ocultar descripcion en Home principal y listados de marketplace.
3. Estandarizar CTA de carrito en tarjetas: texto "Agregar" + icono de carrito.
4. Si la tarjeta es de mi publicacion: mostrar "Tu publicación" y ocultar nombre de publicador.
5. Mejorar impacto visual de la pagina Ver tiendas con bloques destacados.

Estado: CORREGIDO (local)

Resultado implementado:
- Detalle marketplace redisenado a una estructura visual similar al detalle de tienda.
- Tarjetas marketplace/home compactadas sin descripcion.
- Boton de tarjetas actualizado a "Agregar" con icono.
- Regla de mi publicacion aplicada en tarjetas.
- Seccion Ver tiendas reforzada con bloques visuales llamativos.

### Ajuste adicional (2026-04-10 - marketplace edicion y tallas)
1. Corregir flujo para que "Editar mi publicación" en detalle marketplace abra la edición directamente.
2. Extender cantidad por talla en marketplace para categorías: calzado, poleron y pantalon.
3. Mostrar imagen en cada producto del bloque preview superior de marketplace.

Estado: CORREGIDO (local)

Resultado implementado:
- "Editar mi publicación" ahora habilita edición directa en detalle marketplace.
- Crear publicación en marketplace soporta stock por talla para calzado/poleron/pantalon con suma automática de stock.
- Editar publicación en detalle marketplace también soporta stock por talla para calzado/poleron/pantalon.
- Preview superior de marketplace ahora renderiza imagen por producto.

---

## Bloque unico de validaciones pendientes (ejecutar de una sola vez)

1. Edicion de imagen en detalle marketplace:
- [ ] Subir imagen nueva por archivo y guardar.
- [x] Confirmar cambio inmediato en detalle tras guardar.
- [x] Volver a abrir la URL del producto y confirmar persistencia.

2. Tallas y stock por categoria en marketplace:
- [x] Crear publicacion en calzado con `size_stock_map` y validar suma automatica de stock.
- [x] Crear publicacion en poleron con tallas textiles y validar suma automatica.
- [x] Crear publicacion en pantalon con tallas textiles y validar suma automatica.
- [x] Editar cada una y confirmar persistencia de tallas.

3. Home - Ultimas novedades aleatorias:
- [x] Confirmar que los productos se muestran en orden aleatorio al cargar.
- [x] Confirmar que el producto principal (card grande) rota cada ~6 segundos.

4. Marketplace principal:
- [x] Verificar alineacion de `Buscar producto` con filtros en desktop.
- [ ] Verificar comportamiento correcto en mobile.

5. Animacion de apertura de paginas:
- [x] Confirmar transicion al navegar entre Inicio, Marketplace, Tiendas y detalle de producto.
- [x] Validar que respeta `prefers-reduced-motion`.

Notas de validacion (2026-04-10):
- Se corrigio persistencia de imagen en marketplace detalle con soporte backend para `image_url` directo en `Product`.
- Se aplico migracion local: `catalogo.0017_product_image_url`.
- Para ejecutar validacion de tallas por categoria se crearon categorias marketplace faltantes en entorno local: Calzado, Poleron y Pantalon.
- Se ejecuto validacion E2E de tallas sobre productos `e2e-calzado-1775785747666`, `e2e-poleron-1775785762210` y `e2e-pantalon-1775785777802`, con persistencia confirmada tras recarga.
- Validacion runtime mobile de alineacion sigue pendiente por limitacion de viewport en navegador integrado de esta sesion (no cambia a ancho movil real); requiere pasada manual en dispositivo/emulacion externa.

---

## Etapa 4 - Dashboard util con graficos reales (2026-04-10)

### Objetivo
1. Activar graficos funcionales en Dashboard usando datos reales de APIs (sin datos mock).
2. Completar el bloque junto a "Resumen de tickets" con un panel operativo util.

### Implementacion aplicada
1. Dashboard modo tienda:
- Grafico de ingresos por dia (usa `dailyStats` desde `/admin/reportes/orders/daily/`).
- Grafico de distribucion de estados de pedidos (usa `orders` desde `/api/orders/`).
- Nuevo panel "Pulso operativo" al lado de tickets:
	- ventas 7d,
	- ingresos 7d,
	- pendientes,
	- conversion,
	- mejor dia,
	- ticket estimado.

2. Dashboard modo marketplace:
- Grafico de distribucion de estados de publicaciones (usa `/api/marketplace/submissions/`).
- Grafico de publicaciones de ultimos 7 dias (creado desde `created_at/updated_at` reales).

3. Soporte visual:
- Selects de filtros/estado con contraste corregido (texto oscuro + fondo blanco).

### Checklist Etapa 4
- [x] Grafico ingresos por dia (tienda) con datos reales.
- [x] Grafico estados de pedidos (tienda) con datos reales.
- [x] Nuevo panel util junto a "Resumen de tickets".
- [x] Grafico estados de publicaciones (marketplace) con datos reales.
- [x] Grafico actividad 7 dias (marketplace) con datos reales.
- [x] Colores de filtros/estados legibles en dashboard.

### Nota de verificacion
- Cambios compilados sin errores de archivo (`dashboard.vue` limpio en Problems).
- Validacion visual completa depende de sesion autenticada activa en navegador para recorrer ambos contextos (tienda y marketplace) sin redireccion a login.
