import { test, expect, type Page, type Response } from '@playwright/test'
import { AiAssistantPage } from '../pages/AiAssistantPage'

/**
 * AI chatbot E2E coverage.
 *
 * Each chat send hits real OpenAI (gpt-4o), so:
 *   - tests are few and lean
 *   - assertions are lenient (regex/partial, not exact strings)
 *   - we always wait on the /api/v1/ai/chatbot/chat POST with 30s timeout
 *     instead of relying on DOM auto-wait
 */

/** Wait for the next chat POST response while sending a message. */
async function sendAndWait(
  page: Page,
  ai: AiAssistantPage,
  message: string,
): Promise<Response> {
  const waitForResp = page.waitForResponse(
    (r) =>
      r.url().includes('/api/v1/ai/chatbot/chat') && r.request().method() === 'POST',
    { timeout: 30_000 },
  )
  await ai.sendMessage(message)
  return waitForResp
}

test.describe('AI chatbot (/ai-assistant)', () => {
  test.beforeEach(async ({ page }) => {
    // Clear all client-side storage so each test gets a fresh chat session.
    await page.addInitScript(() => {
      try {
        window.localStorage.clear()
        window.sessionStorage.clear()
      } catch {
        /* storage not available — ignore */
      }
    })
  })

  test('AI-01 — Page renders heading, welcome message, and chat form', async ({
    page,
  }) => {
    const ai = new AiAssistantPage(page)
    await ai.goto()

    await expect(ai.heading).toBeVisible()
    await expect(ai.welcomeMessage).toBeVisible()
    await expect(ai.restaurantIdInput).toBeVisible()
    await expect(ai.messageInput).toBeVisible()
    await expect(ai.sendButton).toBeVisible()
    await expect(ai.aiCartHeading).toBeVisible()
  })

  test('AI-02 — Greeting round-trip returns 200 with empty cart', async ({
    page,
  }) => {
    test.setTimeout(60_000)
    const ai = new AiAssistantPage(page)
    await ai.goto()

    // Pre-send sanity: only the welcome assistant bubble is rendered.
    const initialCount = await ai.messagesCount()
    expect(initialCount).toBeGreaterThanOrEqual(1)

    const response = await sendAndWait(page, ai, 'Hi')
    expect(response.status()).toBe(200)

    const body = await response.json()
    expect(typeof body.reply).toBe('string')
    expect(body.reply.length).toBeGreaterThan(0)
    expect(body.cartUpdated).toBe(false)
    expect(Array.isArray(body.cart)).toBe(true)
    expect(body.cart.length).toBe(0)

    // After the round-trip we expect: welcome + user echo + assistant reply (>= 3).
    await expect
      .poll(() => ai.messagesCount(), { timeout: 10_000 })
      .toBeGreaterThanOrEqual(3)
  })

  test('AI-03 — Tool-calling: add to cart updates the AI cart sidebar', async ({
    page,
  }) => {
    test.setTimeout(60_000)
    const ai = new AiAssistantPage(page)
    await ai.goto()

    await ai.setRestaurantId('rest_001')

    const response = await sendAndWait(
      page,
      ai,
      'Please add one Classic Burger to my cart',
    )
    expect(response.status()).toBe(200)

    const body = await response.json()
    expect(Array.isArray(body.cart)).toBe(true)
    expect(body.cart.length).toBeGreaterThanOrEqual(1)
    const hasClassicBurger = body.cart.some(
      (item: { menuItemId?: string }) => item.menuItemId === 'item_001',
    )
    expect(hasClassicBurger).toBe(true)

    // Sidebar must re-render off `cartUpdated` — it should no longer say "empty".
    await expect
      .poll(async () => ai.aiCartText(), { timeout: 10_000 })
      .not.toMatch(/Your AI cart is empty\./i)
  })

  test('AI-04 — Preset suggestion populates the message input', async ({
    page,
  }) => {
    const ai = new AiAssistantPage(page)
    await ai.goto()

    await ai.presetButton('Show my cart').click()
    expect(await ai.messageInput.inputValue()).toBe('Show my cart')
  })
})
