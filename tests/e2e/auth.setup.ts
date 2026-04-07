import { test as setup, expect } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const authFile = 'tests/e2e/.auth/user.json'
const E2E_USER = process.env.E2E_USER || ''
const E2E_PASSWORD = process.env.E2E_PASSWORD || ''

setup('authenticate', async ({ page, context }) => {
  if (!E2E_USER || !E2E_PASSWORD) {
    if (existsSync(authFile)) {
      return
    }
    throw new Error('Missing E2E auth. Define E2E_USER and E2E_PASSWORD or create tests/e2e/.auth/user.json')
  }

  await page.goto('/login')

  const usernameOrEmail = page.locator('input[type="text"], input[type="email"], input:not([type])').first()
  const password = page.locator('input[type="password"]').first()

  await expect(usernameOrEmail).toBeVisible()
  await expect(password).toBeVisible()

  await usernameOrEmail.fill(E2E_USER)
  await password.fill(E2E_PASSWORD)
  await page.getByRole('button', { name: /entrar/i }).click()

  await expect(page.getByRole('button', { name: /perfil|marko|ma/i }).first()).toBeVisible({ timeout: 20_000 })

  mkdirSync(dirname(authFile), { recursive: true })
  await context.storageState({ path: authFile })
})
