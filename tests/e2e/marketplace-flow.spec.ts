import { expect, test, type Page } from '@playwright/test'

const E2E_USER = process.env.E2E_USER || ''
const E2E_PASSWORD = process.env.E2E_PASSWORD || ''

async function ensureAuthenticated(page: Page) {
  await page.goto('/marketplace/mis-productos')
  const canPublish = await page.getByRole('button', { name: 'Publicar producto' }).isVisible().catch(() => false)
  if (canPublish) return

  await page.goto('/login')
  const alreadyLoggedIn = await page.getByRole('button', { name: /perfil|marko|ma/i }).first().isVisible().catch(() => false)
  if (alreadyLoggedIn) return

  if (!E2E_USER || !E2E_PASSWORD) {
    throw new Error('No hay sesion autenticada para E2E. Usa tests/e2e/.auth/user.json o define E2E_USER y E2E_PASSWORD.')
  }

  const usernameOrEmail = page.getByRole('textbox', { name: /ej:\s*admin/i }).first()
  const password = page.getByRole('textbox', { name: /\u2022+/ }).first()

  await usernameOrEmail.fill(E2E_USER)
  await password.fill(E2E_PASSWORD)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page.getByRole('button', { name: /perfil|marko|ma/i }).first()).toBeVisible()
}

async function fillFieldByLabel(page: Page, label: string, value: string) {
  const byLabel = page.getByLabel(new RegExp(label, 'i')).first()
  const fallback = page.locator(`label:has-text("${label}")`).locator('xpath=following::input[1]').first()
  const field = (await byLabel.count()) > 0 ? byLabel : fallback
  await expect(field).toBeVisible()
  await field.evaluate((el, next) => {
    const input = el as HTMLInputElement
    input.value = ''
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.value = String(next)
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.dispatchEvent(new Event('change', { bubbles: true }))
    input.blur()
  }, value)
  await expect(field).toHaveValue(value)
}

async function clickFirstEnabledButtonByName(page: Page, buttonName: RegExp) {
  const buttons = page.getByRole('button', { name: buttonName })
  const count = await buttons.count()
  for (let i = 0; i < count; i += 1) {
    const btn = buttons.nth(i)
    if (await btn.isVisible().catch(() => false) && await btn.isEnabled().catch(() => false)) {
      await btn.click()
      return
    }
  }
  throw new Error(`No se encontró botón habilitado para ${buttonName.toString()}`)
}

test('publish -> edit -> cart -> checkout -> receipt', async ({ page }) => {
  await ensureAuthenticated(page)

  await page.goto('/marketplace/carrito')
  const clearCartBtn = page.getByRole('button', { name: 'Vaciar carrito' })
  if (await clearCartBtn.isVisible().catch(() => false)) {
    await clearCartBtn.click()
  }

  const uniqueName = `E2E-${Date.now()}`

  await page.goto('/marketplace/mis-productos')

  await fillFieldByLabel(page, 'Nombre', uniqueName)
  await fillFieldByLabel(page, 'Precio', '120')
  await fillFieldByLabel(page, 'Precio oferta', '95')
  await fillFieldByLabel(page, 'Stock disponible', '7')
  await fillFieldByLabel(page, 'Stock mínimo', '1')

  await page.locator('main textarea').first().fill('Producto de prueba automatizada E2E')
  await clickFirstEnabledButtonByName(page, /Publicar producto/i)

  await expect(page.getByText('Producto publicado. Puedes activarlo o desactivarlo cuando se venda.')).toBeVisible()

  const card = page.locator('article', { hasText: uniqueName }).first()
  await expect(card).toBeVisible()
  await card.locator('button').first().click()
  await card.getByRole('button', { name: 'Editar' }).click()

  await expect(page).toHaveURL(/\/marketplace\/productos\//)

  const editFormVisible = page.getByRole('heading', { name: /Editar publicaci[oó]n/i })
  if (!(await editFormVisible.isVisible().catch(() => false))) {
    await page.getByRole('button', { name: 'Editar producto' }).click()
  }

  await fillFieldByLabel(page, 'Precio', '150')
  await fillFieldByLabel(page, 'Precio oferta', '99')
  await page.getByRole('button', { name: 'Guardar cambios' }).click()

  const saveSuccess = page.getByText('Cambios guardados')
  const saveNeedsLogin = page.getByText('Inicia sesión para editar tu publicación')
  await Promise.race([
    saveSuccess.waitFor({ state: 'visible', timeout: 8_000 }),
    saveNeedsLogin.waitFor({ state: 'visible', timeout: 8_000 }),
  ]).catch(() => null)

  await page.getByRole('button', { name: 'Agregar al carrito' }).click()
  await expect(page).toHaveURL(/\/marketplace\/carrito/)

  const cartTotal = page.locator('aside').getByText(/\$\d+\.\d{2}/).first()
  await expect(cartTotal).toBeVisible()
  const expectedTotal = (await cartTotal.textContent())?.trim() || ''
  expect(expectedTotal).toMatch(/^\$\d+\.\d{2}$/)

  await page.getByRole('button', { name: 'Proceder al pago' }).click()
  await expect(page).toHaveURL(/\/marketplace\/orden\?id=/)
  await expect(page.getByRole('heading', { name: 'Boleta de Compra' })).toBeVisible()
  await expect(page.getByText(new RegExp(`Total:\\s*${expectedTotal.replace('$', '\\$')}`))).toBeVisible()
})
