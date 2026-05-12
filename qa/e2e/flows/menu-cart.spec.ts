import { test, expect } from '@playwright/test'
import { HomePage } from '../pages/HomePage'
import { RestaurantPage } from '../pages/RestaurantPage'
import { CartDrawer } from '../pages/CartDrawer'

test.describe('Menu → cart interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      try {
        window.localStorage.clear()
      } catch {
        /* ignore */
      }
    })
  })

  test('add item with quantity 2, badge updates, drawer shows row, then clear cart', async ({
    page,
  }) => {
    const home = new HomePage(page)
    const restaurant = new RestaurantPage(page)
    const cart = new CartDrawer(page)

    // 1. Go to first restaurant.
    await home.goto()
    await home.openFirstRestaurant()
    await expect(restaurant.addButtons().first()).toBeVisible()

    // 2. Open the first menu item, capture its name, add once. Then
    //    re-open the modal and add again — this verifies that adding the
    //    same item increments the existing line.
    //    NOTE: the modal exposes a qty stepper, but cartStore.addItem
    //    currently ignores the passed-in quantity and always stores 1
    //    (then +1 per subsequent add). See QA findings doc.
    await restaurant.openFirstItemModal()
    const itemName = (await restaurant.modalTitle.textContent())?.trim() ?? ''
    expect(itemName).not.toBe('')
    await restaurant.confirmAddToCart()
    await expect.poll(() => cart.badgeCount(), { timeout: 5_000 }).toBe(1)

    await restaurant.openItemModal(itemName)
    await restaurant.confirmAddToCart()

    // 3. Badge should report 2 after the second add.
    await expect.poll(() => cart.badgeCount(), { timeout: 5_000 }).toBe(2)

    // 4. Open the drawer; the row for this item should be present and
    //    the drawer should advertise a Total / Proceed to Checkout CTA.
    await cart.open()
    await expect(cart.drawer.getByText(itemName, { exact: true })).toBeVisible()
    await expect(cart.drawer.getByText('Total', { exact: true })).toBeVisible()
    await expect(cart.checkoutButton).toBeVisible()

    // 5. Clear cart → empty state.
    await cart.clear()
    await expect(cart.checkoutButton).toBeHidden()
    await expect.poll(() => cart.badgeCount(), { timeout: 5_000 }).toBe(0)
  })
})
