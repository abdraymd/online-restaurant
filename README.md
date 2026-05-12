# Online Restaurant

An online restaurant ordering platform. Users browse a list of restaurants, view menus, and place orders. AI features layer on top: semantic search, an ordering chatbot, review sentiment analysis, upsell suggestions, and personalized recommendations.

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
| AI | Python 3.11, FastAPI, OpenAI (GPT-4o, GPT-4o-mini, text-embedding-3-small), Chroma, `implicit` (ALS) |
| QA | Jest, Supertest, Vitest, Playwright, Newman, k6, axe-core, OWASP ZAP |

## AI Services

| # | Service | Port | Purpose |
|---|---------|------|---------|
| 1 | Semantic Search | 8001 | Embedding-based menu / restaurant search |
| 2 | Chatbot Ordering Assistant | 8002 | Natural-language ordering with function calling |
| 3 | Review Sentiment Analysis | 8003 | Classify reviews + extract themes |
| 4 | Smart Upsell Engine | 8004 | "Customers who ordered X also ordered Y" |
| 5 | Personalized Recommendations | 8005 | ALS collaborative filtering |

## Quick Start

See [INSTALL.md](INSTALL.md) for full setup instructions, environment variables, and Docker Compose commands.

## Environment Variables

Each track keeps its own `.env` (gitignored) plus a committed `.env.example` template:

- `backend/.env` — `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `PORT`
- `frontend/.env.local` — `VITE_API_BASE_URL`
- `ai/service-*/.env` — `OPENAI_API_KEY`, `SERVICE_KEY`, `BACKEND_API_URL`, `PORT`
- `qa/.env.test` — `API_BASE_URL`, test DB URL, test user credentials

## Status

Planning phase complete. Each engineer works independently from their track's `PLAN.md`. No source code has been written yet — each track starts at Phase 1 of its plan.
