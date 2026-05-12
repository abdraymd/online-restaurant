/**
 * Test data helpers — pure utilities, no Playwright deps.
 * Used by specs to generate unique users and reference seed data.
 */

export interface TestUser {
  name: string
  email: string
  password: string
}

/**
 * Open (non-Closed) restaurants seeded in Postgres.
 * `rest_005` exists in the DB but is Closed — avoid using it.
 */
export const OPEN_RESTAURANTS = [
  { id: 'rest_001', name: 'Burger House' },
  { id: 'rest_002', name: 'Sushi Garden' },
  { id: 'rest_003', name: 'Pizza Palace' },
  { id: 'rest_004', name: 'Lagman House' },
] as const

export const CLOSED_RESTAURANT = { id: 'rest_005', name: 'Closed Cafe' } as const

/** Default delivery address — well above the 10-char min the form requires. */
export const DEFAULT_ADDRESS = 'Almaty, Abay Ave 100, apt 42'

/**
 * Build a fresh user object. Email is unique per call so that re-running
 * a test against the same dev DB never collides on the email index.
 */
export function makeUniqueUser(prefix = 'qa'): TestUser {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  return {
    name: `QA ${suffix}`,
    email: `${prefix}-${suffix}@test.com`,
    password: 'Test1234!',
  }
}
