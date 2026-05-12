# online-restaurant — QA (Playwright E2E)

End-to-end tests for the **online-restaurant** project. Two iterations
ship today:

1. Purchase flow — `home → menu → cart → auth → order` (6 specs).
2. AI chatbot — `/ai-assistant` page + LangChain agent on `:8002` (4 specs).

## Deliverables

- **Notion report** — [QA — E2E Testing](https://www.notion.so/QA-E2E-Testing-home-menu-cart-auth-order-35e4aac848fc813296b0f3c40e9f0ba0) (child of the *Online restaurant* page). Test cases, run results, QA findings (bugs), how-to-run.
- **Walkthroughs** — slowed-2× H.264 MP4, no audio, Telegram-friendly:
  - `qa/walkthrough.mp4` (~36 s) — purchase flow.
  - `qa/walkthrough-ai.mp4` (~22 s) — AI chatbot interactions.
  Both produced by `QA_VIDEO=on npm run test:e2e` then ffmpeg `setpts=2.0*PTS` + `libx264 -movflags +faststart`.
- **Procedure doc** — `../ai-rules/qa_Timerlan.md`. Steps taken, rules followed, MCPs/tools used, data flow through the project.

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
├── walkthrough.mp4            # purchase-flow walkthrough
├── walkthrough-ai.mp4         # AI-chatbot walkthrough
└── e2e/
    ├── fixtures/
    │   └── test-data.ts        # unique user generator + constants
    ├── pages/                  # Page Object Models
    │   ├── HomePage.ts
    │   ├── RestaurantPage.ts
    │   ├── CartDrawer.ts
    │   ├── LoginPage.ts
    │   ├── CheckoutPage.ts
    │   ├── ConfirmationPage.ts
    │   └── AiAssistantPage.ts
    └── flows/
        ├── home.spec.ts
        ├── menu-cart.spec.ts
        ├── auth.spec.ts
        ├── order.spec.ts
        └── ai-chat.spec.ts
```

## AI chatbot notes

The `ai-chat.spec.ts` suite hits real OpenAI (`gpt-4o`). Each run costs
real tokens. Keep the count low and the assertions lenient:

- Tests wait on the `POST /api/v1/ai/chatbot/chat` response (30 s timeout)
  and assert on the JSON shape, not the rendered reply text.
- AI-03 (tool-calling) reads `response.cart` and checks for `item_001`
  (Classic Burger) — the LLM may phrase the reply many different ways.
- AI-04 only exercises a UI suggestion button — no LLM call.

Required env (in `ai/service-chatbot/.env`): `OPENAI_API_KEY`,
`SERVICE_KEY` (must match `backend/.env`).

## Conventions

- **No `data-testid` in the app yet** — POMs target ARIA roles, labels
  and visible text. If selectors get brittle, prefer adding semantic
  `aria-label`s in the app over `data-testid`.
- Each spec clears `localStorage` in `beforeEach` (auth & cart state
  persist via Zustand).
- Unique users per test: `qa-${Date.now()}-${randomSuffix}@test.com`.
