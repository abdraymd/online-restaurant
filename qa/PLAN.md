# QA Engineering Plan — Online Restaurant Ordering Platform

**Author**: Q&A Engineer (solo, AI-assisted / vibecoding)  
**Scope**: REST API + React frontend + AI microservices

---

## 1. QA Strategy Overview

### Testing Pyramid

```
        [E2E — Playwright]           ← fewest, most realistic
       [API Contract — Newman]       ← full endpoint coverage
      [Integration — Supertest]      ← service + DB wiring
     [Unit — Jest / Vitest]          ← most, fastest feedback
```

### Testing Types

| Type | Tool | What It Covers | Target |
|------|------|----------------|--------|
| Unit (backend) | Jest | Pure functions, validators, pricing logic | 80%+ line coverage |
| Unit (frontend) | Vitest + Testing Library | Components, hooks | 80%+ line coverage |
| Integration | Jest + Supertest | API routes wired to real test DB | All happy + error paths |
| API contract | Newman (Postman) | Full REST contract, auth flows | 100% of documented endpoints |
| E2E UI | Playwright | Full user journeys in browser | All critical flows |
| Accessibility | axe-playwright | WCAG 2.1 AA | Every page |
| Performance | k6 | Latency SLA, load, spike | p95 < 200 ms |
| Security | OWASP ZAP | Auth bypass, injection, rate limiting | OWASP API Top 10 |
| AI quality | Jest + manual | Search relevance, recommendation quality | Defined thresholds |

### Quality Gates (all must pass before merge to main)

- Unit + integration tests green, coverage >= 80%
- All Newman collections: 0 failures
- Playwright E2E: 0 failures on Chrome + Firefox
- k6 smoke test: p95 < 200 ms
- ZAP baseline scan: 0 HIGH severity alerts

---

## 2. Tech Stack

### Backend / API Testing
- **Jest** ^29 — unit + integration test runner
- **Supertest** ^6 — HTTP assertions against Express app
- **Newman** ^6 — run Postman collections in CI
- **k6** ^0.50 — performance / load testing
- **faker-js** ^8 — synthetic test data

### Frontend / E2E Testing
- **Vitest** ^1 — unit tests for React components + hooks
- **@testing-library/react** ^14 — component rendering + interaction
- **@testing-library/user-event** ^14 — realistic user input simulation
- **Playwright** ^1.44 — cross-browser E2E automation
- **@axe-core/playwright** ^4 — accessibility assertions
- **MSW (Mock Service Worker)** ^2 — API mocking in component tests

### Security
- **OWASP ZAP** (Docker image) — automated baseline + active scan

### Reporting
- `jest-html-reporters` — HTML coverage report
- Playwright built-in HTML reporter
- k6 Web Dashboard — real-time performance metrics

---

## 3. Folder Structure

```
qa/
├── PLAN.md
├── package.json                     # QA-only dependencies
├── jest.config.js                   # Jest config (unit + integration)
├── vitest.config.ts                 # Vitest config (React components)
├── playwright.config.ts             # Playwright config
├── .env.test                        # Test env vars (gitignored)
├── .env.test.example                # Committed template
│
├── unit/
│   ├── backend/
│   │   ├── validators/
│   │   │   ├── order.validator.test.js
│   │   │   └── menu.validator.test.js
│   │   ├── services/
│   │   │   └── pricing.service.test.js
│   │   └── utils/
│   │       └── pagination.test.js
│   └── frontend/
│       ├── components/
│       │   ├── RestaurantCard.test.tsx
│       │   ├── MenuItemCard.test.tsx
│       │   └── OrderSummary.test.tsx
│       └── hooks/
│           ├── useCart.test.ts
│           └── useRestaurantSearch.test.ts
│
├── integration/
│   ├── setup/
│   │   ├── db.setup.js              # Seed + teardown test DB
│   │   └── app.setup.js             # Boot test instance of API
│   ├── auth.test.js
│   ├── restaurants.test.js
│   ├── menu.test.js
│   ├── orders.test.js
│   └── ai-search.test.js
│
├── api/
│   ├── collections/
│   │   ├── auth.collection.json
│   │   ├── restaurants.collection.json
│   │   ├── menu.collection.json
│   │   ├── orders.collection.json
│   │   └── ai.collection.json
│   ├── environments/
│   │   ├── local.env.json
│   │   └── staging.env.json
│   └── scripts/
│       └── run-newman.sh
│
├── performance/
│   ├── scripts/
│   │   ├── smoke.js                 # 1 VU, 1 min — baseline
│   │   ├── load.js                  # 50 VUs, 10 min
│   │   └── stress.js                # ramp to 500 VUs
│   └── thresholds.js                # Shared SLA config
│
├── e2e/
│   ├── fixtures/
│   │   ├── users.ts
│   │   └── test-data.ts
│   ├── pages/                       # Page Object Models
│   │   ├── HomePage.ts
│   │   ├── RestaurantPage.ts
│   │   ├── CartPage.ts
│   │   ├── CheckoutPage.ts
│   │   └── LoginPage.ts
│   ├── flows/
│   │   ├── browse-and-order.spec.ts
│   │   ├── auth.spec.ts
│   │   ├── search.spec.ts
│   │   └── ai-recommendations.spec.ts
│   └── accessibility/
│       └── axe-audit.spec.ts
│
├── security/
│   ├── zap-baseline.sh
│   └── zap-active.sh                # Full scan (staging only)
│
└── reports/                         # gitignored — generated output
    ├── jest/
    ├── playwright/
    ├── k6/
    └── zap/
```

