import { expect, type Locator, type Page } from '@playwright/test'

/**
 * /orders/confirmation/:id — heading "Order Confirmed!", monospace
 * order id, status badge, and links to Order History / Home.
 */
export class ConfirmationPage {
  readonly page: Page
  readonly heading: Locator
  readonly viewOrderHistory: Locator
  readonly orderMoreFood: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.getByRole('heading', { name: 'Order Confirmed!' })
    this.viewOrderHistory = page.getByRole('link', { name: 'View Order History' })
    this.orderMoreFood = page.getByRole('link', { name: 'Order More Food' })
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/orders\/confirmation\/.+/)
    await expect(this.heading).toBeVisible()
  }

  /** Pull the order id out of the URL (last path segment). */
  orderIdFromUrl(): string {
    const match = this.page.url().match(/\/orders\/confirmation\/([^/?#]+)/)
    return match?.[1] ?? ''
  }
}
