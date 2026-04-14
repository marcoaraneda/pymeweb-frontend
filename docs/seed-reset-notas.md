# Notas de Seed y Reset de Base de Datos

Fecha: 2026-04-12

## Objetivo

Evitar perder configuracion de verticales (tipos de tienda, categorias y productos base) al reiniciar la base de datos.

## Comando principal

Desde `backend/`:

```bash
python manage.py seed_vertical_baseline
```

## Que repone

- Tiendas base:
  - `lider` (retail)
  - `burgerking` (fast_food)
  - `pasteleria-demo-qa` (bakery)
  - `farmacia-demo-qa` (pharmacy)
- Categorias por vertical.
- Productos de prueba por vertical.
- Casos de stock para farmacia:
  - stock normal
  - stock bajo
  - sin stock

## Flujo recomendado tras reset

```bash
python manage.py migrate
python manage.py seed_vertical_baseline
```

## Nota

El comando es idempotente: se puede ejecutar varias veces y actualiza datos clave sin duplicar slugs.