---

## 4. Test Cases

### 4.1 API Endpoints

#### Auth (`/api/v1/auth`)

| ID | Test Case | Method + Path | Expected |
|----|-----------|---------------|----------|
| AUTH-01 | Register with valid data | POST /auth/register | 201, `{ id, email, token }`, no password in response |
| AUTH-02 | Register with duplicate email | POST /auth/register | 409 Conflict |
| AUTH-03 | Register with invalid email format | POST /auth/register | 400, validation error on `email` |
| AUTH-04 | Register with password < 8 chars | POST /auth/register | 400, validation error on `password` |
| AUTH-05 | Login with correct credentials | POST /auth/login | 200, returns JWT |
| AUTH-06 | Login with wrong password | POST /auth/login | 401 |
| AUTH-07 | Login with non-existent email | POST /auth/login | 401 (must not leak user existence) |
| AUTH-08 | Access protected route without token | GET /orders | 401 |
| AUTH-09 | Access protected route with expired token | GET /orders | 401 |
| AUTH-10 | Access protected route with malformed JWT | GET /orders | 401 |
| AUTH-11 | Brute force — 10 rapid login attempts | POST /auth/login ×10 | 429 on 6th+ attempt |
| AUTH-12 | SQL injection in email field | POST /auth/login | 400 or 401, never 500 |

#### Restaurants (`/api/v1/restaurants`)

| ID | Test Case | Method + Path | Expected |
|----|-----------|---------------|----------|
| REST-01 | List — default page | GET /restaurants | 200, `{ data, meta: { page, limit, total } }` |
| REST-02 | Pagination page 2 | GET /restaurants?page=2&limit=10 | 200, correct slice |
| REST-03 | Filter by `isOpen=true` | GET /restaurants?isOpen=true | 200, all results have `isOpen: true` |
| REST-04 | Search by name | GET /restaurants?search=pizza | 200, relevant results |
| REST-05 | Get single restaurant | GET /restaurants/:id | 200, full object with menuItems |
| REST-06 | Get with invalid ID | GET /restaurants/invalid-id | 400 or 404 |
| REST-07 | Get non-existent restaurant | GET /restaurants/nonexistent | 404 |
| REST-08 | Response has required fields | GET /restaurants/:id | `id, name, address, isOpen, menuItems` present |

#### Menu (`/api/v1/restaurants/:id/menu-items`)

| ID | Test Case | Method + Path | Expected |
|----|-----------|---------------|----------|
| MENU-01 | Get full menu | GET /restaurants/:id/menu-items | 200, array of items |
| MENU-02 | Items have required fields | GET /restaurants/:id/menu-items | Each has `id, name, price, isAvailable` |
| MENU-03 | Filter available only | GET /restaurants/:id/menu-items?isAvailable=true | No unavailable items |
| MENU-04 | Get menu for non-existent restaurant | GET /restaurants/999/menu-items | 404 |
| MENU-05 | Empty menu returns array not null | GET /restaurants/:id/menu-items | 200, `data: []` |
| MENU-06 | Prices are positive numbers | GET /restaurants/:id/menu-items | All `price` > 0 |
| MENU-07 | Filter by category | GET /restaurants/:id/menu-items?category=Burgers | Only Burgers category |

