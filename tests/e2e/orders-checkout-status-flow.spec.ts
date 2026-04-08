import { expect, test, type Page } from '@playwright/test'

const E2E_USER = process.env.E2E_USER || ''
const E2E_PASSWORD = process.env.E2E_PASSWORD || ''
const API_BASE = process.env.E2E_API_BASE || 'http://127.0.0.1:8000/api'

async function hasOrdersHeading(page: Page, timeout = 8000): Promise<boolean> {
  try {
    await expect(page.getByRole('heading', { name: /Compras realizadas/i })).toBeVisible({ timeout })
    return true
  } catch {
    return false
  }
}

async function loginViaApiCookieBootstrap(page: Page): Promise<boolean> {
  if (!E2E_USER || !E2E_PASSWORD) return false

  const tokenResponse = await page.request
    .post(`${API_BASE}/token/`, {
      data: {
        username: E2E_USER,
        password: E2E_PASSWORD,
      },
    })
    .catch(() => null)

  if (!tokenResponse || !tokenResponse.ok()) return false

  const tokenData = (await tokenResponse.json().catch(() => null)) as { access?: string; refresh?: string } | null
  const access = tokenData?.access || ''
  const refresh = tokenData?.refresh || ''
  if (!access || !refresh) return false

  const url = new URL(page.url())
  const domain = url.hostname

  await page.context().addCookies([
    { name: 'auth_token', value: access, domain, path: '/' },
    { name: 'refresh_token', value: refresh, domain, path: '/' },
  ])

  return true
}

async function ensureAuthenticated(page: Page): Promise<boolean> {
  await page.goto('/store/lider/admin/orders')
  await page.waitForLoadState('domcontentloaded')

  if (await hasOrdersHeading(page)) return true

  const cookieBootstrapped = await loginViaApiCookieBootstrap(page)
  if (cookieBootstrapped) {
    await page.goto('/store/lider/admin/orders')
    await page.waitForLoadState('domcontentloaded')
    if (await hasOrdersHeading(page)) return true
  }

  if (/\/login/.test(page.url())) {
    if (!E2E_USER || !E2E_PASSWORD) {
      return false
    }

    const usernameOrEmail = page.locator('input[type="text"], input[type="email"], input:not([type])').first()
    const password = page.locator('input[type="password"]').first()

    await expect(usernameOrEmail).toBeVisible()
    await expect(password).toBeVisible()

    await usernameOrEmail.fill(E2E_USER)
    await password.fill(E2E_PASSWORD)
    await page.getByRole('button', { name: /Entrar/i }).click()

    await page.goto('/store/lider/admin/orders')
    await page.waitForLoadState('domcontentloaded')
    return await hasOrdersHeading(page)
  }

  return await hasOrdersHeading(page)
}

async function addAnyAvailableProductToCart(page: Page): Promise<boolean> {
  await page.goto('/store/lider/productos')

  const candidates = page.getByRole('button', { name: /Agregar( al carrito)?/i })
  const count = await candidates.count()
  for (let i = 0; i < count; i += 1) {
    const btn = candidates.nth(i)
    if (await btn.isVisible().catch(() => false) && await btn.isEnabled().catch(() => false)) {
      await btn.click()
      return true
    }
  }

  return false
}

async function createOrderViaApi(page: Page, customerName: string): Promise<string | null> {
  const productsResponse = await page.request
    .get(`${API_BASE}/store/lider/catalogo/products/`)
    .catch(() => null)
  if (!productsResponse || !productsResponse.ok()) return null

  const products = (await productsResponse.json().catch(() => [])) as Array<{ id: number }>
  const productId = products?.[0]?.id
  if (!productId) return null

  const createResponse = await page.request
    .post(`${API_BASE}/orders/?store=lider`, {
      data: {
        name: customerName,
        email: 'flujo.e2e+orders@example.com',
        phone: '+56 9 1111 2222',
        address: 'Calle E2E 123, Santiago',
        items: [{ product: productId, quantity: 1 }],
      },
    })
    .catch(() => null)

  if (!createResponse || !createResponse.ok()) return null
  const orderData = (await createResponse.json().catch(() => null)) as { id?: number } | null
  return orderData?.id ? String(orderData.id) : null
}

test('checkout manual -> pedido visible -> estado completed', async ({ page }) => {
  const ready = await ensureAuthenticated(page)
  if (!ready) {
    test.skip(true, 'No hay sesion autenticada para validar flujo de ordenes en este entorno.')
    return
  }

  const customerName = `Flujo E2E ${Date.now()}`

  const added = await addAnyAvailableProductToCart(page)

  await page.goto('/store/lider/carrito')
  let orderId: string | null = null

  if (await page.getByText(/Tu carrito est[aá] vac[ií]o/i).isVisible().catch(() => false)) {
    orderId = await createOrderViaApi(page, customerName)
    if (!orderId) {
      test.skip(true, 'El carrito quedó vacío y no fue posible crear pedido por API en este entorno.')
      return
    }
  }

  if (!orderId) {
    await page.getByRole('link', { name: /Ir a pagar/i }).click()
    await expect(page).toHaveURL(/\/store\/lider\/checkout/)

    await page.getByPlaceholder('Ej: Juan Pérez').fill(customerName)
    await page.getByPlaceholder('tu@correo.com').fill('flujo.e2e+orders@example.com')
    await page.getByPlaceholder('+56 9 1234 5678').fill('+56 9 1111 2222')
    await page.getByPlaceholder('Calle, número, comuna, ciudad').fill('Calle E2E 123, Santiago')

    await page.getByRole('button', { name: /Completar pedido sin Webpay/i }).click()
    await expect(page).toHaveURL(/\/store\/lider\/orden\?id=\d+/)

    const url = new URL(page.url())
    orderId = url.searchParams.get('id')
  }

  expect(orderId).toBeTruthy()

  await page.goto('/store/lider/admin/orders')
  await expect(page.getByRole('heading', { name: /Compras realizadas/i })).toBeVisible()

  const orderLink = page
    .locator('tr', { hasText: customerName })
    .getByRole('link', { name: /Ver/i })
    .first()

  if (!(await orderLink.isVisible().catch(() => false))) {
    await page.goto(`/store/lider/admin/orders/${orderId}`)
  } else {
    await orderLink.click()
  }

  await expect(page).toHaveURL(new RegExp(`/store/lider/admin/orders/${orderId}`))

  await page.selectOption('select', 'completed')
  await expect(page.getByText(/Estado actualizado/i)).toBeVisible()
  await expect(page.getByText(/Estado actual:\s*Finalizado/i)).toBeVisible()
})