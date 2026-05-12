import { expect, type Locator, type Page } from '@playwright/test'

/**
 * /checkout — CheckoutForm with address (required, min 10 chars) +
 * optional note. Submit button reads "Place Order".
 * If the user is not authenticated, the route redirects to
 * /login?redirect=/checkout (handled by AuthGuard).
 */
export class CheckoutPage {
  readonly page: Page
  readonly address: Locator
  readonly note: Locator
  readonly placeOrderButton: Locator

  constructor(page: Page) {
    this.page = page
    this.address = page.locator('#address')
    this.note = page.locator('#note')
    this.placeOrderButton = page.getByRole('button', { name: 'Place Order' })
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/checkout(\?|$)/)
    await expect(this.address).toBeVisible()
  }

  async fillAddress(value: string) {
    await this.address.fill(value)
  }

  async fillNote(value: string) {
    await this.note.fill(value)
  }

  async placeOrder() {
    await this.placeOrderButton.click()
  }
}
