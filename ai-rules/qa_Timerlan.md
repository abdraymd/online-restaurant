# QA Procedure — Tim

This file is the rule + procedure document for the QA engineer on the **online-restaurant** project. It captures the *how* — what folders to touch, what tools to reach for, what data flows through the system, and the concrete steps that produced the current Playwright suite.

Notion page with the live test report:
**[QA — E2E Testing](https://www.notion.so/QA-E2E-Testing-home-menu-cart-auth-order-35e4aac848fc813296b0f3c40e9f0ba0)** (parent: *Online restaurant*).

---

## Role

QA is the single owner of the `qa/` folder. Output is:

1. **Playwright autotests** under `qa/e2e/` driving the FoodHub UI end-to-end.
2. **Process docs** — this file + the QA Notion page.
3. **Walkthrough video** of the suite running (out of scope for this iteration, but the suite is configured to capture `video: retain-on-failure` so a failed run produces one automatically).

The current scope is the critical purchase flow: **home → menu → cart → auth → order**. The AI chatbot (`ai/service-chatbot/`) is intentionally not covered yet.

## Hard rules

- **Hands-off folders: `ai/`, `backend/`, `frontend/`.** I read these to understand selectors, schemas, and API contracts, but never edit them. Bugs found in other tracks are filed (see "QA findings" in the Notion page), not patched.
- **All writes live in `qa/` and `ai-rules/qa_Timerlan.md`.** `qa/PLAN.md` is the broader strategy and is not rewritten by routine work — it's the long-term plan; this doc is the operating manual.
- **Data-only operations against the running stack are OK** (e.g. `docker compose exec backend npx prisma db push` to align the dev DB with the Prisma schema when the seed script is out of sync) — that's not a code change.
- Generate **fresh data per test run** (unique emails per registration) so reruns against the same DB don't collide.

## Tools and MCPs used to produce the suite

| Tool / MCP | What it did |
|---|---|
| `Read` / `Grep` / `Bash` | Read frontend source (routes, components, Zustand stores) and backend source (Express routers, Zod schemas, Prisma schema, init.sql) to derive selectors and contracts. |
| `qa-expert` agent | Scaffolded the `qa/` Playwright project: `package.json`, `playwright.config.ts`, `tsconfig.json`, `.gitignore`, `.env.test.example`, `README.md`, all POMs under `e2e/pages/`, and all specs under `e2e/flows/`. Given the analyzed selectors + flow as input. |
| `Bash` (docker compose) | Verified the stack was running (`docker compose ps`), inspected backend logs to root-cause the register 500 (`docker compose logs backend`), and ran the one-shot DB schema sync (`docker compose exec backend npx prisma db push`). |
| `playwright` CLI (via Bash) | Installed Chromium (`npx playwright install chromium`), executed the suite (`npx playwright test`), iterated on failing specs. The Playwright MCP browser tools were not needed once `@playwright/test` was driving real runs. |
| `notionApi` MCP | Searched for the existing "Online restaurant" page, created a child page **QA — E2E Testing**, and populated it with structured content via `API-patch-block-children`. Note: the MCP only ships paragraph + bulleted_list block types, so sections are paragraphs in ALL-CAPS rather than real headings. |
| `filesystem` MCP | Available but not needed — `Read`/`Edit`/`Write` covered the file work directly. |
| `context7` MCP | On standby for Playwright/Prisma API lookups; current version (Playwright 1.60, Prisma 7) didn't need it. |

## Data flow through the project (single order placement)

```
┌─────────┐    GET /restaurants            ┌──────────┐    SQL      ┌──────────┐
│ Browser │ ─────────────────────────────▶ │ Express  │ ──────────▶ │ Postgres │
│ (5173)  │ ◀───────── JSON ──────────────│  (3000)  │ ◀──────────│ (5432)   │
└─────────┘                                └──────────┘             └──────────┘
     │
     │ user clicks card → /restaurants/:id
     │ GET /restaurants/:id, GET /restaurants/:id/menu-items
     │
     │ Add to Cart → useCartStore.addItem()
     │   ↳ writes localStorage["cart-storage"]
     │   ↳ pins restaurantId; switching restaurants clears the cart
     │
     │ /checkout → if !token → /login?redirect=/checkout
     │
     │ POST /auth/register or /auth/login
     │   ↳ backend bcrypt hash + Prisma User upsert
     │   ↳ returns { user, token }; token persisted to localStorage["auth-storage"]
     │
     │ POST /orders   Bearer <token>
     │   body: { restaurantId, items: [{menuItemId, quantity}], note? }
     │   ↳ orders.service validates items belong to restaurant + isAvailable
     │   ↳ recomputes totalPrice server-side (ignores any client price)
     │   ↳ Prisma $transaction: insert Order + OrderItem rows
     │   ↳ 201 with full order incl. items
     │
     ▼
  /orders/confirmation/:id   ← GET /orders/:id (auth required, owner-check 403s others)
```

Key invariants the tests rely on:

- **Auth state** lives in `localStorage["auth-storage"]` (Zustand persist).
- **Cart state** lives in `localStorage["cart-storage"]`. Clearing it between tests via `page.addInitScript(() => localStorage.clear())` keeps specs hermetic.
- **Order pricing** is server-side. Tests never assert client-derived totals; they assert the confirmation page renders.
- **Seed data**: 4 open restaurants (rest_001..rest_004) + 1 closed (rest_005). Burger House is the only restaurant whose name starts with "Burger" — that's what HOME-02 leans on.

## Procedure (the literal sequence that built the suite)

1. **Survey scope** — read `qa/PLAN.md`, `AGENTS.md`, `INSTALL.md` to understand ownership, the broader QA strategy, and the docker-compose contract.
2. **Map the focused flow** — read these files (read-only, hands-off folders): `frontend/src/App.tsx` (routes); `pages/HomePage.tsx`, `RestaurantPage.tsx`, `LoginPage.tsx`, `CheckoutPage.tsx`, `OrderConfirmationPage.tsx`; `components/menu/MenuItemCard.tsx`, `MenuItemModal.tsx`; `components/cart/CartDrawer.tsx`; `components/order/CheckoutForm.tsx`; `components/shared/Navbar.tsx`; `store/cartStore.ts`, `store/authStore.ts`; `api/client.ts`. On the backend: `app.ts`, `modules/auth/*`, `modules/orders/*`, `modules/restaurants/*`, `modules/menu-items/*`, `prisma/schema.prisma`, `docker/init.sql`.
3. **Verify stack is running** — `docker compose ps`, then `curl http://localhost:3000/health` and `curl http://localhost:5173`. If down, `docker compose up -d`.
4. **Hand off scaffolding to `qa-expert` agent** with the analyzed selector map and constraints. The agent writes the POMs and specs via Bash heredocs.
5. **Install Playwright** — `cd qa && npm install && npx playwright install chromium`.
6. **First run** — `npx playwright test`. Read failures, look at `qa/test-results/<spec>/error-context.md` (Playwright auto-generates this with the failing locator + page snapshot) and the captured screenshot + webm.
7. **Diagnose** — for each failure, decide: is it a test bug (fix the spec) or a product bug (file as QA finding, work around if possible)? Record the verdict.
8. **Iterate** — `rm -rf qa/test-results && npx playwright test` until green. Aim for 0 flakes, deterministic data.
9. **Document** — Notion page (test cases, findings, run results) + this file (procedure).

## Things that bit me on this iteration

- **`waitForURL('**/')` is unreliable** — use a concrete path or regex (`'/'` relative to `baseURL`, or `/\/$/`).
- **Sonner toasts disappear in ~4 s** — asserting on toast text races the dismissal. Watch the underlying network response with `page.waitForResponse` for negative-auth assertions instead.
- **`init.sql` and `prisma/schema.prisma` drift** — the seeded DB had only `Restaurant`, `MenuItem`, `Order`, `OrderItem`. No `User` table, no `Order.userId` column. Filed as BUG-001 (P0); worked around with `prisma db push --accept-data-loss` in the running backend container.
- **Cart quantity stepper is decorative** — `cartStore.addItem` ignores the modal's `quantity` and always stores 1 (then +1 per repeat add). Filed as BUG-002 (P2); test reaches qty=2 by clicking Add twice.

## Where things live

| Thing | Location |
|---|---|
| Playwright config | `qa/playwright.config.ts` |
| Page Object Models | `qa/e2e/pages/` |
| Specs | `qa/e2e/flows/` |
| Test data helpers | `qa/e2e/fixtures/test-data.ts` |
| HTML report | `qa/playwright-report/index.html` (after a run) |
| Failure artefacts | `qa/test-results/<spec>/` (screenshot, video, error-context.md) |
| Broader QA strategy | `qa/PLAN.md` |
| This procedure | `ai-rules/qa_Timerlan.md` |
| Public-facing report | Notion page **QA — E2E Testing** under *Online restaurant* |
