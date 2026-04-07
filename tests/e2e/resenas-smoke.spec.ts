import { expect, test, type Page } from '@playwright/test'

const E2E_USER = process.env.E2E_USER || ''
const E2E_PASSWORD = process.env.E2E_PASSWORD || ''

async function ensureAuthenticated(page: Page) {
  await page.goto('/store/lider/admin/resenas')

  const heading = page.getByRole('heading', { name: /Reseñas de la tienda/i })
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

    await page.goto('/store/lider/admin/resenas')
  }
}

test('resenas smoke: load and filter', async ({ page }) => {
  await ensureAuthenticated(page)

  const heading = page.getByRole('heading', { name: /Reseñas de la tienda/i })
  if (!(await heading.isVisible().catch(() => false))) {
    test.skip(true, 'El usuario actual no tiene acceso a /store/lider/admin/resenas')
    return
  }

  await expect(page.getByRole('button', { name: /Actualizar/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /Todas/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /Pendientes/i })).toBeVisible()

  const emptyState = page.getByText('No hay reseñas registradas.')
  if (await emptyState.isVisible().catch(() => false)) {
    await expect(emptyState).toBeVisible()
    return
  }

  const firstReview = page.locator('article').first()
  await expect(firstReview).toBeVisible()

  await page.getByRole('button', { name: /Pendientes/i }).click()
  await expect(page.getByRole('button', { name: /Pendientes/i })).toBeVisible()

  await page.getByRole('button', { name: /Aprobadas/i }).click()
  await expect(page.getByRole('button', { name: /Aprobadas/i })).toBeVisible()
})
