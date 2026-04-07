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

test('orders smoke: listado y detalle admin', async ({ page }) => {
  const ready = await ensureAuthenticated(page)
  if (!ready) {
    test.skip(true, 'No hay sesion autenticada para E2E de orders en este entorno.')
    return
  }

  const heading = page.getByRole('heading', { name: /Compras realizadas/i })
  if (!(await heading.isVisible().catch(() => false))) {
    test.skip(true, 'El usuario actual no tiene acceso a /store/lider/admin/orders')
    return
  }

  await expect(page.getByText(/Mostrando/i)).toBeVisible()

  const detailLink = page.getByRole('link', { name: /Ver( y preparar)?/i }).first()
  if (!(await detailLink.isVisible().catch(() => false))) {
    await expect(page.getByText(/Mostrando 0 de 0 pedidos/i)).toBeVisible()
    return
  }

  await detailLink.click()
  await expect(page).toHaveURL(/\/store\/[^/]+\/admin\/orders\/\d+/)

  const orderTitle = page.getByRole('heading', { name: /#\d+/i })
  await expect(orderTitle).toBeVisible()
  await expect(page.getByRole('link', { name: /Ver boleta\/seguimiento/i })).toBeVisible()
})
