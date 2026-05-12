# Online Restaurant

An online restaurant ordering platform. Users browse restaurants, view menus, manage carts, place orders, and use an AI ordering assistant. Planned AI features include semantic search, review sentiment analysis, upsell suggestions, and personalized recommendations.

The project is split across four independent tracks, one per engineer. Each track has its own folder and a detailed `PLAN.md`.

## Repository Layout

```
online-restaurant/
├── backend/    Node.js + Express + TypeScript + Prisma + PostgreSQL — REST API on :3000
├── frontend/   React + Vite + TypeScript + Tailwind + shadcn/ui — web app on :5173
├── ai/         Python + FastAPI microservices — 5 services on :8001–:8005 (chatbot implemented on :8002)
├── qa/         Playwright E2E suite (10 specs, green) — broader Jest/Newman/k6/ZAP plan in qa/PLAN.md
└── ai-rules/   Per-engineer rule files (frontend, backend, ai, qa)
```

| Track | Plan | Rules | Owner |
|-------|------|-------|-------|
| Backend API | [backend/PLAN.md](backend/PLAN.md) | [ai-rules/backend_Dastan.md](ai-rules/backend_Dastan.md) | Dastan |
| Frontend Web | [frontend/PLAN.md](frontend/PLAN.md) | [ai-rules/frontend_Arman.md](ai-rules/frontend_Arman.md) | Arman |
| AI Services | [ai/PLAN.md](ai/PLAN.md) | [ai-rules/ai_Dana.md](ai-rules/ai_Dana.md) | Dana |
| QA & Testing | [qa/PLAN.md](qa/PLAN.md) | [ai-rules/qa_Timerlan.md](ai-rules/qa_Timerlan.md) | Tim |

## Architecture

```
┌──────────────┐         ┌──────────────┐         ┌──────────────────────┐
│  Frontend    │ ──────▶ │   Backend    │ ──────▶ │   AI Services        │
│  React :5173 │         │ Express :3000│         │  FastAPI :8001–:8005 │
└──────────────┘         └──────┬───────┘         └──────────────────────┘
                                │
                                ▼
                         ┌──────────────┐
                         │  PostgreSQL  │
                         │     :5432    │
                         └──────────────┘
```

- The frontend talks only to the backend.
- The backend proxies AI requests; AI services are never called directly from the browser.
- AI services authenticate to the backend with a shared `X-Service-Key` header.

## Tech Stack Summary

| Layer | Choices |
|-------|---------|
| Backend | Node.js 20, Express 4, TypeScript 5, Prisma 5, PostgreSQL 16, JWT + bcrypt, Zod, Vitest |
| Frontend | React 18, Vite, TypeScript, Tailwind v3, shadcn/ui, Zustand, TanStack Query, React Router v6, React Hook Form + Zod, Axios |
| AI | Python 3.11, FastAPI, Uvicorn, LangChain, OpenAI (GPT-4o, GPT-4o-mini, text-embedding-3-small), Chroma, `implicit` (ALS) |
| QA | Playwright 1.60 + TypeScript (in place). Jest, Supertest, Vitest, Newman, k6, axe-core, OWASP ZAP planned per `qa/PLAN.md` |

## AI Services

| # | Service | Port | Purpose |
|---|---------|------|---------|
| 1 | Semantic Search | 8001 | Embedding-based menu / restaurant search |
| 2 | Chatbot Ordering Assistant | 8002 | Implemented MVP: natural-language ordering with LangChain tools |
| 3 | Review Sentiment Analysis | 8003 | Classify reviews + extract themes |
| 4 | Smart Upsell Engine | 8004 | "Customers who ordered X also ordered Y" |
| 5 | Personalized Recommendations | 8005 | ALS collaborative filtering |

### Implemented AI Chatbot MVP

The chatbot assistant is currently implemented end-to-end.

- **Frontend page:** `http://localhost:5173/ai-assistant`
- **Frontend API helper:** `frontend/src/api/ai.ts`
- **Backend proxy:** `POST /api/v1/ai/chatbot/chat`
- **AI service:** `POST http://localhost:8002/chat`
- **Service docs:** [ai/service-chatbot/README.md](ai/service-chatbot/README.md)
- **AI protocol:** [ai/service-chatbot/ai_protocol.md](ai/service-chatbot/ai_protocol.md)

Current chatbot capabilities:

