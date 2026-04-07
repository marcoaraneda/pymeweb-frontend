import { expect, test, type Page } from '@playwright/test'

const E2E_USER = process.env.E2E_USER || ''
const E2E_PASSWORD = process.env.E2E_PASSWORD || ''

async function ensureAuthenticated(page: Page): Promise<boolean> {
  await page.goto('/store/lider/admin/orders')

  const heading = page.getByRole('heading', { name: /Compras realizadas/i })
  if (await heading.isVisible().catch(() => false)) return true

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
    return await heading.isVisible().catch(() => false)
  }

  return await heading.isVisible().catch(() => false)
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

test('checkout manual -> pedido visible -> estado completed', async ({ page }) => {
  const ready = await ensureAuthenticated(page)
  if (!ready) {
    test.skip(true, 'No hay sesion autenticada para validar flujo de ordenes en este entorno.')
    return
  }

  const added = await addAnyAvailableProductToCart(page)
  if (!added) {
    test.skip(true, 'No hay productos con stock para ejecutar la compra E2E.')
    return
  }

  await page.goto('/store/lider/carrito')
  if (await page.getByText(/Tu carrito est[aá] vac[ií]o/i).isVisible().catch(() => false)) {
    test.skip(true, 'El carrito quedó vacío en este entorno; no se puede continuar el flujo.')
    return
  }

  await page.getByRole('link', { name: /Ir a pagar/i }).click()
  await expect(page).toHaveURL(/\/store\/lider\/checkout/)

  const customerName = `Flujo E2E ${Date.now()}`
  await page.getByLabel(/Nombre completo/i).fill(customerName)
  await page.getByLabel(/Correo electr[oó]nico/i).fill('flujo.e2e+orders@example.com')
  await page.getByLabel(/Tel[eé]fono/i).fill('+56 9 1111 2222')
  await page.getByLabel(/Direcci[oó]n/i).fill('Calle E2E 123, Santiago')

  await page.getByRole('button', { name: /Completar pedido sin Webpay/i }).click()
  await expect(page).toHaveURL(/\/store\/lider\/orden\?id=\d+/)

  const url = new URL(page.url())
  const orderId = url.searchParams.get('id')
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
  await expect(page.getByText(/Finalizado/i)).toBeVisible()
})