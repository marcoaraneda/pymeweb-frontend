import { expect, test, type Page } from '@playwright/test'

const E2E_USER = process.env.E2E_USER || ''
const E2E_PASSWORD = process.env.E2E_PASSWORD || ''

async function ensureAuthenticated(page: Page): Promise<boolean> {
  await page.goto('/dashboard')

  const dashboardHeading = page.getByRole('heading', { name: /Dashboard de tiendas/i })
  if (await dashboardHeading.isVisible().catch(() => false)) return true
  if (/\/dashboard/.test(page.url())) return true

  if (/\/login/.test(page.url())) {
    if (!E2E_USER || !E2E_PASSWORD) return false

    const usernameOrEmail = page.locator('input[type="text"], input[type="email"], input:not([type])').first()
    const password = page.locator('input[type="password"]').first()

    await expect(usernameOrEmail).toBeVisible()
    await expect(password).toBeVisible()

    await usernameOrEmail.fill(E2E_USER)
    await password.fill(E2E_PASSWORD)
    await page.getByRole('button', { name: /Entrar/i }).click()

    await page.goto('/dashboard')
    if (await dashboardHeading.isVisible().catch(() => false)) return true
    return /\/dashboard/.test(page.url())
  }

  return await dashboardHeading.isVisible().catch(() => false)
}

test('dashboard roles smoke: secciones cargan para usuario administrador', async ({ page }) => {
  const ready = await ensureAuthenticated(page)
  if (!ready) {
    test.skip(true, 'No hay sesion autenticada para dashboard roles smoke.')
    return
  }

  const sections = [
    { path: '/dashboard/recursos-humanos', heading: /Recursos humanos/i },
    { path: '/dashboard/analisis-financiero', heading: /Análisis financiero|Analisis financiero/i },
    { path: '/dashboard/analisis', heading: /Analisis de datos/i },
  ]

  for (const section of sections) {
    await page.goto(section.path)
    await expect(page.getByRole('heading', { name: section.heading })).toBeVisible()
  }
})
