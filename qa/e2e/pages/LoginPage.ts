import { expect, type Locator, type Page } from '@playwright/test'
import type { TestUser } from '../fixtures/test-data'

/**
 * /login — two-tab form (Sign In / Register).
 * Inputs: #login-email, #login-password, #reg-name, #reg-email, #reg-password.
 * Submit buttons: "Sign In", "Create Account".
 */
export class LoginPage {
  readonly page: Page
  readonly signInTab: Locator
  readonly registerTab: Locator

  readonly loginEmail: Locator
  readonly loginPassword: Locator
  readonly signInSubmit: Locator

  readonly regName: Locator
  readonly regEmail: Locator
  readonly regPassword: Locator
  readonly createAccountSubmit: Locator

  constructor(page: Page) {
    this.page = page
    this.signInTab = page.getByRole('button', { name: 'Sign In', exact: true })
    this.registerTab = page.getByRole('button', { name: 'Register', exact: true })

    this.loginEmail = page.locator('#login-email')
    this.loginPassword = page.locator('#login-password')
    this.signInSubmit = page.getByRole('button', { name: 'Sign In', exact: true })

    this.regName = page.locator('#reg-name')
    this.regEmail = page.locator('#reg-email')
    this.regPassword = page.locator('#reg-password')
    this.createAccountSubmit = page.getByRole('button', { name: 'Create Account' })
  }

  async goto(redirect?: string) {
    const url = redirect
      ? `/login?redirect=${encodeURIComponent(redirect)}`
      : '/login'
    await this.page.goto(url)
    await expect(this.loginEmail).toBeVisible()
  }

  /**
   * The "Sign In" label appears on both the tab and the submit button.
   * `signInTab.first()` resolves to the tab; clicking it switches the form.
   */
  async switchToRegister() {
    await this.registerTab.click()
    await expect(this.regName).toBeVisible()
  }

  async switchToSignIn() {
    await this.signInTab.first().click()
    await expect(this.loginEmail).toBeVisible()
  }

  async login(email: string, password: string) {
    await this.loginEmail.fill(email)
    await this.loginPassword.fill(password)
    // The visible "Sign In" submit button is the second match (after the tab).
    await this.signInSubmit.last().click()
  }

  async register(user: TestUser) {
    await this.switchToRegister()
    await this.regName.fill(user.name)
    await this.regEmail.fill(user.email)
    await this.regPassword.fill(user.password)
    await this.createAccountSubmit.click()
  }
}
