import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'
import { makeUniqueUser } from '../fixtures/test-data'

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      try {
        window.localStorage.clear()
      } catch {
        /* ignore */
      }
    })
  })

  test('registering a new user redirects to home with name in navbar', async ({
    page,
  }) => {
    const login = new LoginPage(page)
    const user = makeUniqueUser()

    await login.goto()
    await login.register(user)

    // On success the app navigates to "/" and shows the user link in
    // the navbar (link to /orders, label is the user's name).
    await page.waitForURL('**/', { timeout: 10_000 })
    await expect(
      page.getByRole('link', { name: user.name }),
    ).toBeVisible({ timeout: 10_000 })

    // Sign-out button only renders for an authenticated session.
    await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible()
  })

  test('login with invalid credentials stays on /login with 401 response', async ({
    page,
  }) => {
    const login = new LoginPage(page)

    await login.goto()

    // Watch for the login network response and submit. The sonner toast
    // is intentionally transient (~4s) and races the assertion, so we
    // verify the failure via the API response + URL instead.
    const loginResponse = page.waitForResponse(
      (res) => res.url().includes('/api/v1/auth/login') && res.request().method() === 'POST',
    )
    await login.login('does-not-exist@test.com', 'wrong-password-12345')
    const response = await loginResponse
    expect(response.status()).toBe(401)

    // We should still be on /login (no navigation on failed login).
    await expect(page).toHaveURL(/\/login(\?|$)/)

    // Auth token must not have been persisted.
    const token = await page.evaluate(() => window.localStorage.getItem('auth-storage'))
    if (token) {
      const parsed = JSON.parse(token) as { state?: { token?: string | null } }
      expect(parsed.state?.token ?? null).toBeNull()
    }
  })
})
