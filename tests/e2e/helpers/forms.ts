import { expect, type Locator, type Page } from '@playwright/test'

const productFormRoot = (page: Page): Locator =>
  page
    .locator('div.rounded-2xl.border.border-slate-200.bg-white.p-6')
    .filter({ has: page.getByRole('button', { name: /Guardar producto|Guardar cambios/i }) })
    .first()

const inputByExactLabel = (page: Page, label: string): Locator =>
  productFormRoot(page).locator(`div.space-y-2:has(> label:text-is("${label}")) input`).first()

const textareaByExactLabel = (page: Page, label: string): Locator =>
  productFormRoot(page).locator(`div.space-y-2:has(> label:text-is("${label}")) textarea`).first()

export async function fillRequiredProductFields(page: Page, data: { name: string; slug: string; description: string; price: string }) {
  const form = productFormRoot(page)
  const nameInput = form.locator('input[type="text"]').first()
  const slugInput = form.locator('input[type="text"]').nth(1)
  const descriptionInput = form.locator('textarea').first()
  const priceInput = form.locator('input[type="number"]').first()

  await nameInput.fill(data.name)
  await slugInput.fill(data.slug)
  await descriptionInput.fill(data.description)
  await priceInput.fill(data.price)

  await expect(nameInput).toHaveValue(data.name)
  await expect(slugInput).toHaveValue(data.slug)
  await expect(descriptionInput).toHaveValue(data.description)
  await expect(priceInput).toHaveValue(data.price)
}

export const productTextInputByLabel = inputByExactLabel
export const productSelectByLabel = (page: Page, label: string): Locator =>
  productFormRoot(page).locator(`div.space-y-2:has(> label:has-text("${label}")) select`).first()

export const productSpinBySize = (page: Page, size: string): Locator =>
  page.locator('label', { hasText: new RegExp(`^\\s*${size}\\s*$`) }).locator('input[type="number"]').first()
