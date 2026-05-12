import { expect, type Locator, type Page } from '@playwright/test'

/**
 * AI Assistant page (/ai-assistant).
 *
 * Layout (from frontend/src/pages/AiAssistantPage.tsx):
 *   - <h1>AI Ordering Assistant</h1>
 *   - Welcome assistant bubble: "Hi! I can help you find dishes..."
 *   - Scrollable messages area, each bubble = div.max-w-[80%].rounded-2xl
 *   - Form: restaurantId <input> (placeholder), message <input> (placeholder),
 *     <button type="submit">Send|Sending</button>
 *   - Sidebar:
 *       <h2>AI Cart</h2> followed by a single <p> showing
 *         "Your AI cart is empty." OR a "{qty} × {name}" CSV list.
 *       <h2>Try asking</h2> with three preset buttons.
 *
 * Selectors prefer placeholder / role / text. Message bubbles are matched by
 * the deterministic Tailwind class `max-w-[80%]` on the bubble div — this is
 * stable enough because the only elements with that class are chat bubbles.
 */
export class AiAssistantPage {
  readonly page: Page
  readonly heading: Locator
  readonly welcomeMessage: Locator
  readonly restaurantIdInput: Locator
  readonly messageInput: Locator
  readonly sendButton: Locator
  readonly aiCartHeading: Locator
  readonly aiCartParagraph: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.getByRole('heading', { level: 1, name: 'AI Ordering Assistant' })
    this.welcomeMessage = page.getByText(/Hi! I can help you find dishes/i)
    this.restaurantIdInput = page.getByPlaceholder(
      'Optional restaurant ID for restaurant-specific orders',
    )
    this.messageInput = page.getByPlaceholder('Try: Find me a burger and a drink')
    this.sendButton = page.getByRole('button', { name: /^Send(ing)?$/ })

    this.aiCartHeading = page.getByRole('heading', { level: 2, name: 'AI Cart' })
    // DOM shape (AiAssistantPage.tsx):
    //   <div class="bg-white ... rounded-3xl p-5">  ← card
    //     <div class="flex items-center gap-2 mb-3">  ← heading wrapper
    //       <Icon /> <h2>AI Cart</h2>
    //     </div>
    //     <p>{cartSummary}</p>  ← the paragraph we want
    //   </div>
    // The cart <p> is the next sibling of the heading-wrapper, not a child of it.
    this.aiCartParagraph = this.aiCartHeading.locator(
      'xpath=ancestor::div[contains(@class, "flex")]/following-sibling::p[1]',
    )
  }

  async goto() {
    await this.page.goto('/ai-assistant')
    await expect(this.heading).toBeVisible()
  }

  async setRestaurantId(id: string) {
    await this.restaurantIdInput.fill(id)
  }

  async sendMessage(text: string) {
    await this.messageInput.fill(text)
    await this.sendButton.click()
  }

  /** Returns visible text of the AI cart sidebar paragraph. */
  async aiCartText(): Promise<string> {
    return (await this.aiCartParagraph.innerText()).trim()
  }

  /** Preset suggestion button under "Try asking" (exact text match). */
  presetButton(name: string): Locator {
    return this.page.getByRole('button', { name, exact: true })
  }

  /**
   * Chat message bubbles. Each bubble has Tailwind class `max-w-[80%]`,
   * which is unique to chat-message divs on this page.
   */
  messages(): Locator {
    return this.page.locator('div.max-w-\\[80\\%\\]')
  }

  async messagesCount(): Promise<number> {
    return this.messages().count()
  }
}
