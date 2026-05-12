import { test, expect } from '@playwright/test'
import { HomePage } from '../pages/HomePage'
import { RestaurantPage } from '../pages/RestaurantPage'
import { CartDrawer } from '../pages/CartDrawer'
import { LoginPage } from '../pages/LoginPage'
import { CheckoutPage } from '../pages/CheckoutPage'
import { ConfirmationPage } from '../pages/ConfirmationPage'
import { DEFAULT_ADDRESS, makeUniqueUser } from '../fixtures/test-data'

test.describe('Order happy path: home → menu → cart → auth → order', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      try {
        window.localStorage.clear()
      } catch {
        /* ignore */
      }
    })
  })

  test('a fresh user can place an order end-to-end', async ({ page }) => {
    const home = new HomePage(page)
    const restaurant = new RestaurantPage(page)
    const cart = new CartDrawer(page)
    const login = new LoginPage(page)
    const checkout = new CheckoutPage(page)
    const confirmation = new ConfirmationPage(page)
    const user = makeUniqueUser()

    // 1. Pre-register the user (drives the auth.spec scenario too).
    //    We do it via the UI so the same code path runs as in real use.
    await login.goto()
    await login.register(user)
    await page.waitForURL('**/', { timeout: 10_000 })
    await expect(page.getByRole('link', { name: user.name })).toBeVisible()

    // 2. Open the first restaurant.
    await home.openFirstRestaurant()
    await expect(restaurant.addButtons().first()).toBeVisible()

    // 3. Add one item with default quantity (1).
    await restaurant.openFirstItemModal()
    await restaurant.confirmAddToCart()

    // 4. Cart badge should read 1.
    await expect.poll(() => cart.badgeCount(), { timeout: 5_000 }).toBe(1)

    // 5. Open drawer → proceed to checkout.
    await cart.open()
    await cart.proceedToCheckout()
    await checkout.expectLoaded()

    // 6. Fill in the delivery address and place the order.
    await checkout.fillAddress(DEFAULT_ADDRESS)
    await checkout.placeOrder()

    // 7. Confirmation page renders with the order id captured from the URL.
    await page.waitForURL(/\/orders\/confirmation\/.+/, { timeout: 15_000 })
    await confirmation.expectLoaded()
    const orderId = confirmation.orderIdFromUrl()
    expect(orderId.length).toBeGreaterThan(0)

    // 8. The post-order CTAs should be visible.
    await expect(confirmation.viewOrderHistory).toBeVisible()
    await expect(confirmation.orderMoreFood).toBeVisible()
  })
})
