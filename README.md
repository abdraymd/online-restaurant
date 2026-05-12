# Online Restaurant

An online restaurant ordering platform. Users browse restaurants, view menus, manage carts, place orders, and use an AI ordering assistant. Planned AI features include semantic search, review sentiment analysis, upsell suggestions, and personalized recommendations.

The project is split across four independent tracks, one per engineer. Each track has its own folder and a detailed `PLAN.md`.

## Repository Layout

```
online-restaurant/
├── backend/    Node.js + Express + TypeScript + Prisma + PostgreSQL — REST API on :3000
├── frontend/   React + Vite + TypeScript + Tailwind + shadcn/ui — web app on :5173
├── ai/         Python + FastAPI microservices — 5 services on :8001–:8005
└── qa/         Jest + Supertest + Newman + Playwright + k6 + OWASP ZAP
```

| Track | Plan | Owner |
|-------|------|-------|
| Backend API | [backend/PLAN.md](backend/PLAN.md) | Back-end Engineer |
| Frontend Web | [frontend/PLAN.md](frontend/PLAN.md) | Front-end Engineer |
| AI Services | [ai/PLAN.md](ai/PLAN.md) | AI Engineer |
| QA & Testing | [qa/PLAN.md](qa/PLAN.md) | Q&A Engineer |

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
| QA | Jest, Supertest, Vitest, Playwright, Newman, k6, axe-core, OWASP ZAP |

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
- **AI protocol:** [ai/service-chatbot/ai_Dana.md](ai/service-chatbot/ai_Dana.md)

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

## Quick Start

See [INSTALL.md](INSTALL.md) for full setup instructions, environment variables, and Docker Compose commands.

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

Backend, frontend, and the AI chatbot MVP have working implementations. The remaining AI services in `ai/PLAN.md` are planned or future work unless their service folders contain completed implementations.
