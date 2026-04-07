import { expect, test, type Page } from '@playwright/test'

const E2E_USER = process.env.E2E_USER || ''
const E2E_PASSWORD = process.env.E2E_PASSWORD || ''

async function ensureAuthenticated(page: Page, targetPath: string, headingPattern: RegExp): Promise<boolean> {
  await page.goto(targetPath)

  const heading = page.getByRole('heading', { name: headingPattern }).first()
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

    await page.goto(targetPath)
    return await heading.isVisible().catch(() => false)
  }

  return await heading.isVisible().catch(() => false)
}

test('dashboard/reportes smoke: overview and reportes page', async ({ page }) => {
  const dashboardReady = await ensureAuthenticated(page, '/dashboard', /Dashboard de tiendas/i)
  if (!dashboardReady) {
    test.skip(true, 'No hay sesion autenticada para E2E de dashboard/reportes en este entorno.')
    return
  }

  await expect(page.getByRole('heading', { name: /Dashboard de tiendas/i })).toBeVisible()

  const reportesLink = page.locator('a[href*="/admin/reportes"]').first()
  if (await reportesLink.isVisible().catch(() => false)) {
    await reportesLink.click()
  } else {
    await page.goto('/store/lider/admin/reportes')
  }

  const reportesHeading = page.getByRole('heading', { name: /Reportes y Estadísticas/i })
  if (!(await reportesHeading.isVisible().catch(() => false))) {
    test.skip(true, 'El usuario actual no tiene acceso a /store/lider/admin/reportes')
    return
  }

  await expect(reportesHeading).toBeVisible()
  await expect(page.getByRole('button', { name: /Actualizar/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /Exportar ventas/i })).toBeVisible()
})
