import { expect, test, type Page } from '@playwright/test'

const E2E_USER = process.env.E2E_USER || ''
const E2E_PASSWORD = process.env.E2E_PASSWORD || ''

async function ensureAuthenticated(page: Page): Promise<boolean> {
  await page.goto('/store/lider/admin/inventario')

  const inventoryHeading = page.getByRole('heading', { name: /Control de Inventario/i })
  if (await inventoryHeading.isVisible().catch(() => false)) return true

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

    await page.goto('/store/lider/admin/inventario')
    return await inventoryHeading.isVisible().catch(() => false)
  }

  return await inventoryHeading.isVisible().catch(() => false)
}

test('inventario smoke: load and adjust stock', async ({ page }) => {
  const ready = await ensureAuthenticated(page)
  if (!ready) {
    test.skip(true, 'No hay sesion autenticada para E2E de inventario en este entorno.')
    return
  }

  const inventoryHeading = page.getByRole('heading', { name: /Control de Inventario/i })
  if (!(await inventoryHeading.isVisible().catch(() => false))) {
    test.skip(true, 'El usuario actual no tiene acceso a /store/lider/admin/inventario')
    return
  }

  const emptyState = page.getByText('No hay registros de stock para esta tienda.')
  if (await emptyState.isVisible().catch(() => false)) {
    await expect(emptyState).toBeVisible()
    return
  }

  const firstRow = page.locator('tbody tr').first()
  await expect(firstRow).toBeVisible()

  const stockCell = firstRow.locator('td').nth(1)
  const currentStockText = ((await stockCell.textContent()) || '0').trim()
  const currentStock = Number(currentStockText)
  const nextStock = Number.isFinite(currentStock) ? currentStock + 1 : 1

  await firstRow.getByRole('button', { name: /Ajustar Stock/i }).click()

  const adjustHeading = page.getByRole('heading', { name: /Ajustar stock/i })
  await expect(adjustHeading).toBeVisible()

  const targetStockInput = page.locator('input[type="number"]').first()
  await expect(targetStockInput).toBeVisible()
  await targetStockInput.fill(String(nextStock))

  const reasonInput = page.locator('input[placeholder*="Ajuste manual"]').first()
  await expect(reasonInput).toBeVisible()
  await reasonInput.fill('Smoke E2E inventario')

  await page.getByRole('button', { name: /Confirmar ajuste/i }).click()

  await expect(adjustHeading).not.toBeVisible({ timeout: 10_000 })

  const refreshedFirstRow = page.locator('tbody tr').first()
  const refreshedStockCell = refreshedFirstRow.locator('td').nth(1)
  await expect(refreshedStockCell).toHaveText(String(nextStock), { timeout: 10_000 })
})
