import { expect, test, type Page } from '@playwright/test'
import { productSpinBySize } from './helpers/forms'

const fillRequiredProductFieldsLocal = async (page: Page, data: { name: string; slug: string; description: string; price: string }) => {
  const nameInput = page.locator('main label:text-is("Nombre") + input').first()
  const slugInput = page.locator('main label:text-is("Slug") + input').first()
  const descriptionInput = page.locator('main label:text-is("Descripción") + textarea').first()
  const priceInput = page.locator('main label:text-is("Precio") + input[type="number"]').first()

  await nameInput.fill(data.name)
  await slugInput.fill(data.slug)
  await descriptionInput.fill(data.description)
  await priceInput.fill(data.price)

  await expect(nameInput).toHaveValue(data.name)
  await expect(slugInput).toHaveValue(data.slug)
  await expect(descriptionInput).toHaveValue(data.description)
  await expect(priceInput).toHaveValue(data.price)
}

test.skip('calzado por talla: crear y editar persiste stock por talla', async ({ page }) => {
  const uniqueSuffix = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`
  const productName = `Calzado Smoke ${uniqueSuffix}`
  const productSlug = `calzado-smoke-${uniqueSuffix}`

  await page.goto('/store/lider/admin/productos/nuevo')

  await expect(page.getByRole('heading', { name: /Nuevo producto/i })).toBeVisible()

  await fillRequiredProductFieldsLocal(page, {
    name: productName,
    slug: productSlug,
    description: 'Calzado smoke E2E con tallas y stock.',
    price: '34990',
  })

  const category = page.locator('main label:has-text("Categoría") + select').first()
  await expect(category).toBeVisible()
  await category.selectOption({ label: 'Calzado' })

  const size38 = productSpinBySize(page, '38')
  const size40 = productSpinBySize(page, '40')
  const size42 = productSpinBySize(page, '42')

  await size38.fill('2')
  await size40.fill('3')
  await size42.fill('1')

  const stockDisponible = page.locator('main label:has-text("Stock disponible") + input[type="number"]').first()
  await expect(stockDisponible).toHaveValue('6')

  await page.getByRole('button', { name: /Guardar producto/i }).click()
  await expect(page).toHaveURL(/\/store\/lider\/productos$/)

  const createdCard = page.locator('article', { hasText: productName }).first()
  await expect(createdCard).toBeVisible()
  await expect(createdCard.getByText(/6 disponibles/i)).toBeVisible()

  await page.goto(`/store/lider/admin/productos/${productSlug}/editar`)
  await expect(page.getByRole('heading', { name: /Editar producto/i })).toBeVisible()

  await expect(size38).toHaveValue('2')
  await expect(size40).toHaveValue('3')
  await expect(size42).toHaveValue('1')
  await expect(stockDisponible).toHaveValue('6')

  await size42.fill('4')
  await expect(stockDisponible).toHaveValue('9')

  await page.getByRole('button', { name: /Guardar cambios/i }).click()
  await expect(page).toHaveURL(/\/store\/lider\/productos$/)

  const updatedCard = page.locator('article', { hasText: productName }).first()
  await expect(updatedCard).toBeVisible()
  await expect(updatedCard.getByText(/9 disponibles/i)).toBeVisible()

  await page.goto(`/store/lider/admin/productos/${productSlug}/editar`)
  await expect(size42).toHaveValue('4')
  await expect(stockDisponible).toHaveValue('9')
})
