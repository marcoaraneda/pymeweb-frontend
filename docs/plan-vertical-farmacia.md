# Plan Vertical Farmacia

Fecha inicio: 2026-04-12
Estado: CERRADO

## Objetivo

- Definir flujo propio de farmacia sin mezclar reglas de fast_food o retail.
- Priorizar categorias de salud, stock visible y compra rapida segura.

## Estado del entorno

- Tienda de prueba activa: `farmacia-demo-qa`.
- Producto de prueba activo: `vitamina-c-1000-qa`.
- Smoke validado: productos -> carrito -> checkout.

## Checklist de ejecucion

1. Datos base
- [x] Crear o habilitar al menos 1 tienda `pharmacy` activa.
- [x] Cargar categorias de farmacia (ej: Higiene, Vitaminas, Cuidado personal).
- [x] Cargar productos con stock variado para validar estados (sin stock, bajo stock, stock normal).

2. Storefront farmacia
- [x] Validar hero y textos de farmacia en `app/pages/store/[slug]/index.vue`.
- [x] Validar listado tipo farmacia en `app/pages/store/[slug]/productos/index.vue`.
- [x] Confirmar que no aparezcan botones de combo builder.

3. Carrito y checkout
- [x] Agregar productos de farmacia y validar resumen en carrito.
- [x] Validar checkout con datos de cliente y metodos de pago.
- [x] Confirmar textos y CTA alineados a farmacia.

4. Cierre
- [x] Smoke test end-to-end farmacia.
- [x] Documentar evidencias y pendientes finales.

## Nota operativa

- Seed disponible para reconstruir la vertical tras reset de base de datos: `python manage.py seed_vertical_baseline`.