#### Orders (`/api/v1/orders`)

| ID | Test Case | Method + Path | Expected |
|----|-----------|---------------|----------|
| ORD-01 | Create order with valid items | POST /orders | 201, `{ id, status: "PENDING", totalPrice }` |
| ORD-02 | Create order — unauthenticated | POST /orders | 401 |
| ORD-03 | Create order with empty items array | POST /orders | 400 |
| ORD-04 | Create order with invalid item ID | POST /orders | 400 or 404 |
| ORD-05 | Create order with quantity 0 | POST /orders | 400 |
| ORD-06 | Create order with unavailable item | POST /orders | 409 |
| ORD-07 | Price is server-calculated | POST /orders | Total matches server price, ignores any client-supplied price |
| ORD-08 | Get own orders list | GET /orders | 200, only authenticated user's orders |
| ORD-09 | Access another user's order | GET /orders/:otherId | 403 |
| ORD-10 | Get order detail | GET /orders/:id | 200, full order with items array |
| ORD-11 | Valid status transition | PATCH /orders/:id/status | PENDING→CONFIRMED succeeds |
| ORD-12 | Invalid status transition | PATCH /orders/:id/status | 400 or 409 |
| ORD-13 | Items must belong to specified restaurant | POST /orders | 400 if mixing restaurants |

---

### 4.2 UI Flows (Playwright E2E)

#### Flow 1 — Browse Restaurants and Place Order (Happy Path)
```
1. Navigate to "/"
2. Assert restaurant list renders (>= 1 card visible)
3. Assert card shows: name, open/closed badge
4. Click restaurant card → assert detail page loads with menu
5. Assert menu items display: name, price, "Add to Cart" button
6. Click "Add to Cart" on one item → assert cart badge shows "1"
7. Add second item (qty 2) → assert cart badge shows "3"
8. Open cart drawer → assert items, quantities, subtotal are correct
9. Click "Proceed to Checkout"
10. Fill delivery address form
11. Click "Place Order"
12. Assert order confirmation page shows order ID and "PENDING" status
```

#### Flow 2 — Authentication
```
1. Navigate to "/login"
2. Submit with invalid email → assert inline validation error
3. Submit with valid credentials → assert redirect to "/"
4. Assert user name appears in navbar
5. Navigate to "/orders" → assert order history visible
6. Logout → assert redirect to "/login"
7. Navigate to "/checkout" while logged out → assert redirect to "/login"
```

#### Flow 3 — Search and Filter
```
1. Type "pizza" in search bar
2. Assert URL updates to "/?search=pizza"
3. Assert only matching restaurants shown
4. Toggle "Open Now" filter → assert only open restaurants shown
5. Clear search → assert all restaurants restored
```

#### Flow 4 — Empty and Error States
```
1. Search "xyznonexistent" → assert "No restaurants found" empty state (not blank)
2. Simulate API failure via Playwright route abort
3. Assert error message or toast appears
4. Assert "Retry" button visible and functional
```

#### Flow 5 — Accessibility Audit
```
1. Run axe-core on: homepage, restaurant detail, cart drawer, checkout, login
2. Assert zero WCAG 2.1 AA violations on each page
3. Assert all interactive elements reachable via keyboard Tab
```

---

### 4.3 AI Features

#### Semantic Search

| ID | Test Case | What to Validate |
|----|-----------|-----------------|
| AI-01 | Relevant results | Query "spicy noodles" returns noodle/Asian results, not unrelated |
| AI-02 | Typo tolerance | Query "burguer" returns burger results |
| AI-03 | Empty query | Returns 200 with default list, not error |
| AI-04 | Response time | p95 < 500 ms |
| AI-05 | Schema validation | Returns same shape as REST restaurant list |
| AI-06 | Prompt injection | Input "ignore previous instructions..." → normal response, no data leak |
| AI-07 | Offensive input | Profanity → 400 with safe error, no crash |

#### Recommendations

