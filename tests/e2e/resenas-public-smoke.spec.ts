import { expect, test } from '@playwright/test'

const API_BASE = process.env.E2E_API_BASE || 'http://127.0.0.1:8000/api'
const STORE_SLUG = 'lider'

const pickFirstProductSlug = async (request: any): Promise<string> => {
  const resp = await request.get(`${API_BASE}/store/${STORE_SLUG}/catalogo/products/`).catch(() => null)
  if (!resp || !resp.ok()) return ''

  const payload = await resp.json().catch(() => null)
  const items = Array.isArray(payload) ? payload : Array.isArray(payload?.results) ? payload.results : []
  const first = items.find((item: any) => item?.slug)
  return String(first?.slug || '')
}

test('resenas publicas: bloquea groserias y publica comentario valido de inmediato', async ({ page, request }) => {
  const productSlug = await pickFirstProductSlug(request)
  if (!productSlug) {
    test.skip(true, 'No hay productos publicos disponibles para probar reseñas.')
    return
  }

  await page.goto(`/store/${STORE_SLUG}/productos/${productSlug}`)
  await expect(page.getByRole('heading', { name: /Opiniones y valoración/i })).toBeVisible()

  await page.getByRole('button', { name: /Asignar 4 estrellas/i }).click()
  await page.getByPlaceholder('Escribe tu comentario').fill('Este producto es una mierda')
  await page.getByRole('button', { name: /Publicar reseña/i }).click()
  await expect(page.getByText(/lenguaje ofensivo/i)).toBeVisible()

  const uniqueComment = `Comentario E2E visible ${Date.now()}`
  await page.getByRole('button', { name: /Asignar 5 estrellas/i }).click()
  await page.getByPlaceholder('Tu nombre').fill('Cliente E2E')
  await page.getByPlaceholder('Escribe tu comentario').fill(uniqueComment)
  await page.getByRole('button', { name: /Publicar reseña/i }).click()

  await expect(page.getByText(/Reseñas recientes/i)).toBeVisible()
  await expect(page.getByText(uniqueComment)).toBeVisible()
})
