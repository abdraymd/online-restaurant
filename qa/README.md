# online-restaurant — QA (Playwright E2E)

End-to-end tests for the **online-restaurant** project, scoped to the
`home → menu → cart → auth → order` user flow. AI-chatbot flows are
intentionally out of scope.

## Prerequisites

The full Docker dev stack must already be running on the host before you
launch tests. From the repo root:

```bash
docker compose up -d
```

Expected services:

| Service  | URL                                |
| -------- | ---------------------------------- |
| Frontend | http://localhost:5173              |
| Backend  | http://localhost:3000/api/v1       |
| Postgres | localhost:5432 (seeded restaurants)|

Seeded restaurants used by tests: `rest_001` Burger House, `rest_002`
Sushi Garden, `rest_003` Pizza Palace, `rest_004` Lagman House
(`rest_005` is Closed and not exercised).

## Install

```bash
cd qa
npm install
npx playwright install chromium
```

Optionally copy the env template if you want to override the defaults:

```bash
cp .env.test.example .env.test
```

> The Playwright config does **not** spin up `webServer`; it expects the
> stack to already be live on the URLs above.

## Run

```bash
npm run test:e2e          # headless run, list + html reporter
npm run test:e2e:headed   # see the browser
npm run test:e2e:ui       # Playwright UI mode
npm run report            # open the last HTML report
```

## Layout

```
qa/
├── playwright.config.ts
├── tsconfig.json
├── package.json
└── e2e/
    ├── fixtures/
    │   └── test-data.ts        # unique user generator + constants
    ├── pages/                  # Page Object Models
    │   ├── HomePage.ts
    │   ├── RestaurantPage.ts
    │   ├── CartDrawer.ts
    │   ├── LoginPage.ts
    │   ├── CheckoutPage.ts
    │   └── ConfirmationPage.ts
    └── flows/
        ├── home.spec.ts
        ├── menu-cart.spec.ts
        ├── auth.spec.ts
        └── order.spec.ts
```

## Conventions

- **No `data-testid` in the app yet** — POMs target ARIA roles, labels
  and visible text. If selectors get brittle, prefer adding semantic
  `aria-label`s in the app over `data-testid`.
- Each spec clears `localStorage` in `beforeEach` (auth & cart state
  persist via Zustand).
- Unique users per test: `qa-${Date.now()}-${randomSuffix}@test.com`.