| ID | Test Case | What to Validate |
|----|-----------|-----------------|
| REC-01 | Personalized for known user | Different results for users with different order history |
| REC-02 | Cold start (new user) | Returns fallback popular items, not empty or 500 |
| REC-03 | Unauthenticated request | Returns generic popular items (not 401) |
| REC-04 | No unavailable items | Items with `isAvailable: false` never appear |
| REC-05 | Score field present | Each recommendation has `score` between 0 and 1 |

#### AI Quality Thresholds (tracked over time)

- Search precision@5: >= 0.8
- Search p95 latency: < 500 ms
- Recommendation click-through (simulated): >= 0.3

---

## 5. Implementation Order

### Phase 0 — QA Scaffold (Day 1)
1. `mkdir qa && cd qa && npm init -y`
2. Install all QA dependencies
3. Create `jest.config.js`, `vitest.config.ts`, `playwright.config.ts`
4. Create `.env.test.example`:
   ```
   API_BASE_URL=http://localhost:3000/api/v1
   TEST_USER_EMAIL=qa@test.com
   TEST_USER_PASSWORD=Test1234!
   TEST_DB_URL=postgresql://...
   ```
5. Create full folder structure
6. Write one placeholder passing test per subfolder
7. Verify: `npm test` passes

### Phase 1 — Unit Tests — Backend (Days 2–3)
8. `unit/backend/validators/order.validator.test.js` — all field validations
9. `unit/backend/validators/menu.validator.test.js`
10. `unit/backend/services/pricing.service.test.js` — price calculation
11. `unit/backend/utils/pagination.test.js` — edge cases
12. Run: `npm run test:unit:backend` — coverage >= 80%

### Phase 2 — Unit Tests — Frontend (Days 3–4)
13. `unit/frontend/hooks/useCart.test.ts` — add/remove/update/clear/total
14. `unit/frontend/hooks/useRestaurantSearch.test.ts` — debounce, filter state
15. `unit/frontend/components/RestaurantCard.test.tsx`
16. `unit/frontend/components/MenuItemCard.test.tsx` — "Add to Cart" callback
17. `unit/frontend/components/OrderSummary.test.tsx` — correct totals

### Phase 3 — Integration Tests (Days 4–6)
18. `integration/setup/db.setup.js` — seed test DB with fixtures
19. `integration/setup/app.setup.js` — boot API in test mode
20. Write `auth.test.js` — AUTH-01 through AUTH-12
21. Write `restaurants.test.js` — REST-01 through REST-08
22. Write `menu.test.js` — MENU-01 through MENU-07
23. Write `orders.test.js` — ORD-01 through ORD-13
24. Write `ai-search.test.js` — AI-01 through AI-07

### Phase 4 — Newman API Collections (Day 7)
25. Create Postman collections for all 5 endpoint groups
26. Add pre-request scripts for auth token injection
27. Add `pm.test` assertions matching test cases from Section 4.1
28. Export as JSON to `api/collections/`
29. Write `api/scripts/run-newman.sh`
30. Run: `bash api/scripts/run-newman.sh` — 0 failures

### Phase 5 — Playwright E2E (Days 8–10)
31. Write all Page Object Models in `e2e/pages/`
32. Write `e2e/flows/auth.spec.ts` (Flow 2)
33. Write `e2e/flows/browse-and-order.spec.ts` (Flow 1 — critical)
34. Write `e2e/flows/search.spec.ts` (Flow 3)
35. Add error state tests (Flow 4) to browse-and-order spec
36. Write `e2e/accessibility/axe-audit.spec.ts` (Flow 5)
37. Write `e2e/flows/ai-recommendations.spec.ts`
38. Run: `npx playwright test --project=chromium` then `--project=firefox`

### Phase 6 — Performance (Days 10–11)
39. Write `performance/thresholds.js` — shared SLA config
40. Write `performance/scripts/smoke.js` — 1 VU, 60s, all critical endpoints
41. Run smoke test: `k6 run performance/scripts/smoke.js` — all thresholds pass
42. Write `performance/scripts/load.js` — 50 VUs, 10 min
43. Document p95 latency results in `qa/reports/k6/`

