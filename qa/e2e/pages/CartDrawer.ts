import { expect, type Locator, type Page } from '@playwright/test'

/**
 * Cart UI: a navbar button (aria-label starts with "Open cart") opens a
 * drawer (role=dialog, aria-label="Shopping cart"). Drawer contains:
 *   - per-item rows (CartItem)
 *   - "Clear cart" button when items > 0
 *   - "Your cart is empty" empty state
 *   - "Proceed to Checkout" link to /checkout
 */
export class CartDrawer {
  readonly page: Page
  readonly openButton: Locator
  readonly drawer: Locator
  readonly clearButton: Locator
  readonly checkoutButton: Locator
  readonly emptyState: Locator
  readonly closeButton: Locator

  constructor(page: Page) {
    this.page = page
    this.openButton = page.getByRole('button', { name: /^Open cart/ })
    this.drawer = page.getByRole('dialog', { name: 'Shopping cart' })
    this.clearButton = this.drawer.getByRole('button', { name: 'Clear cart' })
    this.checkoutButton = this.drawer.getByRole('link', { name: 'Proceed to Checkout' })
    this.emptyState = this.drawer.getByText('Your cart is empty')
    this.closeButton = this.drawer.getByRole('button', { name: 'Close cart' })
  }

  /**
   * Count of items shown in the navbar cart badge. Returns 0 if the
   * badge isn't rendered (no items). The button label is
   * `Open cart` or `Open cart, N items`.
   */
  async badgeCount(): Promise<number> {
    const label = (await this.openButton.getAttribute('aria-label')) ?? ''
    const match = label.match(/(\d+)\s+items?/)
    return match ? Number(match[1]) : 0
  }

  async open() {
    await this.openButton.click()
    await expect(this.drawer).toBeVisible()
  }

  async close() {
    await this.closeButton.click()
    await expect(this.drawer).toBeHidden()
  }

  /** Click the "Proceed to Checkout" link inside the drawer. */
  async proceedToCheckout() {
    await this.checkoutButton.click()
  }

  async clear() {
    await this.clearButton.click()
    await expect(this.emptyState).toBeVisible()
  }
}
