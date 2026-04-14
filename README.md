# Pymeweb – Frontend Nuxt + Backend Django

Proyecto full-stack con Nuxt 4 (frontend) y Django 6 + DRF (backend). La API sirve los datos de tiendas, productos y soporte; el frontend consume `apiBase` (por defecto `http://127.0.0.1:8000/api`).

## Estructura
- `app/` Nuxt (páginas, layouts, componentes, stores Pinia).
- `backend/` Proyecto Django.
- `requirements.txt` Dependencias Python (mismas que `backend/requirements.txt`).
- `package.json` Scripts y dependencias de frontend.

## Requisitos previos
- Node.js 18+ y npm.
- Python 3.11+ (compatible con Django 6).
- PostgreSQL si usas base de datos externa (o SQLite por defecto si está configurado así).

## Variables de entorno
- Frontend: `API_BASE` (opcional). Si no se define, usa `http://127.0.0.1:8000/api`.
- Backend (coloca en `backend/.env`):
	- `SECRET_KEY` (obligatorio en producción).
	- `DEBUG` (`True`/`False`).
	- `DATABASE_URL` (si usas Postgres) o variables de conexión equivalentes.
	- Email SMTP si quieres enviar códigos reales: `EMAIL_BACKEND`, `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `EMAIL_USE_TLS`, `EMAIL_USE_SSL`, `DEFAULT_FROM_EMAIL`.
	- Cloudinary/Transbank si se usan: `CLOUDINARY_URL`, credenciales Transbank, etc.
	- CORS/hosts: añade tu host en `ALLOWED_HOSTS` y `CORS_ALLOWED_ORIGINS`.

## Instalación
### Backend
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate            # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver          # http://127.0.0.1:8000
```

### Frontend
```bash
npm install
# (opcional) API_BASE=http://127.0.0.1:8000/api
npm run dev -- --host 0.0.0.0 --port 3001
```

## Arranque rápido (2 terminales)
1. Terminal 1 (backend):
```bash
cd backend
.venv\Scripts\activate
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```
2. Terminal 2 (frontend):
```bash
cd .
npm install
npm run dev -- --host 0.0.0.0 --port 3001
```
3. Abrir:
- Frontend: `http://127.0.0.1:3001`
- API base: `http://127.0.0.1:8000/api`

## Scripts útiles (frontend)
- `npm run dev` Arranca Nuxt en modo desarrollo.
- `npm run build` Genera build de producción.
- `npm run preview` Previsualiza el build.

## Endpoints de prueba
- API tiendas: `http://127.0.0.1:8000/api/stores/`
- API marketplace: `http://127.0.0.1:8000/api/marketplace/products/`
- Frontend: `http://localhost:3000`

## Despliegue rápido
1) Configura variables de entorno seguras (SECRET_KEY, DB, CORS/hosts).
2) Ejecuta migraciones en el entorno de despliegue.
3) Sirve Django con WSGI/ASGI productivo (gunicorn/uvicorn) detrás de un reverse proxy.
4) Genera el build de Nuxt (`npm run build`) y sirve con `nuxt start` o detrás de un proxy.

## Problemas comunes
- **CORS / hosts**: añade el dominio del frontend en `ALLOWED_HOSTS` y `CORS_ALLOWED_ORIGINS` del backend.
- **API BASE**: si el frontend no llega a la API, revisa `API_BASE` o el valor por defecto en `nuxt.config.ts`.
- **Dependencias**: si falta una lib de sistema para `psycopg2-binary`, instala las herramientas de Postgres o usa la rueda precompilada.

## Documentación Operativa
- Plan e implementación de notificaciones + destacados: `docs/IMPLEMENTACION_FASE_NOTIFICACIONES_Y_DESTACADOS.md`.
