import { test, expect } from '@playwright/test'
import { HomePage } from '../pages/HomePage'

test.describe('Home page', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      try {
        window.localStorage.clear()
      } catch {
        /* localStorage not available — ignore */
      }
    })
  })

  test('renders hero, search bar and at least one restaurant card', async ({ page }) => {
    const home = new HomePage(page)
    await home.goto()

    await expect(
      page.getByRole('heading', { name: /Order food from the/i }),
    ).toBeVisible()
    await expect(home.searchInput).toBeVisible()

    // Wait for cards to load from the API.
    const cards = home.cards()
    await expect(cards.first()).toBeVisible()
    expect(await cards.count()).toBeGreaterThanOrEqual(1)
  })

  test('search narrows results to "Burger House"', async ({ page }) => {
    const home = new HomePage(page)
    await home.goto()
    await expect(home.cards().first()).toBeVisible()

    await home.search('Burger')

    // The Burger House card stays visible, and the total count drops to 1.
    await expect(home.card('Burger House')).toBeVisible()
    await expect(home.cards()).toHaveCount(1)
  })
})
