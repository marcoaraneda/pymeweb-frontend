import { test as setup, expect } from '@playwright/test'
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname } from 'node:path'

const authFile = 'tests/e2e/.auth/user.json'
const E2E_USER = process.env.E2E_USER || ''
const E2E_PASSWORD = process.env.E2E_PASSWORD || ''
const API_BASE = process.env.E2E_API_BASE || 'http://127.0.0.1:8000/api'

const parseJwtExp = (token: string): number => {
  const payload = token.split('.')[1]
  if (!payload) return 0
  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
  const json = JSON.parse(Buffer.from(padded, 'base64').toString('utf-8'))
  return Number(json?.exp || 0)
}

const hasValidStoredAuth = (): boolean => {
  if (!existsSync(authFile)) return false
  try {
    const raw = readFileSync(authFile, 'utf-8').replace(/^\uFEFF/, '')
    const parsed = JSON.parse(raw)
    const cookies = Array.isArray(parsed?.cookies) ? parsed.cookies : []
    const authCookie = cookies.find((cookie: any) => cookie?.name === 'auth_token' && typeof cookie?.value === 'string')
    if (!authCookie?.value) return false
    const exp = parseJwtExp(authCookie.value)
    return exp > Math.floor(Date.now() / 1000) + 60
  } catch {
    return false
  }
}

const bootstrapAuthCookies = async (page: any): Promise<boolean> => {
  if (!E2E_USER || !E2E_PASSWORD) return false

  const tokenResponse = await page.request
    .post(`${API_BASE}/token/`, {
      data: {
        username: E2E_USER,
        password: E2E_PASSWORD,
      },
    })
    .catch(() => null)

  if (!tokenResponse || !tokenResponse.ok()) return false

  const tokenData = (await tokenResponse.json().catch(() => null)) as { access?: string; refresh?: string } | null
  const access = tokenData?.access || ''
  const refresh = tokenData?.refresh || ''
  if (!access || !refresh) return false

  await page.goto('/login')
  const domain = new URL(page.url()).hostname

  await page.context().addCookies([
    { name: 'auth_token', value: access, domain, path: '/' },
    { name: 'refresh_token', value: refresh, domain, path: '/' },
  ])

  await page.goto('/dashboard')
  await expect(page).toHaveURL(/\/dashboard/)

  return true
}

setup('authenticate', async ({ page, context }) => {
  if (!E2E_USER || !E2E_PASSWORD) {
    if (hasValidStoredAuth()) {
      return
    }
    // Allow smoke specs to decide whether to skip when auth is unavailable.
    console.warn('E2E auth not available: define E2E_USER/E2E_PASSWORD or refresh tests/e2e/.auth/user.json')
    return
  }

  if (await bootstrapAuthCookies(page)) {
    mkdirSync(dirname(authFile), { recursive: true })
    await context.storageState({ path: authFile })
    return
  }

  await page.goto('/login')

  const usernameOrEmail = page.locator('input[type="text"], input[type="email"], input:not([type])').first()
  const password = page.locator('input[type="password"]').first()

  await expect(usernameOrEmail).toBeVisible()
  await expect(password).toBeVisible()

  await usernameOrEmail.fill(E2E_USER)
  await password.fill(E2E_PASSWORD)
  await page.getByRole('button', { name: /entrar/i }).click()

  await expect(page).toHaveURL(/\/dashboard/)

  mkdirSync(dirname(authFile), { recursive: true })
  await context.storageState({ path: authFile })
})
