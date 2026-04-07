import { expect, test, type Page } from '@playwright/test'

const E2E_USER = process.env.E2E_USER || ''
const E2E_PASSWORD = process.env.E2E_PASSWORD || ''

async function ensureAuthenticated(page: Page) {
  await page.goto('/store/lider/admin/cms')

  const heading = page.getByRole('heading', { name: /Personalización de la Tienda/i })
  if (await heading.isVisible().catch(() => false)) return

  if (/\/login/.test(page.url())) {
    if (!E2E_USER || !E2E_PASSWORD) {
      throw new Error('No hay sesion autenticada para E2E. Usa tests/e2e/.auth/user.json o define E2E_USER y E2E_PASSWORD.')
    }

    const usernameOrEmail = page.locator('input[type="text"], input[type="email"], input:not([type])').first()
    const password = page.locator('input[type="password"]').first()

    await expect(usernameOrEmail).toBeVisible()
    await expect(password).toBeVisible()

    await usernameOrEmail.fill(E2E_USER)
    await password.fill(E2E_PASSWORD)
    await page.getByRole('button', { name: /Entrar/i }).click()

    await page.goto('/store/lider/admin/cms')
  }
}

test('cms smoke: load and toggle section', async ({ page }) => {
  await ensureAuthenticated(page)

  const heading = page.getByRole('heading', { name: /Personalización de la Tienda/i })
  if (!(await heading.isVisible().catch(() => false))) {
    test.skip(true, 'El usuario actual no tiene acceso a /store/lider/admin/cms')
    return
  }

  const initButton = page.getByRole('button', { name: /Inicializar secciones por defecto/i })
  if (await initButton.isVisible().catch(() => false)) {
    await initButton.click()
    await page.waitForTimeout(2_000)
    await page.getByRole('button', { name: /Actualizar/i }).click()
    await page.waitForTimeout(1_500)
  }

  const toggleButton = page.locator('button.inline-flex.h-6.w-11').first()
  const emptyState = page.getByText('No hay secciones configuradas para esta tienda.')
  if (!(await toggleButton.isVisible().catch(() => false))) {
    await expect(emptyState).toBeVisible()
    return
  }

  await expect(toggleButton).toBeVisible()
  await toggleButton.click()

  await expect(page.getByText(/Sección .* (activada|desactivada)/i)).toBeVisible({ timeout: 10_000 })
})
