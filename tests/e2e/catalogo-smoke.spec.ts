import { expect, test } from '@playwright/test'

test('catalogo smoke: listado y detalle de producto', async ({ page }) => {
  await page.goto('/store/lider/productos')

  const heading = page.getByRole('heading', { name: /Todos los productos/i })
  await expect(heading).toBeVisible()

  const emptyState = page.getByText('No hay productos para esta tienda todavía.')
  if (await emptyState.isVisible().catch(() => false)) {
    await expect(emptyState).toBeVisible()
    return
  }

  const firstCard = page.locator('article').first()
  await expect(firstCard).toBeVisible()

  const detailLink = firstCard.getByRole('link', { name: /Ver producto/i })
  await expect(detailLink).toBeVisible()
  await detailLink.click()

  await expect(page).toHaveURL(/\/store\/[^/]+\/productos\/[^/?#]+/)

  const productTitle = page.locator('h1').first()
  await expect(productTitle).toBeVisible()

  const addToCartButton = page.getByRole('button', { name: /Agregar/i }).first()
  await expect(addToCartButton).toBeVisible()
})
