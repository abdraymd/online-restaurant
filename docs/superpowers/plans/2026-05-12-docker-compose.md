# Docker Compose Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a single `docker-compose.yml` at the project root that starts all services (Postgres, backend, frontend, chatbot) for local development with hot-reload.

**Architecture:** One bridge network `restaurant-net`; containers reach each other by service name. Postgres uses a named volume for persistence and mounts `init.sql` for fresh-DB seeding. App containers bind-mount their source directories; `node_modules` stay inside containers via anonymous volumes to avoid host/container conflicts.

**Tech Stack:** Docker Compose v2, postgres:16-alpine, node:24-alpine, python:3.11-slim, Vite HMR, ts-node-dev, uvicorn --reload

---

## File Map

| Action | Path |
|--------|------|
| Create | `docker-compose.yml` |
| Modify | `backend/.env` — change `DATABASE_URL` host `localhost` → `postgres` |
| Modify | `frontend/vite.config.ts` — add `server.host: true` |
| Create | `ai/service-chatbot/.env` — copy from `.env.example`, set `BACKEND_API_URL` host to `backend` |

---

### Task 1: Update `backend/.env` database host

**Files:**
- Modify: `backend/.env`

- [ ] **Step 1: Update DATABASE_URL**

Change the host in `backend/.env` from `localhost` to `postgres` (the compose service name):

```
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://postgres:password@postgres:5432/restaurant_db?schema=public"
JWT_SECRET="dev_secret_replace_in_production_min_32_chars_long"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:5173"
AI_CHATBOT_URL="http://chatbot:8002"
SERVICE_KEY="replace_with_shared_secret"
```

Note: also update `AI_CHATBOT_URL` host from `localhost` to `chatbot`.

- [ ] **Step 2: Commit**

```bash
git add backend/.env
git commit -m "chore(backend): point DATABASE_URL and AI_CHATBOT_URL to compose service names"
```

---

### Task 2: Create `ai/service-chatbot/.env`

**Files:**
- Create: `ai/service-chatbot/.env`

- [ ] **Step 1: Create the file**

```
OPENAI_API_KEY=sk-your-openai-key
SERVICE_KEY=replace_with_shared_secret
BACKEND_API_URL=http://backend:3000/api/v1
PORT=8002
OPENAI_CHAT_MODEL=gpt-4o
```

Replace `sk-your-openai-key` and `SERVICE_KEY` with real values if you have them — the chatbot won't start without a valid `OPENAI_API_KEY`.

- [ ] **Step 2: Verify `.env` is gitignored**

```bash
grep -r "\.env" /Users/abdraymd/Documents/pet/online-restaurant/.gitignore 2>/dev/null || \
grep -r "\.env" /Users/abdraymd/Documents/pet/online-restaurant/ai/service-chatbot/.gitignore 2>/dev/null
```

If `.env` is not gitignored, add it:

```bash
echo ".env" >> /Users/abdraymd/Documents/pet/online-restaurant/ai/service-chatbot/.gitignore
```

- [ ] **Step 3: Commit**

```bash
git add ai/service-chatbot/.gitignore
git commit -m "chore(chatbot): add .env with compose service URLs (OPENAI_API_KEY must be set)"
```

Do **not** commit `ai/service-chatbot/.env` itself.

---

### Task 3: Update Vite config to bind on all interfaces

**Files:**
- Modify: `frontend/vite.config.ts`

- [ ] **Step 1: Add `host: true` to server config**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
})
```

`host: true` makes Vite bind to `0.0.0.0` so the container port is reachable at `localhost:5173` on the host machine.

- [ ] **Step 2: Commit**

```bash
git add frontend/vite.config.ts
git commit -m "chore(frontend): bind Vite to 0.0.0.0 for Docker container access"
```

---

### Task 4: Write `docker-compose.yml`

**Files:**
- Create: `docker-compose.yml`

- [ ] **Step 1: Create the file**

```yaml
services:

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: restaurant_db
    volumes:
      - pg-data:/var/lib/postgresql/data
      - ./backend/docker/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    ports:
      - "5432:5432"
    networks:
      - restaurant-net

  backend:
    image: node:24-alpine
    working_dir: /app
    command: sh -c "npm install && npm run dev"
    volumes:
      - ./backend:/app
      - backend-modules:/app/node_modules
    env_file:
      - backend/.env
    ports:
      - "3000:3000"
    depends_on:
      - postgres
    networks:
      - restaurant-net

  frontend:
    image: node:24-alpine
    working_dir: /app
    command: sh -c "npm install && npm run dev"
    volumes:
      - ./frontend:/app
      - frontend-modules:/app/node_modules
    env_file:
      - frontend/.env
    ports:
      - "5173:5173"
    networks:
      - restaurant-net

  chatbot:
    image: python:3.11-slim
    working_dir: /app
    command: sh -c "pip install -r requirements.txt -q && uvicorn main:app --host 0.0.0.0 --port 8002 --reload"
    volumes:
      - ./ai/service-chatbot:/app
    env_file:
      - ai/service-chatbot/.env
    ports:
      - "8002:8002"
    depends_on:
      - postgres
    networks:
      - restaurant-net

volumes:
  pg-data:
  backend-modules:
  frontend-modules:

networks:
  restaurant-net:
    driver: bridge
```

> Note: `frontend/.env` may not exist yet. If it doesn't, create an empty one:
> ```bash
> touch frontend/.env
> ```

- [ ] **Step 2: Commit**

```bash
git add docker-compose.yml
git commit -m "feat: add docker-compose for local dev (all services + postgres)"
```

---

### Task 5: Smoke test

- [ ] **Step 1: Create empty `frontend/.env` if it doesn't exist**

```bash
touch /Users/abdraymd/Documents/pet/online-restaurant/frontend/.env
```

- [ ] **Step 2: Start all services**

```bash
docker compose up
```

Wait for all four services to log their ready messages:
- Postgres: `database system is ready to accept connections`
- Backend: `Server running on port 3000 [development]`
- Frontend: `VITE v5.x.x  ready in ...ms` and `➜  Local: http://localhost:5173/`
- Chatbot: `Uvicorn running on http://0.0.0.0:8002`

- [ ] **Step 3: Verify backend health**

```bash
curl -s http://localhost:3000/api/v1/restaurants | head -c 200
```

Expected: JSON array with restaurant data (seeded by `init.sql` on fresh volume).

- [ ] **Step 4: Verify frontend loads**

Open `http://localhost:5173` in a browser. The restaurant list page should render.

- [ ] **Step 5: Verify chatbot health**

```bash
curl -s http://localhost:8002/docs | head -c 100
```

Expected: HTML containing `Online Restaurant AI Chatbot`.

- [ ] **Step 6: Test hot-reload**

Make a trivial change to any backend `.ts` file (e.g. add a comment). The backend container log should show ts-node-dev restarting within ~2 seconds.

- [ ] **Step 7: Tear down**

```bash
docker compose down
```

Confirm all containers stopped. Run `docker compose down -v` only if you want to wipe the database volume too.
