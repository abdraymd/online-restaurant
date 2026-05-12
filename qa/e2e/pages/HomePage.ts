import { expect, type Locator, type Page } from '@playwright/test'

/**
 * Home page (/): hero, search bar, RestaurantGrid of cards.
 * Each card is `role="button"` with `aria-label="View {name}"` and
 * navigates to /restaurants/:id on click.
 */
export class HomePage {
  readonly page: Page
  readonly searchInput: Locator
  readonly resultsHeading: Locator

  constructor(page: Page) {
    this.page = page
    this.searchInput = page.getByRole('textbox', { name: 'Search restaurants' })
    this.resultsHeading = page.getByRole('heading', { level: 2 })
  }

  async goto() {
    await this.page.goto('/')
    await expect(this.searchInput).toBeVisible()
  }

  /** All restaurant cards currently rendered in the grid. */
  cards(): Locator {
    return this.page.getByRole('button', { name: /^View / })
  }

  /** A specific card by visible restaurant name. */
  card(name: string): Locator {
    return this.page.getByRole('button', { name: `View ${name}` })
  }

  async openRestaurant(name: string) {
    await this.card(name).click()
    await this.page.waitForURL(/\/restaurants\//)
  }

  /** Click the first restaurant card and wait for the restaurant page. */
  async openFirstRestaurant() {
    const first = this.cards().first()
    await first.waitFor({ state: 'visible' })
    await first.click()
    await this.page.waitForURL(/\/restaurants\//)
  }

  /**
   * The search input is debounced (300ms); type then wait briefly for
   * the query to be reflected in the URL.
   */
  async search(query: string) {
    await this.searchInput.fill(query)
    await this.page
      .waitForURL((url) => url.searchParams.get('search') === query, { timeout: 5_000 })
      .catch(() => {
        // Fallback for empty queries: URL may not update synchronously.
      })
  }
}
