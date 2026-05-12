import { expect, type Locator, type Page } from '@playwright/test'

/**
 * /restaurants/:id — menu items grouped by category. Clicking the per-card
 * "Add {name} to cart" button opens MenuItemModal (role=dialog,
 * aria-labelledby=modal-title) with a quantity stepper and a
 * "Add to Cart — $X.XX" button.
 */
export class RestaurantPage {
  readonly page: Page
  readonly modal: Locator
  readonly modalTitle: Locator
  readonly increaseQty: Locator
  readonly decreaseQty: Locator

  constructor(page: Page) {
    this.page = page
    this.modal = page.getByRole('dialog').filter({ has: page.locator('#modal-title') })
    this.modalTitle = page.locator('#modal-title')
    this.increaseQty = this.modal.getByRole('button', { name: 'Increase quantity' })
    this.decreaseQty = this.modal.getByRole('button', { name: 'Decrease quantity' })
  }

  /** All "Add … to cart" buttons in the menu list (not in the modal). */
  addButtons(): Locator {
    return this.page.getByRole('button', { name: /^Add .+ to cart$/ })
  }

  async openFirstItemModal() {
    const first = this.addButtons().first()
    await first.waitFor({ state: 'visible' })
    await first.click()
    await expect(this.modal).toBeVisible()
  }

  async openItemModal(itemName: string) {
    await this.page.getByRole('button', { name: `Add ${itemName} to cart` }).click()
    await expect(this.modal).toBeVisible()
  }

  /** Click "Add to Cart — $X.XX" inside the open modal. */
  async confirmAddToCart() {
    const confirm = this.modal.getByRole('button', { name: /^Add to Cart\b/ })
    await confirm.click()
    await expect(this.modal).toBeHidden()
  }

  async setQuantity(target: number) {
    if (target < 1) throw new Error(`Quantity must be >= 1, got ${target}`)
    // Quantity starts at 1 each time the modal opens.
    for (let i = 1; i < target; i++) {
      await this.increaseQty.click()
    }
  }
}