### Phase 7 — Security (Day 12)
44. Write `security/zap-baseline.sh` (Docker ZAP baseline scan)
45. Run: `bash security/zap-baseline.sh`
46. Fix any HIGH severity findings
47. Re-run scan — assert 0 HIGH alerts

### Phase 8 — CI Integration (Day 13)
48. Create `.github/workflows/qa.yml` (see Section 6)
49. Add branch protection rules requiring all jobs to pass

---

## 6. CI Integration (GitHub Actions)

Create `.github/workflows/qa.yml` at the repo root:

```yaml
name: QA Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
        working-directory: qa
      - run: npm run test:unit -- --coverage
        working-directory: qa
      - uses: actions/upload-artifact@v4
        with:
          name: unit-coverage
          path: qa/reports/jest/

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: restaurant_test
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
        ports: ["5432:5432"]
        options: --health-cmd pg_isready --health-interval 10s --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm ci
        working-directory: qa
      - run: npm run start:test &
        env: { NODE_ENV: test }
      - run: npx wait-on http://localhost:3000/health --timeout 30000
        working-directory: qa
      - run: npm run test:integration
        working-directory: qa

  e2e-tests:
    runs-on: ubuntu-latest
    needs: integration-tests
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
        working-directory: qa
      - run: npx playwright install --with-deps chromium firefox
        working-directory: qa
      - run: docker compose -f docker-compose.test.yml up -d
      - run: npx wait-on http://localhost:3000 http://localhost:5173 --timeout 60000
        working-directory: qa
      - run: npx playwright test
        working-directory: qa
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: qa/reports/playwright/

  performance-smoke:
    runs-on: ubuntu-latest
    needs: integration-tests
    steps:
      - uses: actions/checkout@v4
      - name: Install k6
        run: |
          sudo gpg --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
          echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
          sudo apt-get update && sudo apt-get install k6
      - run: npm run start:test &
      - run: k6 run qa/performance/scripts/smoke.js

  security-scan:
    runs-on: ubuntu-latest
    needs: integration-tests
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - run: npm run start:test &
      - uses: zaproxy/action-baseline@v0.12.0
        with:
          target: http://localhost:3000
          fail_action: true
```

**Branch protection**: require `unit-tests`, `integration-tests`, `e2e-tests`, `performance-smoke` to pass before merging any PR to main.

---

## 7. Running Tests Locally

### Prerequisites
```
node >= 20, npm >= 10, Docker, k6
```

### One-time setup
```bash
cd qa
npm install
cp .env.test.example .env.test   # fill in real values
npx playwright install --with-deps
```

### Individual suites
```bash
# Unit tests
npm run test:unit:backend
npm run test:unit:frontend
npm run test:unit -- --coverage

# Integration tests (requires running API + Postgres)
npm run test:integration

# Watch mode
npm run test:unit -- --watch

# Newman API collections
bash api/scripts/run-newman.sh

# E2E (requires full stack)
npx playwright test
npx playwright test --headed           # see the browser
npx playwright test --ui               # interactive debugger
npx playwright test --project=firefox

# Performance
k6 run performance/scripts/smoke.js
k6 run performance/scripts/load.js
k6 run --out web-dashboard performance/scripts/load.js

# Security (requires Docker)
bash security/zap-baseline.sh

# Run everything
npm run test:all
```

### `qa/package.json` scripts
```json
{
  "scripts": {
    "test": "npm run test:unit && npm run test:integration",
    "test:unit": "jest --config jest.config.js",
    "test:unit:backend": "jest --testPathPattern=unit/backend",
    "test:unit:frontend": "vitest run",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:perf:smoke": "k6 run performance/scripts/smoke.js",
    "test:api": "bash api/scripts/run-newman.sh",
    "test:all": "npm test && npm run test:api && npm run test:e2e"
  }
}
```

---

## SLA Reference

| Metric | Threshold | Tool |
|--------|-----------|------|
| API p95 response time | < 200 ms | k6 |
| AI endpoint p95 response time | < 500 ms | k6 |
| API error rate under load | < 0.1% | k6 |
| Unit + integration coverage | >= 80% | Jest |
| E2E pass rate | 100% | Playwright |
| OWASP HIGH alerts | 0 | ZAP |
| AI search precision@5 | >= 0.8 | custom script |
| Full CI suite time | < 15 min | GitHub Actions |
