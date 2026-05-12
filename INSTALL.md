# Installation & Setup

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose v2)

## 1. Environment files

Each service needs its own `.env` file. Copy the examples and fill in the required values.

### Backend

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and set:

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | yes | Change host from `localhost` → `postgres` for Docker |
| `JWT_SECRET` | yes | Min 32 characters, any random string |
| `SERVICE_KEY` | yes | Shared secret — must match `ai/service-chatbot/.env` |
| `AI_CHATBOT_URL` | yes | Change host from `localhost` → `chatbot` for Docker |

Docker-ready example:
```
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://postgres:password@postgres:5432/restaurant_db?schema=public"
JWT_SECRET="some_random_string_at_least_32_chars_long"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:5173"
AI_CHATBOT_URL="http://chatbot:8002"
SERVICE_KEY="my_shared_secret"
```

### AI Chatbot

```bash
cp ai/service-chatbot/.env.example ai/service-chatbot/.env
```

Open `ai/service-chatbot/.env` and set:

| Variable | Required | Notes |
|---|---|---|
| `OPENAI_API_KEY` | **yes** | Get from [platform.openai.com](https://platform.openai.com/api-keys) |
| `SERVICE_KEY` | yes | Must match `backend/.env` `SERVICE_KEY` |
| `BACKEND_API_URL` | yes | Change host from `localhost` → `backend` for Docker |

Docker-ready example:
```
OPENAI_API_KEY=sk-...
SERVICE_KEY=my_shared_secret
BACKEND_API_URL=http://backend:3000/api/v1
PORT=8002
OPENAI_CHAT_MODEL=gpt-4o
```

### Frontend

```bash
cp frontend/.env.example frontend/.env
```

The default values work as-is for local Docker development (backend is reachable at `localhost:3000` from the browser).

## 2. Start everything

```bash
docker compose up
```

First run pulls images and installs dependencies — takes a few minutes. Subsequent starts are fast.

To run in the background:

```bash
docker compose up -d
```

## 3. Verify

Once all services are running you should see:

| Service | URL | Ready when |
|---|---|---|
| Frontend | http://localhost:5173 | Vite prints `ready in Xms` |
| Backend API | http://localhost:3000 | Logs `Server running on port 3000` |
| Chatbot | http://localhost:8002/docs | Logs `Uvicorn running on http://0.0.0.0:8002` |
| Postgres | localhost:5432 | Logs `database system is ready to accept connections` |

The database is seeded automatically on first start (restaurants + menu items from `backend/docker/init.sql`).

## Common commands

```bash
# View logs for all services
docker compose logs -f

# View logs for one service
docker compose logs -f backend

# Restart a single service (e.g. after config change)
docker compose restart backend

# Stop all containers (keeps database data)
docker compose down

# Stop and wipe the database
docker compose down -v

# Rebuild after adding npm/pip packages
docker compose up --force-recreate backend
docker compose up --force-recreate chatbot
```

## Troubleshooting

**Port already in use**
Kill any local processes using ports 3000, 5173, 5432, or 8002 before running `docker compose up`.

```bash
# macOS / Linux
lsof -ti:3000,5173,5432,8002 | xargs kill -9
```

**Chatbot fails to start**
Most likely `OPENAI_API_KEY` is missing or invalid in `ai/service-chatbot/.env`.

**Backend can't connect to database**
Make sure `DATABASE_URL` in `backend/.env` uses `postgres` as the host (not `localhost`).

**Changes to `.env` files not picked up**
Restart the affected container: `docker compose restart <service>`.
