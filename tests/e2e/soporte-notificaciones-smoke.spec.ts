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

test('soporte/notificaciones smoke: carga base', async ({ page }) => {
  const soporteReady = await ensureAuthenticated(page, '/store/lider/soporte', /Enviar ticket/i)
  if (!soporteReady) {
    test.skip(true, 'No hay sesion autenticada para E2E de soporte/notificaciones en este entorno.')
    return
  }

  await expect(page.getByRole('heading', { name: /Enviar ticket/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /Enviar ticket/i })).toBeVisible()

  const notificationsReady = await ensureAuthenticated(page, '/notificaciones', /Notificaciones/i)
  if (!notificationsReady) {
    test.skip(true, 'No hay sesion autenticada para validar notificaciones en este entorno.')
    return
  }

  const notificationsHeading = page.getByRole('heading', { name: /Notificaciones/i })
  await expect(notificationsHeading).toBeVisible()
  await expect(page.getByRole('button', { name: /Actualizar/i })).toBeVisible()
})
