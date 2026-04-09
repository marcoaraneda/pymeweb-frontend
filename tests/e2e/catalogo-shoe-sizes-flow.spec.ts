import { expect, test } from '@playwright/test'
import { productSpinBySize } from './helpers/forms'

const API_BASE = process.env.E2E_API_BASE || 'http://127.0.0.1:8000/api'
const E2E_USER = process.env.E2E_USER || ''
const E2E_PASSWORD = process.env.E2E_PASSWORD || ''

const cleanupProductBySlug = async (request: any, storeSlug: string, slug: string) => {
  if (!E2E_USER || !E2E_PASSWORD) return

  const tokenResponse = await request.post(`${API_BASE}/token/`, {
    data: { username: E2E_USER, password: E2E_PASSWORD },
  })
  if (!tokenResponse.ok()) return

  const tokenData = (await tokenResponse.json().catch(() => null)) as { access?: string } | null
  const access = tokenData?.access || ''
  if (!access) return

  const headers = { Authorization: `Bearer ${access}` }
  const listResponse = await request.get(`${API_BASE}/store/${storeSlug}/admin/catalogo/products/`, { headers })
  if (!listResponse.ok()) return

  const payload = await listResponse.json().catch(() => null)
  const items = Array.isArray(payload) ? payload : Array.isArray(payload?.results) ? payload.results : []
  const match = items.find((item: any) => String(item?.slug || '') === slug)
  if (!match?.id) return

  await request.delete(`${API_BASE}/store/${storeSlug}/admin/catalogo/products/${match.id}/`, { headers })
}

const fillRequiredProductFieldsLocal = async (page: any, data: { name: string; slug: string; description: string; price: string }) => {
  const nameInput = page.locator('main label:text-is("Nombre") + input').first()
  const slugInput = page.locator('main label:text-is("Slug") + input').first()
  const descriptionInput = page.locator('main label:text-is("Descripción") + textarea').first()
  const priceInput = page.locator('main label:text-is("Precio") + input[type="number"]').first()

  await nameInput.fill(data.name)
  await slugInput.fill(data.slug)
  await descriptionInput.fill(data.description)
  await priceInput.fill(data.price)

  await expect(nameInput).toHaveValue(data.name)
  await expect(slugInput).toHaveValue(data.slug)
  await expect(descriptionInput).toHaveValue(data.description)
  await expect(priceInput).toHaveValue(data.price)
}

test.skip('catalogo shoe sizes flow: crear y editar cantidades por talla', async ({ page, request }) => {
  const unique = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`
  const productName = `Zapatilla E2E ${unique}`
  const productSlug = `zapatilla-e2e-${unique}`
  const storeSlug = 'lider'

  try {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/dashboard/)

    await page.goto(`/store/${storeSlug}/admin/productos/nuevo`)
    await expect(page.getByRole('heading', { name: /Nuevo producto/i })).toBeVisible()

    await fillRequiredProductFieldsLocal(page, {
      name: productName,
      slug: productSlug,
      description: 'Zapatilla E2E para prueba de tallas y stock.',
      price: '34990',
    })

    await page.locator('main label:has-text("Categoría") + select').first().selectOption({ label: 'Calzado' })

    await expect(page.getByText(/Cantidad por talla de zapatilla/i)).toBeVisible()
    await productSpinBySize(page, '38').fill('2')
    await productSpinBySize(page, '40').fill('3')
    await productSpinBySize(page, '42').fill('1')

    const createStockAvailable = page.locator('main label:has-text("Stock disponible") + input[type="number"]').first()
    await expect(createStockAvailable).toHaveValue('6')
    await expect(page.getByText(/Total por talla:\s*6 unidades\./i)).toBeVisible()

    await Promise.all([
      page.waitForURL(new RegExp(`/store/${storeSlug}/productos`)),
      page.getByRole('button', { name: /Guardar producto/i }).click(),
    ])
    await expect(page.getByRole('heading', { name: productName })).toBeVisible()
    await expect(page.locator('article').filter({ hasText: productName }).getByText(/6 disponibles/i)).toBeVisible()

    await page.goto(`/store/${storeSlug}/admin/productos/${productSlug}/editar`)
    await expect(page.getByRole('heading', { name: /Editar producto/i })).toBeVisible()
    await expect(page.getByText(/Cantidad por talla de zapatilla/i)).toBeVisible()

    await expect(page.getByRole('spinbutton', { name: '38' })).toHaveValue('2')
    await expect(page.getByRole('spinbutton', { name: '40' })).toHaveValue('3')
    await expect(page.getByRole('spinbutton', { name: '42' })).toHaveValue('1')

    await page.getByRole('spinbutton', { name: '42' }).fill('4')
    const editStockAvailable = page.locator('label:has-text("Stock disponible")').locator('..').locator('input[type="number"]').first()
    await expect(editStockAvailable).toHaveValue('9')
    await expect(page.getByText(/Total por talla:\s*9 unidades\./i)).toBeVisible()

    await page.getByRole('button', { name: /Guardar cambios/i }).click()
    await expect(page).toHaveURL(new RegExp(`/store/${storeSlug}/productos`))
    await expect(page.locator('article').filter({ hasText: productName }).getByText(/9 disponibles/i)).toBeVisible()

    await page.goto(`/store/${storeSlug}/admin/productos/${productSlug}/editar`)
    await expect(page.getByRole('spinbutton', { name: '42' })).toHaveValue('4')
    await expect(page.getByText(/Total por talla:\s*9 unidades\./i)).toBeVisible()
  } finally {
    await cleanupProductBySlug(request, storeSlug, productSlug).catch(() => undefined)
  }
})
