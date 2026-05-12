# Docker Compose — Local Development Setup

## Overview

A single `docker-compose.yml` at the project root brings up all five containers (Postgres + three app services) with one command for local development. Each service mounts its source directory and uses its existing hot-reload mechanism.

## Services

| Service | Image | Port | Hot-reload mechanism |
|---|---|---|---|
| `postgres` | `postgres:16-alpine` | 5432 | — |
| `backend` | `node:24-alpine` | 3000 | ts-node-dev `--respawn` |
| `frontend` | `node:24-alpine` | 5173 | Vite HMR |
| `chatbot` | `python:3.11-slim` | 8002 | uvicorn `--reload` |

## Networking

All containers join a single bridge network `restaurant-net`. Services communicate by container name (e.g., `backend` reaches Postgres at `postgres:5432`, chatbot reaches backend at `http://backend:3000/api/v1`).

## Volumes

- Named volume `pg-data` mounts to `/var/lib/postgresql/data` — persists DB data across `docker compose down` restarts.
- `backend/docker/init.sql` bind-mounted into `/docker-entrypoint-initdb.d/` on Postgres so a fresh volume is seeded automatically.
- Each app service bind-mounts its source directory (`./backend`, `./frontend`, `./ai/service-chatbot`) to the working directory inside the container so file changes are reflected immediately without rebuilding.
- `node_modules` for backend and frontend are kept inside the container via anonymous volumes to avoid host/container conflicts.

## Environment Variables

Each service reads its own existing `.env` file via `env_file`. No root-level `.env` is introduced.

- `postgres` — credentials set inline via `POSTGRES_*` environment keys (matching the value already in `backend/.env`).
- `backend` — `env_file: backend/.env`; `DATABASE_URL` hostname changes from `localhost` to `postgres`.
- `frontend` — `env_file: frontend/.env` (create if absent); no required vars for local dev beyond Vite defaults.
- `chatbot` — `env_file: ai/service-chatbot/.env`; `BACKEND_API_URL` changes from `http://localhost:3000/api/v1` to `http://backend:3000/api/v1`.

## Startup Order

`backend` and `chatbot` declare `depends_on: postgres`. `frontend` has no dependency. For local dev no healthcheck is added — `depends_on` start-order is sufficient.

## Required Config Changes

1. **`backend/.env`** — change `DATABASE_URL` host from `localhost` to `postgres`.
2. **`ai/service-chatbot/.env`** — change `BACKEND_API_URL` host from `localhost` to `backend`.
3. **`frontend/vite.config.ts`** — add `server: { host: true }` so Vite binds to `0.0.0.0` inside the container and is reachable at `localhost:5173` on the host.

## File Layout

```
online-restaurant/
├── docker-compose.yml          ← new
├── backend/
│   ├── .env                    ← update DATABASE_URL host → postgres
│   └── docker/init.sql         ← existing, mounted into Postgres
├── frontend/
│   └── vite.config.ts          ← add server.host: true
└── ai/
    └── service-chatbot/
        └── .env                ← update BACKEND_API_URL host → backend
```

## Usage

```bash
# Start everything
docker compose up

# Start in background
docker compose up -d

# Tear down (keeps pg-data volume)
docker compose down

# Tear down + wipe DB
docker compose down -v
```