- Search menu items for a selected restaurant.
- Fetch restaurant details.
- Maintain a per-session in-memory AI cart.
- Add items to the AI cart.
- Show the AI cart.
- Place an order through the backend after confirmation.
- Forward signed-in user auth from backend to protected order routes.

Current limitations:

- The AI cart is separate from the standard frontend cart.
- AI session state is in memory and resets when the AI service restarts.
- Menu search, restaurant details, and order placement require a valid `restaurantId`.
- Order placement may require login depending on backend auth rules.

## QA / E2E Testing

A Playwright suite covers the two implemented user flows end-to-end:

| Iteration | Specs | Coverage |
|---|---|---|
| 1 — Purchase | `qa/e2e/flows/{home,menu-cart,auth,order}.spec.ts` | home → menu → cart → auth → checkout → order confirmation |
| 2 — AI chatbot | `qa/e2e/flows/ai-chat.spec.ts` | `/ai-assistant` page → `/api/v1/ai/chatbot/chat` → LangChain agent → tool calls |

**Run** (with the docker-compose stack already up):

```bash
cd qa
npm install
npx playwright install chromium
npx playwright test                 # 10/10 green in ~25s
QA_VIDEO=on npx playwright test     # also writes per-spec webm under qa/test-results/
```

**Deliverables**

- Notion report: [QA — E2E Testing](https://www.notion.so/QA-E2E-Testing-home-menu-cart-auth-order-35e4aac848fc813296b0f3c40e9f0ba0) — test cases, run results, QA findings (bugs).
- Walkthroughs (slowed 2×, H.264 MP4, no audio): `qa/walkthrough.mp4` (purchase flow) and `qa/walkthrough-ai.mp4` (AI chatbot).
- Procedure: [`ai-rules/qa_Timerlan.md`](ai-rules/qa_Timerlan.md).

**Notable QA findings (not patched — hands-off policy):**

- **BUG-001 (P0, backend)** — `backend/docker/init.sql` is missing the `User` table and the `Order.userId` column. `/auth/register` 500s until the dev DB is synced with `docker compose exec backend npx prisma db push --accept-data-loss`.
- **BUG-002 (P2, frontend)** — `cartStore.addItem` ignores the modal's quantity stepper; always stores `1` then `+1` per repeat add.
- **BUG-003 (P3, frontend)** — login error toast reads `response.data.message` but the backend returns the message under `response.data.error.message`; users always see the generic fallback string.

## Quick Start

See [INSTALL.md](INSTALL.md) for full setup instructions, environment variables, and Docker Compose commands.

The simplest path is Docker Compose from the repo root:

```bash
docker compose up -d
```

This launches Postgres, the backend (`:3000`), the frontend (`:5173`), and the chatbot service (`:8002`). The DB is auto-seeded with 5 restaurants on first start.

For local development without Docker, run the main services in separate terminals:

```bash
cd backend
npm run dev
```

```bash
cd ai/service-chatbot
python3 -m uvicorn main:app --reload --port 8002
```

```bash
cd frontend
npm run dev
```

## Environment Variables

Each track keeps its own `.env` (gitignored) plus a committed `.env.example` template:

- `backend/.env` — `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `PORT`, `AI_CHATBOT_URL`, `SERVICE_KEY`
- `frontend/.env` — `VITE_API_BASE_URL`
- `ai/.env` — optional shared `OPENAI_API_KEY`
- `ai/service-*/.env` — `OPENAI_API_KEY`, `SERVICE_KEY`, `BACKEND_API_URL`, `PORT`
- `qa/.env.test` — `API_BASE_URL`, test DB URL, test user credentials

For the chatbot, `backend/.env` `SERVICE_KEY` must match `ai/service-chatbot/.env` `SERVICE_KEY`. The frontend must call the backend only; OpenAI and service keys must never be exposed to the browser.

## Status

Implemented end-to-end and exercised by the Playwright suite:

- Backend REST API (`/api/v1/{auth,restaurants,menu-items,orders,users,ai/chatbot}`).
- Frontend pages: home, restaurant detail, cart drawer, login/register, checkout, order confirmation, order history, AI assistant.
- AI chatbot MVP (`ai/service-chatbot/`) on `:8002`.

Planned / future work (per `ai/PLAN.md` and `qa/PLAN.md`):

- Remaining four AI services (semantic search, sentiment, upsell, recommendations).
- Broader QA tiers: unit (Jest/Vitest), integration (Supertest), API contract (Newman), performance (k6), accessibility (axe-core), security (OWASP ZAP).
